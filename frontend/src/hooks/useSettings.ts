import { useState, useCallback } from 'react'
import { type Settings, DEFAULT_SETTINGS } from '../lib/types'

/**
 * Manages settings state.
 * `sendSettings` is called by the caller (useWebSocket) to push changes over WS.
 */
export function useSettings(sendSettings: (s: Settings) => void) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial }
        sendSettings(next)
        return next
      })
    },
    [sendSettings]
  )

  return { settings, updateSettings }
}
