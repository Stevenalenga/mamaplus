/**
 * Expo Push Service helpers for MamaPlus.
 * Sends via https://exp.host/--/api/v2/push/send
 * (FCM/APNs delivery is handled by Expo once credentials are configured in EAS).
 */

export type ExpoPushMessage = {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  channelId?: string
  priority?: 'default' | 'normal' | 'high'
}

export type ExpoPushTicket = {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: { error?: string; [key: string]: unknown }
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export function isExpoPushToken(token: string): boolean {
  return (
    typeof token === 'string' &&
    (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['))
  )
}

export function chunkItems<T>(items: T[], size = 100): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function sendExpoPushMessages(
  messages: ExpoPushMessage[]
): Promise<{ tickets: ExpoPushTicket[]; successCount: number; failureCount: number }> {
  if (messages.length === 0) {
    return { tickets: [], successCount: 0, failureCount: 0 }
  }

  const tickets: ExpoPushTicket[] = []
  for (const batch of chunkItems(messages, 100)) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Expo Push API error (${response.status}): ${text || response.statusText}`)
    }

    const json = (await response.json()) as { data?: ExpoPushTicket[] }
    tickets.push(...(json.data ?? []))
  }

  const successCount = tickets.filter((t) => t.status === 'ok').length
  const failureCount = tickets.length - successCount
  return { tickets, successCount, failureCount }
}
