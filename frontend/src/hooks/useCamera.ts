import { useRef, useState, useCallback } from 'react'
import { startCameraStream, stopStream, grabFrame } from '../lib/camera'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [mirrored, setMirroredState] = useState(true)

  const start = useCallback(async () => {
    const stream = await startCameraStream()
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    stopStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsRunning(false)
  }, [])

  const setMirrored = useCallback((value: boolean) => {
    setMirroredState(value)
  }, [])

  const grab = useCallback((): string | null => {
    if (!videoRef.current) return null
    return grabFrame(videoRef.current, mirrored)
  }, [mirrored])

  return { videoRef, isRunning, mirrored, start, stop, setMirrored, grab }
}
