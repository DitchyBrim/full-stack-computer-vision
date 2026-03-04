import { type OcrResultItem, type OcrTextResult, type OcrBoxResult } from '../lib/ocr-types'

interface Props {
  result: OcrResultItem
}

function downloadText(text: string, fileName: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName.replace(/\.[^/.]+$/, '')}_ocr.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadJSON(data: object, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName.replace(/\.[^/.]+$/, '')}_boxes.json`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadImage(imageUrl: string, fileName: string) {
  const a = document.createElement('a')
  a.href = imageUrl
  a.download = `${fileName.replace(/\.[^/.]+$/, '')}_annotated.png`
  a.click()
}

export default function OcrResultCard({ result }: Props) {
  return (
    <div className="ocr-result-card">
      <div className="ocr-result-header">
        <span className="ocr-result-filename">{result.fileName}</span>
        {result.error
          ? <span className="ocr-result-status error">✕ {result.error}</span>
          : <span className="ocr-result-status success">✓ Completed</span>
        }
      </div>

      {!result.error && result.type === 'text' && (() => {
        const d = result.data as OcrTextResult
        return (
          <div className="ocr-result-body">
            <pre className="ocr-text-preview">{d.text || 'No text detected'}</pre>
            <div className="ocr-result-footer">
              <span className="ocr-meta">Confidence: {d.confidence}%</span>
              <button className="ocr-download-btn" onClick={() => downloadText(d.text, result.fileName)}>
                ↓ Download TXT
              </button>
            </div>
          </div>
        )
      })()}

      {!result.error && result.type === 'boxes' && (() => {
        const d = result.data as OcrBoxResult
        return (
          <div className="ocr-result-body">
            <pre className="ocr-text-preview">{d.text || 'No text detected'}</pre>
            <div className="ocr-result-footer">
              <span className="ocr-meta">Words detected: {d.total_words}</span>
              <div className="ocr-download-group">
                <button className="ocr-download-btn" onClick={() => downloadText(d.text, result.fileName)}>
                  ↓ TXT
                </button>
                <button className="ocr-download-btn" onClick={() => downloadJSON(d, result.fileName)}>
                  ↓ JSON
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {!result.error && result.type === 'annotated' && result.imageUrl && (
        <div className="ocr-result-body">
          <img src={result.imageUrl} alt="Annotated result" className="ocr-annotated-img" />
          <div className="ocr-result-footer">
            <span className="ocr-meta">Words detected: {result.totalWords ?? 'N/A'}</span>
            <button className="ocr-download-btn" onClick={() => downloadImage(result.imageUrl!, result.fileName)}>
              ↓ Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}