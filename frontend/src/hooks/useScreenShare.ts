import { useRef, useState, useCallback } from 'react'
import { startScreenStream, grabScreenFrame } from '../lib/screen'
import { stopStream } from '../lib/camera'

export function useScreenShare() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(async () => {
    const stream = await startScreenStream()
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

  const grab = useCallback((): string | null => {
    if (!videoRef.current) return null
    return grabScreenFrame(videoRef.current)
  }, [])

  return { videoRef, isRunning, start, stop, grab }
}
