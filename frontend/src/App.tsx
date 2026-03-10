import Navbar from './components/Navbar'
import YoloDetection from './pages/YoloDetection'
import OcrPage from './pages/OcrPage'
import {Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import './App.css'
export default function App() {
  return (
    <>
    {/* <Navbar />
    <Routes>
      <Route path="/" element={<YoloDetection />} />
      <Route path="/ocr" element={<OcrPage />} />
    </Routes> */}
    <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Protected: admin only */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* 403 page */}
          <Route
            path="/403"
            element={<div style={{ padding: "2rem" }}><h1>403 — Access Denied</h1><a href="/dashboard">Go back</a></div>}
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </>
  )
}