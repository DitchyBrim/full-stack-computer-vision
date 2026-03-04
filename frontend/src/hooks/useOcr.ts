import { useState, useCallback } from 'react'
import {
  type OcrResultItem,
  type OcrLanguage,
  type OcrOutputType,
} from '../lib/ocr-types'

const API_URL = 'http://localhost:8000'

export function useOcr() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<OcrResultItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<OcrLanguage>('eng')
  const [outputType, setOutputType] = useState<OcrOutputType>('text')

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

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const reset = useCallback(() => {
    setFiles([])
    setResults([])
    setError(null)
  }, [])

  const process = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select at least one image.')
      return
    }

    setProcessing(true)
    setError(null)
    setResults([])

    const newResults: OcrResultItem[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)

      try {
        let endpoint = ''
        let isImageResponse = false

        if (outputType === 'text') {
          endpoint = `${API_URL}/api/ocr/extract`
        } else if (outputType === 'boxes') {
          endpoint = `${API_URL}/api/ocr/extract-with-boxes`
        } else {
          endpoint = `${API_URL}/api/ocr/extract-annotated`
          isImageResponse = true
        }

        const response = await fetch(endpoint, { method: 'POST', body: formData })
        if (!response.ok) throw new Error(`Failed to process ${file.name}`)

        if (isImageResponse) {
          const blob = await response.blob()
          newResults.push({
            fileName: file.name,
            type: 'annotated',
            imageUrl: URL.createObjectURL(blob),
            totalWords: response.headers.get('X-Total-Words') ?? undefined,
          })
        } else {
          const data = await response.json()
          newResults.push({ fileName: file.name, type: outputType, data })
        }
      } catch (err) {
        newResults.push({
          fileName: file.name,
          type: outputType,
          error: (err as Error).message,
        })
      }
    }

    setResults(newResults)
    setProcessing(false)
  }, [files, language, outputType])

  return {
    files, processing, results, error,
    language, setLanguage,
    outputType, setOutputType,
    addFiles, removeFile, reset, process,
  }
}