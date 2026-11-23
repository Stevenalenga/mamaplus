export type ModuleAuthoringMeta = {
  description: string
  isMilestone: boolean
}

export type LessonAuthoringMeta = {
  url: string
  isMilestone: boolean
}

const MODULE_PREFIX = '__module_meta__:'
const LESSON_PREFIX = '__lesson_meta__:'

export function encodeModuleDescription(description: string | undefined, isMilestone: boolean | undefined) {
  const payload: ModuleAuthoringMeta = {
    description: description?.trim() || '',
    isMilestone: !!isMilestone,
  }

  return `${MODULE_PREFIX}${JSON.stringify(payload)}`
}

export function decodeModuleDescription(value: string | null | undefined): ModuleAuthoringMeta {
  if (!value) {
    return { description: '', isMilestone: false }
  }

  if (!value.startsWith(MODULE_PREFIX)) {
    return { description: value, isMilestone: false }
  }

  try {
    const payload = JSON.parse(value.slice(MODULE_PREFIX.length)) as Partial<ModuleAuthoringMeta>
    return {
      description: payload.description || '',
      isMilestone: !!payload.isMilestone,
    }
  } catch {
    return { description: '', isMilestone: false }
  }
}

export function encodeLessonResourceMeta(url: string | undefined, isMilestone: boolean | undefined) {
  const payload: LessonAuthoringMeta = {
    url: url?.trim() || '',
    isMilestone: !!isMilestone,
  }

  return `${LESSON_PREFIX}${JSON.stringify(payload)}`
}

export function decodeLessonResourceMeta(value: string | null | undefined): LessonAuthoringMeta {
  if (!value) {
    return { url: '', isMilestone: false }
  }

  if (!value.startsWith(LESSON_PREFIX)) {
    return { url: '', isMilestone: false }
  }

  try {
    const payload = JSON.parse(value.slice(LESSON_PREFIX.length)) as Partial<LessonAuthoringMeta>
    return {
      url: payload.url || '',
      isMilestone: !!payload.isMilestone,
    }
  } catch {
    return { url: '', isMilestone: false }
  }
}
