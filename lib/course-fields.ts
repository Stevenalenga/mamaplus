export function encodeStringList(items: string[]): string {
  const cleaned = items.map((item) => item.trim()).filter(Boolean)
  return JSON.stringify(cleaned)
}

export function decodeStringList(value: string | null | undefined): string[] {
  if (!value?.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String)
  } catch {
    // fall through
  }
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function stringListToTextarea(items: string[]): string {
  return items.join('\n')
}

export function textareaToStringList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
