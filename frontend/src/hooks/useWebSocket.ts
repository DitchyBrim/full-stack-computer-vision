import { useRef, useState, useCallback, useEffect } from 'react'
import { connect, disconnect, setOnDetections, setGrabFn, type GrabFn } from '../lib/websocket'
import { type DetectionMessage } from '../lib/types'

export function useWebSocket(
  onDetections: (msg: DetectionMessage) => void,
  grabFn: GrabFn
) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep grab fn up to date without reconnecting
  const grabFnRef = useRef(grabFn)
  useEffect(() => {
    grabFnRef.current = grabFn
  }, [grabFn])

  useEffect(() => {
    setGrabFn(() => grabFnRef.current())
    setOnDetections(onDetections)
  }, [onDetections])

  const connectWs = useCallback(async () => {
    setError(null)
    try {
      setGrabFn(() => grabFnRef.current())
      await connect()
      setConnected(true)
    } catch (e) {
      setError((e as Error).message)
      throw e
    }
  }, [])

  const disconnectWs = useCallback(() => {
    disconnect()
    setConnected(false)
  }, [])

  return { connected, error, connect: connectWs, disconnect: disconnectWs }
}
