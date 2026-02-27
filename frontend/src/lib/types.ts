// shape of what the backend sends back per detected object
export interface Detection {
  label: string
  confidence: number
  // bounding box as fractions of image width/height (0–1)
  x1: number
  y1: number
  x2: number
  y2: number
}

// the full message the backend sends after processing one frame
export interface DetectionMessage {
  detections: Detection[]
}
