export const SITE_NAME = "Codeprint"
export const SITE_URL = "https://codeprint.app"

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString()
}
