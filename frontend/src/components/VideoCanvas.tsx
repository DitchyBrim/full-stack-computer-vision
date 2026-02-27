import { useRef, useEffect } from 'react'
import { type Detection } from '../lib/types'
import { drawDetections } from '../lib/canvas'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  detections: Detection[]
  mirrored?: boolean
  mode: 'camera' | 'screen'
}

const VideoCanvas = ({ videoRef, detections, mirrored = false, mode }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    drawDetections(
      canvas,
      detections,
      video?.videoWidth ?? 640,
      video?.videoHeight ?? 480
    )
  }, [detections, videoRef])

  const videoTransform = mode === 'camera' && mirrored ? 'scaleX(-1)' : 'scaleX(1)'
//   commented , need sya scaleX(1) lang para di mamirror ang labels
//   const canvasTransform = mode === 'camera' && mirrored ? 'scaleX(1)' : 'scaleX(1)'

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ transform: videoTransform }}
      />
      <canvas
        ref={canvasRef}
        style={{ transform: 'scaleX(1)' }} //constant
      />
    </div>
  )
}

export default VideoCanvas
