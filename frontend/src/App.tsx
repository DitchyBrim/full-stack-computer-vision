import { useCallback, useState } from 'react'
import { useCamera } from './hooks/useCamera'
import { useScreenShare } from './hooks/useScreenShare'
import { useWebSocket } from './hooks/useWebSocket'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import VideoCanvas from './components/VideoCanvas'
import DetectionPanel from './components/DetectionPanel'
import {type Detection, type DetectionMessage} from './types'
import './App.css'

type Mode = 'live' | 'screen' | 'upload'
type StatusState = 'active' | 'error' | 'connected' | ''

// type StatusState = 'active' | 'error' | 'connected' | ''
function App() {
  const [mode, setMode] = useState<Mode>('live')
  const [detections, setDetections] = useState<Detection[]>([])
  const [status, setStatus] = useState('Camera is off')
  const [statusState, setStatusState] = useState<StatusState>('')
  // const [count, setCount] = useState(0)
  const camera = useCamera()
  const screen = useScreenShare()
  const activeGrab = mode === 'live' ? camera.grab : screen.grab
  const handleDetections = useCallback((msg: DetectionMessage) => {
    setDetections(msg.detections)
  }, [])
  const ws = useWebSocket(handleDetections, activeGrab)

  // ── shared status helper ──────────────────────────────────
  const updateStatus = (text: string, state: StatusState) => {
    setStatus(text)
    setStatusState(state)
  }
  // mode change
  const handleModeChange = async (newMode: Mode) => {
    if (ws.connected) ws.disconnect()
    if (camera.isRunning) camera.stop()
    if (screen.isRunning) screen.stop()
    setDetections([])
    setMode(newMode)

    if (newMode === 'live') updateStatus('Camera is off', '')
    else if (newMode === 'screen') updateStatus('Screen share is off', '')
    else updateStatus('Choose a fiel to upload', '')
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

  //  file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      updateStatus(`Image selected: ${file.name}`, 'active')
      // TODO: POST to /infer/image
    } else if (file.type.startsWith('video/')) {
      updateStatus(`Video selected: ${file.name}`, 'active')
      // TODO: POST to /infer/video
    } else {
      updateStatus('Unsupported file type — use an image or video', 'error')
      e.target.value = ''
    }
  }
  //  which video ref to show
  const activeVideoRef = mode === 'live' ? camera.videoRef : screen.videoRef
  return (
    <>
    <div id='app'>
      <h1>YOLO detection</h1>
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
        detections={detections}
        mirrored={camera.mirrored}
        mode={mode==='live' ? 'camera' : 'screen'}/>
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
        <div className="controls-group">
          <input
            type="file"
            id="file-input"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Detection results */}
      <DetectionPanel
        status={status}
        statusState={statusState}
        detections={detections}
      />
    </div>
    </>
  )
}

export default App
