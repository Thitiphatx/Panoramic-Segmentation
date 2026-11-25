import type { IFrameRecord } from './interface'

export const createFrameRecord = (frameIndex: number): IFrameRecord => {
  const millisecondsSinceStart = frameIndex * 100
  const timestamp = new Date(Date.UTC(2013, 4, 28, 10, 12, 0) + millisecondsSinceStart).toISOString().slice(11, 23)
  const status = frameIndex % 21 === 4 ? 'processing' : frameIndex % 3 === 0 ? 'segmented' : 'unsegmented'

  return {
    frameIndex,
    frameId: String(frameIndex).padStart(10, '0'),
    status,
    timestamp,
  }
}
