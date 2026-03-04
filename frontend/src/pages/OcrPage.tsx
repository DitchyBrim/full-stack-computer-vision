import { useOcr } from '../hooks/useOcr'
import OcrDropzone from '../components/OcrDropZone'
import OcrFileList from '../components/OcrFileList'
import OcrResultCard from '../components/OcrResultCard'
import { LANGUAGES, OUTPUT_TYPES } from '../lib/ocr-types'

export default function OcrPage() {
  const {
    files, processing, results, error,
    language, setLanguage,
    outputType, setOutputType,
    addFiles, removeFile, reset, process,
  } = useOcr()

  return (
    <div className="ocr-page">
      <div className="ocr-card">
        <h1 className="ocr-title">OCR Image Processor</h1>
        <p className="ocr-subtitle">Upload images to extract text using optical character recognition</p>

        {/* Settings row */}
        <div className="ocr-settings-row">
          <div className="ocr-setting">
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="ocr-setting">
            <label>Output Type</label>
            <select value={outputType} onChange={(e) => setOutputType(e.target.value as typeof outputType)}>
              {OUTPUT_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <OcrDropzone onFiles={addFiles} />

        {/* File list */}
        <OcrFileList files={files} onRemove={removeFile} />

        {/* Error */}
        {error && (
          <div className="ocr-error">
            <span> {error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="ocr-actions">
          <button
            className="ocr-btn-primary"
            onClick={process}
            disabled={processing || files.length === 0}
          >
            {processing ? ' Processing…' : ' Process Images'}
          </button>
          {files.length > 0 && (
            <button className="ocr-btn-secondary" onClick={reset}>
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="ocr-results">
            <h3 className="ocr-section-title">Results ({results.length})</h3>
            {results.map((r, i) => (
              <OcrResultCard key={i} result={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}