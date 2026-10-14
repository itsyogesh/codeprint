import { spawn } from "node:child_process"

const MAX_OUTPUT_BYTES = 1_000_000

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

export async function runCommand(
  command: string,
  args: string[],
  timeoutMs = 15_000,
  input?: Uint8Array,
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false, stdio: ["pipe", "pipe", "pipe"] })
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    let outputBytes = 0
    let settled = false
    let failure: Error | undefined
    let killTimeout: ReturnType<typeof setTimeout> | undefined

    const timeout = setTimeout(() => {
      failure = new Error(`${command} timed out after ${timeoutMs} ms.`)
      child.kill("SIGTERM")
      killTimeout = setTimeout(() => child.kill("SIGKILL"), 1_000)
      killTimeout.unref()
    }, timeoutMs)

    child.stdin.on("error", (error) => {
      failure ??= new Error(`${command} could not receive the approved PDF: ${error.message}`)
    })
    child.stdin.end(input)

    const collect = (target: Buffer[]) => (chunk: Buffer) => {
      outputBytes += chunk.byteLength
      if (outputBytes <= MAX_OUTPUT_BYTES) target.push(chunk)
    }

    child.stdout.on("data", collect(stdout))
    child.stderr.on("data", collect(stderr))
    child.on("error", (error) => {
      clearTimeout(timeout)
      clearTimeout(killTimeout)
      if (!settled) {
        settled = true
        reject(
          (error as NodeJS.ErrnoException).code === "ENOENT"
            ? new Error(`${command} is not installed or is not available on PATH.`)
            : error,
        )
      }
    })
    child.on("close", (exitCode) => {
      clearTimeout(timeout)
      clearTimeout(killTimeout)
      if (settled) return
      settled = true
      const result = {
        stdout: Buffer.concat(stdout).toString("utf8").trim(),
        stderr: Buffer.concat(stderr).toString("utf8").trim(),
        exitCode: exitCode ?? 1,
      }
      if (failure) {
        reject(failure)
      } else if (outputBytes > MAX_OUTPUT_BYTES) {
        reject(new Error(`${command} produced more than ${MAX_OUTPUT_BYTES} bytes of output.`))
      } else {
        resolve(result)
      }
    })
  })
}

export async function runChecked(command: string, args: string[], timeoutMs?: number, input?: Uint8Array) {
  const result = await runCommand(command, args, timeoutMs, input)
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} exited with status ${result.exitCode}.`)
  }
  return result
}
