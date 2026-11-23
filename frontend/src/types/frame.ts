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
  gps?: {
    lat?: number
    lon?: number
  }
  path?: {
    raw?: string
    segmented?: string
  }
}

export interface ISequenceFrameRecord {
  id: string
  metadata_: IFrameApiMetadata
}
