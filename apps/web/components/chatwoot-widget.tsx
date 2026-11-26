'use client'

import { useEffect } from 'react'

const WEBSITE_TOKEN = 'CGkGooy3Zq97fvmGJhACAtXw'

declare global {
  interface Window {
    chatwootSettings?: {
      position: 'left' | 'right'
      type: 'standard' | 'expanded_bubble'
      launcherTitle: string
    }
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void
    }
  }
}

export function ChatwootWidget() {
  useEffect(() => {
    if (document.getElementById('chatwoot-sdk')) return

    const baseUrl = window.location.origin
    window.chatwootSettings = {
      position: 'right',
      type: 'standard',
      launcherTitle: '',
    }

    const script = document.createElement('script')
    script.id = 'chatwoot-sdk'
    script.src = `${baseUrl}/packs/js/sdk.js`
    script.async = true
    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken: WEBSITE_TOKEN,
        baseUrl,
      })
    }
    document.body.appendChild(script)
  }, [])

  return null
}
