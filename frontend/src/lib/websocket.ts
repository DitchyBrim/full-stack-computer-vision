import { type DetectionMessage , type Settings} from './types'

const SEND_FPS = 10
const WS_URL = 'ws://localhost:8000/ws'

export type GrabFn = () => string | null

let ws: WebSocket | null = null
let intervalId: ReturnType<typeof setInterval> | null = null
let onDetectionsCallback: ((msg: DetectionMessage) => void) | null = null
let grabFn: GrabFn | null = null

// ── public API ─────────────────────────────────────────────

export function isConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN
}

export function setOnDetections(cb: (msg: DetectionMessage) => void): void {
  onDetectionsCallback = cb
}

export function setGrabFn(fn: GrabFn): void {
  grabFn = fn
}

export async function connect(): Promise<void> {
  console.log('[ws] pinging http://localhost:8000/health …')
  try {
    const res = await fetch('http://localhost:8000/health')
    const json = await res.json()
    console.log('[ws] health check passed', json)
  } catch {
    throw new Error('Backend is not reachable at localhost:8000 — is it running?')
  }

  return new Promise((resolve, reject) => {
    console.log('[ws] opening WebSocket to', WS_URL)
    ws = new WebSocket(WS_URL)
    let settled = false

    ws.onopen = () => {
      settled = true
      console.log('[ws] connected ✓')
      startSending()
      resolve()
    }

    ws.onerror = (event) => {
      console.error('[ws] error', event)
      if (!settled) {
        settled = true
        ws?.close()
        reject(new Error('WebSocket connection failed'))
      }
    }

    ws.onclose = (event) => {
      console.log('[ws] closed — code:', event.code)
      stopSending()
      ws = null
      if (!settled) {
        settled = true
        reject(new Error(`WebSocket closed (code ${event.code})`))
      }
    }

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: DetectionMessage = JSON.parse(event.data)
        onDetectionsCallback?.(msg)
      } catch {
        console.warn('[ws] malformed message', event.data)
      }
    }
  })
}

// send settings to backend as separate json message
export function sendSettings(settings: Settings): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[ws] sendSettings called but WS is not open — will apply on next connect')
    return
  }
  ws.send(JSON.stringify({ type: 'settings', ...settings }))
  console.log('[ws] settings sent', settings)
}

export function disconnect(): void {
  stopSending()
  if (ws) {
    ws.close()
    ws = null
  }
}

// ── internal ───────────────────────────────────────────────

function startSending(): void {
  if (intervalId) return
  intervalId = setInterval(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const frame = grabFn?.()
    if (!frame) {
      console.warn('[ws] grab returned null — video not ready?')
      return
    }
    ws.send(frame)
  }, 1000 / SEND_FPS)
}

function stopSending(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
