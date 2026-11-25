export interface IFrameMetadata {
  preview: string
  date: string
  frame: number
  duration: number
}

export interface IFrameRecord {
  id: string
  metadata_: IFrameMetadata
}

export interface IFrameApiMetadata {
  status?: string
  date?: string
  gps?: Record<string, number | string | undefined>
  path?: {
    raw?: string
    segmented?: string
  }
}

export interface ISequenceFrameRecord {
  id: string
  metadata_: IFrameApiMetadata
}
