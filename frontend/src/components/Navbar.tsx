import { useNavigate, useLocation } from 'react-router-dom'

const PAGES = [
    {path: '/', label: 'YOLO Detection'},
    { path: '/ocr', label: 'OCR Processor' }
]

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
    <nav>
      <span className="nav-brand">Image processing APP</span>
      <select
        className="nav-select"
        value={location.pathname}
        onChange={(e) => navigate(e.target.value)}
      >
        {PAGES.map((p) => (
          <option key={p.path} value={p.path}>{p.label}</option>
        ))}
      </select>
    </nav>
  )
}
