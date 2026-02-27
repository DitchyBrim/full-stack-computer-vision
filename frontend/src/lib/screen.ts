/**
 * Screen share utilities — pure logic, no direct DOM access.
 */

export async function startScreenStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always' } as MediaTrackConstraints,
    audio: false,
  })
}

export function grabScreenFrame(
  videoEl: HTMLVideoElement,
  quality = 0.7
): string | null {
  if (videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) return null

  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(videoEl, 0, 0)
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}
