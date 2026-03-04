import folderIcon from '../assets/folder.png'
interface Props {
  onFiles: (files: FileList | null) => void
}


export default function OcrDropzone({ onFiles }: Props) {
  return (
    <label className="ocr-dropzone">
      <div className="ocr-dropzone-inner">
        <span className="ocr-dropzone-icon" style={{ backgroundImage: `url(${folderIcon})` }}><img src={folderIcon} alt="upload" className="ocr-dropzone-icon" /></span>
        <p className="ocr-dropzone-title">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="ocr-dropzone-hint">PNG, JPG, JPEG, BMP, TIFF (max 10 MB per file)</p>
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onFiles(e.target.files)}
      />
    </label>
  )
}