export interface OcrTextResult {
  text: string
  confidence: number
}

export interface OcrBoxResult {
  text: string
  total_words: number
  boxes: Array<{
    word: string
    x: number
    y: number
    width: number
    height: number
  }>
}

export interface OcrResultItem {
  fileName: string
  type: 'text' | 'boxes' | 'annotated'
  error?: string
  data?: OcrTextResult | OcrBoxResult
  imageUrl?: string
  totalWords?: string
}

export type OcrLanguage = 'eng' | 'spa' | 'fra' | 'deu' | 'chi_sim'
export type OcrOutputType = 'text' | 'boxes' | 'annotated'

export const LANGUAGES: { value: OcrLanguage; label: string }[] = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'chi_sim', label: 'Chinese Simplified' },
]

export const OUTPUT_TYPES: { value: OcrOutputType; label: string }[] = [
  { value: 'text',      label: 'Text Only' },
  { value: 'boxes',     label: 'Text with Bounding Boxes' },
  { value: 'annotated', label: 'Annotated Image' },
]