import { type Detection } from './types'

const COLOURS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899']
const labelColourMap = new Map<string, string>()

function getColour(label: string): string {
  if (!labelColourMap.has(label)) {
    labelColourMap.set(label, COLOURS[labelColourMap.size % COLOURS.length])
  }
  return labelColourMap.get(label)!
}

export function drawDetections(
  canvas: HTMLCanvasElement,
  detections: Detection[],
  videoWidth: number,
  videoHeight: number
): void {
  canvas.width = videoWidth || 640
  canvas.height = videoHeight || 480

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const w = canvas.width
  const h = canvas.height

  for (const d of detections) {
    const x = d.x1 * w
    const y = d.y1 * h
    const bw = (d.x2 - d.x1) * w
    const bh = (d.y2 - d.y1) * h
    const colour = getColour(d.label)
    const label = `${d.label} ${(d.confidence * 100).toFixed(0)}%`

    ctx.strokeStyle = colour
    ctx.lineWidth = 2.5
    ctx.strokeRect(x, y, bw, bh)

    ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif'
    const textW = ctx.measureText(label).width
    const padX = 6
    const padY = 4
    const labelH = 20
    const labelY = y - labelH - 2 >= 0 ? y - labelH - 2 : y + 2

    ctx.fillStyle = colour
    ctx.beginPath()
    ctx.roundRect(x - 1, labelY, textW + padX * 2, labelH, 4)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.fillText(label, x + padX, labelY + labelH - padY - 1)
  }
}
