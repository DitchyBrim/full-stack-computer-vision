import YoloDetection from './pages/YoloDetection'
import OcrPage from './pages/OcrPage'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./auth/AuthContext"
import { ProtectedRoute } from "./auth/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import AdminPanel from "./pages/AdminPanel"
import Layout from "./components/Layout"
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: any logged-in user — with navbar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<YoloDetection />} />
              <Route path="/ocr" element={<OcrPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Admin only — with navbar */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>

          {/* 403 page */}
          {/* <Route
            path="/403"
            element={
              <div style={{ padding: "2rem" }}>
                <h1>403 — Access Denied</h1>
                <a href="/dashboard">Go back</a>
              </div>
            }
          /> */}

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}