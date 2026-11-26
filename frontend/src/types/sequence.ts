export type SequenceStatus = 'Ready' | 'Processing' | 'Segmented'

export type SequenceScene = 'city' | 'overcast' | 'sunset'

export interface ISequenceItem {
  id: string
  preview?: string
  date: string
  status: SequenceStatus
  frame: number
  duration: number
}

export interface ISequence extends Omit<ISequenceItem, 'frame' | 'duration'> {
  frames: number
  duration: string
  storage: string
  camera?: string
  weather?: string
  scene?: SequenceScene
}

export interface ISequenceMetadata {
  preview: string
  date: string
  status: SequenceStatus
  frame: number
  duration: number
}

export interface ISequenceRecord {
  id: string
  metadata_: ISequenceMetadata
}
