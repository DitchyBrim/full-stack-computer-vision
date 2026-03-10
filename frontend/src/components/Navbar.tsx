import { useNavigate, useLocation } from 'react-router-dom'
import {useAuth} from "../auth/AuthContext"

const PAGES = [
    {path: '/', label: 'YOLO Detection'},
    { path: '/ocr', label: 'OCR Processor' },
  { path: "/dashboard", label: "Dashboard" },
]

const ADMIN_PAGES = [
  ...PAGES,
  { path: "/admin", label: "Admin Panel" },

]

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const pages = user?.role === "admin" ? ADMIN_PAGES : PAGES
  
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
      <div className="nav-right">
        <span>{user?.username}</span>
        <span className="role-badge">{user?.role}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
