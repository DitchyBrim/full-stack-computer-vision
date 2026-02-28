import {type Settings, AVAILABLE_MODELS} from '../lib/types'

interface Props {
    open: boolean
    onClose: () => void
    settings: Settings
    onChange: (partial: Partial<Settings>) => void
}

export default function SettingsSidebar({open, onClose, settings, onChange}: Props) {
    return (
        <>
        {/* Backdrop */}
        {open && <div className='sidebar-backdrop' onClick={onClose} />}

        <aside className={`settings-sidebar ${open ? 'open' : ''}`}>
            <div className='sidebar-header'>
                <h2>Settings</h2>
                <button className='sidebar-close' onClick={onClose} aria-label="Close settings">X</button>
            </div>

            <div className='setting-group'>
                <label >Model</label>
                <select value={settings.model} onChange={(e) => onChange({model: e.target.value})}>
                    {AVAILABLE_MODELS.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                </select>
            </div>

            {/* cONFIDENCE THREShold */}
            <div className='setting-group'>
                <label>
                    Confidence Threshold
                    <span className='setting-value'>{(settings.confidence * 100).toFixed(0)}%</span>
                </label>
                <input type="range"
                min={0} max={1} step={0.01}
                value={settings.confidence}
                onChange={(e) => onChange({confidence: parseFloat(e.target.value)})}/>
                <div className='range-labels'><span>0%</span><span>100%</span></div>
            </div>
            {/* IOU Threshold */}
            <div className='setting-group'>
                <label >IOU Threshold
                    <span className='setting-value'>{(settings.iou * 100).toFixed(0)}%</span>
                </label>
                <input type="range"
                min={0} max={1} step={0.01}
                value={settings.iou}
                onChange={(e) => onChange({iou: parseFloat(e.target.value)})}/>
                <div className='range-labels'><span>0%</span><span>100%</span></div>
            </div>
            {/* Max Detections */}
            <div className='setting-group'>
                <label >Max Detections</label>
                <input type="number"
                min={1} max={100}
                value={settings.maxDetections}
                onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) {
                        onChange({maxDetections: val})
                    }
                }}/>
            </div>
        </aside>
        </>
    )
}
