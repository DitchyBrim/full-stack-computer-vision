import { useCallback, useState } from 'react'
import { useCamera } from '../hooks/useCamera'
import { useScreenShare } from '../hooks/useScreenShare'
import { useWebSocket } from '../hooks/useWebSocket'
import { useSettings } from '../hooks/useSettings'
import { useImageInfer } from '../hooks/useImageInfer'
import VideoCanvas from '../components/VideoCanvas'
import DetectionDropZone from '../components/DetectionDropZone'
import DetectionPanel from '../components/DetectionPanel'
import {type Detection, type DetectionMessage} from '../lib/types'
import SettingsSidebar from '../components/SettingsSidebar'
import OcrFileList  from '../components/OcrFileList'

type Mode = 'live' | 'screen' | 'upload'
type StatusState = 'active' | 'error' | 'connected' | ''

function App() {
  const [mode, setMode] = useState<Mode>('live')
  const [detections, setDetections] = useState<Detection[]>([])
  const [status, setStatus] = useState('Camera is off')
  const [statusState, setStatusState] = useState<StatusState>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)


  // upload: which result index is currently displayed
  const [activeResultIndex, setActiveResultIndex] = useState(0)
  const camera = useCamera()
  const screen = useScreenShare()

  const activeGrab = mode === 'live' ? camera.grab : screen.grab

  const handleDetections = useCallback((msg: DetectionMessage) => {
    setDetections(msg.detections)
  }, [])

  const ws = useWebSocket(handleDetections, activeGrab)
  const { settings, updateSettings } = useSettings(ws.sendSettings)
  const imageInfer = useImageInfer(settings)

  // ── shared status helper ──────────────────────────────────
  const updateStatus = (text: string, state: StatusState) => {
    setStatus(text)
    setStatusState(state)
  }
  // ── mode change ───────────────────────────────────────────
  const handleModeChange = async (newMode: Mode) => {
    if (ws.connected) ws.disconnect()
    if (camera.isRunning) camera.stop()
    if (screen.isRunning) screen.stop()
    setDetections([])
    imageInfer.clear()
    setActiveResultIndex(0)
    setMode(newMode)

    if (newMode === 'live') updateStatus('Camera is off', '')
    else if (newMode === 'screen') updateStatus('Screen share is off', '')
    else updateStatus('Choose an image to upload', '')
  }

  // Camera controls
  const handleCameraBtn = async () => {
    if (camera.isRunning) {
      if (ws.connected) ws.disconnect()
      camera.stop()
      setDetections([])
      updateStatus('Camera is off', '')
    } else {
      try{
        await camera.start()
        updateStatus('Camera is On - connect to start detections', 'active')
      } catch {
        updateStatus('Failed to access camera', 'error')
      }
    }
  }

  const handleCameraConnect = async () => {
    if(ws.connected) {
      ws.disconnect()
      setDetections([])
      updateStatus('Disconnected from backend', '')
    } else {
      try{
        updateStatus('Connecting...', '')
        await ws.connect()
        updateStatus('Connected - YOLO is running', 'connected')
      } catch {
        updateStatus('connection failed, check backend', 'error')
      }
    }
  }
  // share screen controles
  const handleScreenBtn = async () => {
    if (screen.isRunning) {
      if (ws.connected) ws.disconnect()
      screen.stop()
      setDetections([])
      updateStatus('Screen share stopped', '')
    } else {
      try {
        await screen.start()
        updateStatus('Screen share active — connect to start detection', 'active')
      } catch {
        updateStatus('Failed to start screen share', 'error')
      }
    }
  }

  const handleScreenConnect = async () => {
    if (ws.connected) {
      ws.disconnect()
      setDetections([])
      updateStatus('Disconnected from backend', '')
    } else {
      try {
        updateStatus('Connecting…', '')
        await ws.connect()
        updateStatus('Connected — YOLO is processing full screen', 'connected')
      } catch {
        updateStatus('Connection failed — is the backend running?', 'error')
      }
    }
  }

  // ── file upload handler ───────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length === 0) return
    setActiveResultIndex(0)
    await imageInfer.process(files)
    e.target.value = ''
  }

  // ── upload display helpers ────────────────────────────────
  const activeResult = imageInfer.results[activeResultIndex] ?? null

  const uploadStatus = imageInfer.processing
    ? 'Processing…'
    : imageInfer.error
    ? imageInfer.error
    : activeResult?.error
    ? activeResult.error
    : activeResult
    ? `${activeResult.detections.length} detection${activeResult.detections.length !== 1 ? 's' : ''} found`
    : 'Choose an image to upload'

  const uploadStatusState: StatusState = imageInfer.processing
    ? 'active'
    : imageInfer.error || activeResult?.error
    ? 'error'
    : activeResult
    ? 'connected'
    : ''

  // ── active values per mode ────────────────────────────────
  const activeVideoRef = mode === 'live' ? camera.videoRef : screen.videoRef
  const activeDetections = mode === 'upload' ? (activeResult?.detections ?? []) : detections
  const activeStatus = mode === 'upload' ? uploadStatus : status
  const activeStatusState = mode === 'upload' ? uploadStatusState : statusState
  return (
    <>
    <div id='app'>
      <h1>YOLO detection</h1>
      <button className='settings-toggle' onClick={() => setSidebarOpen(true)} title="Open settings">⚙Settings</button>
      <SettingsSidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      settings={settings}
      onChange={updateSettings}
      />
      {/* Mode selection */}
      <select 
        id="mode-select"
        value={mode}
        onChange={(e) => handleModeChange(e.target.value as Mode)}
        >
        <option value="live">Live Camera</option>
        <option value="screen">Screen Share</option>
        <option value="upload">Upload Files</option>
      </select>

      {/* video + canvas */}
      <VideoCanvas
        videoRef={activeVideoRef}
        detections={activeDetections}
        mirrored={camera.mirrored}
        mode={mode}/>
      {/* live camera controls */}
      {mode === 'live' && (
      <div className='controls-group'>
        <button onClick={handleCameraBtn}>
          {camera.isRunning ? 'Stop Camera': 'Start Camera'}
        </button>
        <button onClick={handleCameraConnect} disabled={!camera.isRunning}>
        {ws.connected ? 'Disconnect': 'Connect to backend'}
        </button>
        <button
          onClick={() => camera.setMirrored(!camera.mirrored)}
          disabled={!camera.isRunning}
          className={camera.mirrored ? 'active': ''}>
            {camera.mirrored ? 'Unmirror': 'Mirror'}
          </button>
      </div>
      )}
      {/* screen share controls */}
      {mode === 'screen' && (
          <div className="controls-group">
            <button onClick={handleScreenBtn}>
              {screen.isRunning ? 'Stop Screen Share' : 'Start Screen Share'}
            </button>
            <button onClick={handleScreenConnect} disabled={!screen.isRunning}>
              {ws.connected ? 'Disconnect' : 'Connect to Backend'}
            </button>
          </div>
        )}
      {/* Upload controls */}
      {mode === 'upload' && (
        <>
        <DetectionDropZone onFiles={imageInfer.addFiles} />
        <OcrFileList files={imageInfer.files} onRemove={imageInfer.removeFile} />
        {/* Actions */}
        <div className="ocr-actions">
          <button
            className="ocr-btn-primary"
            onClick={() => imageInfer.process(imageInfer.files)}
            disabled={imageInfer.processing || imageInfer.files.length === 0}
          >
            {imageInfer.processing ? ' Processing…' : ' Process Images'}
          </button>
          {imageInfer.files.length > 0 && (
            <button className="ocr-btn-secondary" onClick={imageInfer.reset}>
              Reset
            </button>
          )}
        </div>
        </>
        // <>
        //   <div className="controls-group">
        //     <label className={`upload-label ${imageInfer.processing ? 'disabled' : ''}`}>
        //       {imageInfer.processing ? '⏳ Processing…' : '📁 Choose Images'}
        //       <input
        //         type="file"
        //         accept="image/*"
        //         multiple
        //         style={{ display: 'none' }}
        //         disabled={imageInfer.processing}
        //         onChange={handleFileChange}
        //       />
        //     </label>
        //     {imageInfer.results.length > 0 && !imageInfer.processing && (
        //       <button onClick={() => { imageInfer.clear(); setActiveResultIndex(0) }}>
        //         Clear
        //       </button>
        //     )}
        //   </div>

        //   {/* Result thumbnails when multiple files uploaded */}
        //   {imageInfer.results.length > 1 && (
        //     <div className="upload-thumbnails">
        //       {imageInfer.results.map((r, i) => (
        //         <button
        //           key={i}
        //           className={`upload-thumb ${i === activeResultIndex ? 'active' : ''}`}
        //           onClick={() => setActiveResultIndex(i)}
        //           title={r.fileName}
        //         >
        //           <img src={r.previewUrl} alt={r.fileName} />
        //           {r.error && <span className="upload-thumb-error">!</span>}
        //         </button>
        //       ))}
        //     </div>
        //   )}
        // </>
      )}

      {/* Detection results */}
      <DetectionPanel
        status={activeStatus}
        statusState={activeStatusState}
        detections={activeDetections}
      />
    </div>
    </>
  )
}

export default App
