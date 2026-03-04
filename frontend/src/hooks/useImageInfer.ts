import { useState, useCallback } from 'react'
import { type Detection, type Settings } from '../lib/types'

const API_URL = 'http://localhost:8000'

export interface ImageInferResult {
  fileName: string
  previewUrl: string
  detections: Detection[]
  error?: string
}

export function useImageInfer(settings: Settings) {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ImageInferResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const all = Array.from(incoming)
    const images = all.filter((f) => f.type.startsWith('image/'))
    if (images.length !== all.length) {
      setError('Some files were skipped — only image files are allowed.')
    } else {
      setError(null)
    }
    setFiles((prev) => [...prev, ...images])
  }, [])

  const reset = useCallback(() => {
    setFiles([])
    setResults([])
    setError(null)
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const process = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      setError('Please select at least one image.')
      return
    }

    setProcessing(true)
    setError(null)
    setResults([])

    const newResults: ImageInferResult[] = []

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('confidence', String(settings.confidence))
      formData.append('iou', String(settings.iou))
      formData.append('max_det', String(settings.maxDetections))
      formData.append('model', settings.model)

      try {
        const response = await fetch(`${API_URL}/infer/image`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Failed to process ${file.name}`)

        const data = await response.json()
        newResults.push({
          fileName: file.name,
          previewUrl,
          detections: data.detections,
        })
      } catch (err) {
        newResults.push({
          fileName: file.name,
          previewUrl,
          detections: [],
          error: (err as Error).message,
        })
      }
    }

    setResults(newResults)
    setProcessing(false)
  }, [settings])

  const clear = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.previewUrl))
    setResults([])
    setError(null)
  }, [results])

  return { processing, results, error, process, clear , addFiles, files, removeFile, reset}
}
