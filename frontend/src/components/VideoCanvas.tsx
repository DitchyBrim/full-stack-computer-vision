import { useRef, useEffect } from 'react'
import { type Detection } from '../lib/types'
import { drawDetections } from '../lib/canvas'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  detections: Detection[]
  mirrored?: boolean
  mode: 'live' | 'screen' | 'upload'
  uploadedImageUrl?: string | null
}

const VideoCanvas = ({ videoRef, detections, mirrored = false, mode , uploadedImageUrl}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (mode === 'upload') {
      const img = imgRef.current
      if (!img || !uploadedImageUrl) return
      drawDetections(canvas, detections, img.naturalWidth || 640, img.naturalHeight || 480)
    } else {
      const video = videoRef.current
      drawDetections(canvas, detections, video?.videoWidth ?? 640, video?.videoHeight ?? 480)
    }
  }, [detections, videoRef, mode, uploadedImageUrl])

  // upload mode — no image yet: render nothing
  if (mode === 'upload' && !uploadedImageUrl) return null
  const transform = mode === 'live' && mirrored ? 'scaleX(-1)' : 'scaleX(1)'
  // const transform = mode === 'live' && mirrored ? 'scaleX(-1)' : 'scaleX(1)'
  // const videoTransform = mode === 'camera' && mirrored ? 'scaleX(-1)' : 'scaleX(1)'
//   commented , need sya scaleX(1) lang para di mamirror ang labels
//   const canvasTransform = mode === 'camera' && mirrored ? 'scaleX(1)' : 'scaleX(1)'

  return (
    <div className="video-container">
      {mode === 'upload' ? (
        <img
          ref={imgRef}
          src={uploadedImageUrl ?? undefined}
          alt="Uploaded for detection"
          className="upload-preview"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform }}
        />
      )}
      <canvas
        ref={canvasRef}
        style={{ transform: 'scaleX(1)' }} //constant
      />
    </div>
  )
}

export default VideoCanvas
