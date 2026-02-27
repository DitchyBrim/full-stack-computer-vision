import {type Detection} from '../lib/types'

type StatusState = 'active' | 'error' | 'connected' | ''

interface Props {
    status: string
    statusState: StatusState
    detections: Detection[]
}

export default function DetectionPanel({ status, statusState, detections}: Props){
    return (
        <div className='detections-panel'>
            <p className={`status ${statusState}`}>{status}</p>
            <ul className='detections-list'>
                {detections.map((d, i) => (
                    <li key={i}>
                        {d.label} : {(d.confidence * 100).toFixed(1)}%
                    </li>
                ))}
            </ul>
        </div>
    )
}
