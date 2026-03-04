import { useEffect, useRef } from "react"
import { type Detection } from '../lib/types'
import { drawDetections } from '../lib/canvas'

type Props = {
  result: {
    previewUrl: string
    fileName: string
    detections: Detection[]
  }
}

export function ImageWithDetections({ result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const handleLoad = () => {
      drawDetections(
        canvas,
        result.detections,
        img.naturalWidth,
        img.naturalHeight
      )
    }

    if (img.complete) {
      handleLoad()
    } else {
      img.onload = handleLoad
    }
  }, [result.detections])

  return (
    <div className="ocr-result" style={{ position: "relative", display: "inline-block" }}>
      <img
        ref={imgRef}
        src={result.previewUrl}
        alt={result.fileName}
        style={{ display: "block", maxWidth: "100%" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
      />
    </div>
  )
}