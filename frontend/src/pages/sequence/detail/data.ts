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
    latitude: 48.8067 + frameIndex * 0.00001,
    longitude: 9.2100 + frameIndex * 0.00002,
  }
}
