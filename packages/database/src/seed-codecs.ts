export function encodeStringList(items: string[]): string {
  const cleaned = items.map((item) => item.trim()).filter(Boolean)
  return JSON.stringify(cleaned)
}

const MODULE_PREFIX = '__module_meta__:'

export function encodeModuleDescription(description: string | undefined, isMilestone: boolean | undefined) {
  const payload = {
    description: description?.trim() || '',
    isMilestone: !!isMilestone,
  }

  return `${MODULE_PREFIX}${JSON.stringify(payload)}`
}
