/**
 * Camera utilities — pure logic, no direct DOM access.
 * React components own the <video> ref and pass it in.
 */

export async function startCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false,
  })
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop())
}

/**
 * Grab the current frame from a video element as a base64 JPEG string.
 * Mirrors the frame horizontally if `mirrored` is true.
 */
export function grabFrame(
  videoEl: HTMLVideoElement,
  mirrored: boolean,
  quality = 0.7
): string | null {
  if (videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) return null

  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  if (mirrored) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }

  ctx.drawImage(videoEl, 0, 0)
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}
