import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import YoloDetection from './pages/YoloDetection'
import OcrPage from './pages/OcrPage'
import './App.css'
export default function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<YoloDetection />} />
      <Route path="/ocr" element={<OcrPage />} />
    </Routes>
    </>
  )
}