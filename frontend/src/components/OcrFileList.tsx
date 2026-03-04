interface Props {
  files: File[]
  onRemove: (index: number) => void
}

export default function OcrFileList({ files, onRemove }: Props) {
  if (files.length === 0) return null

  return (
    <div className="ocr-file-list">
      <h3 className="ocr-section-title">Selected Files ({files.length})</h3>
      <ul className="ocr-files">
        {files.map((file, i) => (
          <li key={i} className="ocr-file-item">
            <span className="ocr-file-name">{file.name}</span>
            <span className="ocr-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
            <button className="ocr-file-remove" onClick={() => onRemove(i)} aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}