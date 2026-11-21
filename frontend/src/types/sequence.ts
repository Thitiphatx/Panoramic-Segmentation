export type SequenceStatus = 'Ready' | 'Processing' | 'Segmented'

export type SequenceScene = 'city' | 'overcast' | 'sunset'

export interface ISequenceItem {
  id: string
  preview?: string
  date: string
  status: SequenceStatus
}

export interface ISequence extends ISequenceItem {
  frames: number
  duration: string
  storage: string
  camera?: string
  weather?: string
  scene?: SequenceScene
}
