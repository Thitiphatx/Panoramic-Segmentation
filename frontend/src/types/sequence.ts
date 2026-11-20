export type SequenceStatus = 'Ready' | 'Processing'

export type SequenceScene = 'city' | 'overcast' | 'sunset'

export interface ISequence {
  id: string
  date: string
  frames: number
  duration: string
  storage: string
  status: SequenceStatus
  camera: string
  weather: string
  scene: SequenceScene
}
