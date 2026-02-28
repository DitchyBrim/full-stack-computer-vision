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

// settings sent to backend on change
export interface Settings {
  model: string
  confidence: number  // 0.0 – 1.0
  iou: number         // 0.0 – 1.0
  maxDetections: number
}

export const DEFAULT_SETTINGS: Settings = {
  model: 'yolov8n',
  confidence: 0.5,
  iou: 0.45,
  maxDetections: 100,
}

export const AVAILABLE_MODELS = [
  { value: 'yolov8n', label: 'YOLOv8n (fastest)' },
  { value: 'yolov8s', label: 'YOLOv8s' },
  { value: 'yolov8m', label: 'YOLOv8m' },
  { value: 'yolov8l', label: 'YOLOv8l' },
  { value: 'yolov8x', label: 'YOLOv8x (most accurate)' },
]
