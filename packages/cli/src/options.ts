import { InvalidArgumentError } from "commander"

export function integer(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || String(parsed) !== value.trim()) {
    throw new InvalidArgumentError("Expected a whole number.")
  }
  return parsed
}

export function choice<const Values extends readonly string[]>(values: Values) {
  return (value: string): Values[number] => {
    if (!values.includes(value)) throw new InvalidArgumentError(`Expected one of: ${values.join(", ")}.`)
    return value as Values[number]
  }
}
