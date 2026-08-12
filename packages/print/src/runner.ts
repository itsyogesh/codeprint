import { spawn } from "node:child_process"

const MAX_OUTPUT_BYTES = 1_000_000

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

export async function runCommand(command: string, args: string[], timeoutMs = 15_000): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false, stdio: ["ignore", "pipe", "pipe"] })
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    let outputBytes = 0
    let settled = false

    const timeout = setTimeout(() => {
      child.kill("SIGTERM")
      if (!settled) {
        settled = true
        reject(new Error(`${command} timed out after ${timeoutMs} ms.`))
      }
    }, timeoutMs)

    const collect = (target: Buffer[]) => (chunk: Buffer) => {
      outputBytes += chunk.byteLength
      if (outputBytes <= MAX_OUTPUT_BYTES) target.push(chunk)
    }

    child.stdout.on("data", collect(stdout))
    child.stderr.on("data", collect(stderr))
    child.on("error", (error) => {
      clearTimeout(timeout)
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
      if (settled) return
      settled = true
      const result = {
        stdout: Buffer.concat(stdout).toString("utf8").trim(),
        stderr: Buffer.concat(stderr).toString("utf8").trim(),
        exitCode: exitCode ?? 1,
      }
      if (outputBytes > MAX_OUTPUT_BYTES) {
        reject(new Error(`${command} produced more than ${MAX_OUTPUT_BYTES} bytes of output.`))
      } else {
        resolve(result)
      }
    })
  })
}

export async function runChecked(command: string, args: string[], timeoutMs?: number) {
  const result = await runCommand(command, args, timeoutMs)
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} exited with status ${result.exitCode}.`)
  }
  return result
}
