import type React from 'react'
import type { ISequenceThumbnailProps } from '../interface'

const sceneStyles = {
  city: 'bg-sky-200',
  overcast: 'bg-slate-200',
  sunset: 'bg-amber-200',
}

const SequenceThumbnail: React.FC<ISequenceThumbnailProps> = ({ scene, isLarge = false }) => {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden rounded-xl ${sceneStyles[scene]} ${isLarge ? 'h-36' : 'h-11 w-16'}`}
    >
      <div className="absolute inset-x-0 top-[42%] h-px bg-white/70" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-slate-700/80" />
      <div className="absolute bottom-0 left-[43%] h-[48%] w-[14%] bg-slate-500/80 [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
      <div className="absolute bottom-[22%] left-[12%] h-[35%] w-[18%] rounded-t-sm bg-slate-600/70" />
      <div className="absolute bottom-[22%] right-[12%] h-[30%] w-[20%] rounded-t-sm bg-slate-600/70" />
      <div className="absolute bottom-1 left-1 rounded bg-slate-950/50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
        360°
      </div>
    </div>
  )
}

export default SequenceThumbnail
