import type React from 'react'
import type { IFrameArtworkProps } from '../interface'

const rawSkyColors = {
  city: '#a7c1ca',
  overcast: '#b8c2c7',
  sunset: '#d5ad86',
}

const FrameArtwork: React.FC<IFrameArtworkProps> = ({ scene, frameNumber, imageUrl, segmentedImageUrl, segmentationOpacity }) => {
  const horizonOffset = frameNumber % 7

  return (
    <>
      {imageUrl ? (
      <img
        alt={`Raw camera frame ${String(frameNumber).padStart(10, '0')}`}
        className="absolute inset-0 size-full object-cover"
        decoding="async"
        fetchPriority="high"
        loading="eager"
        src={imageUrl}
      />
      ) : (
        <svg
          aria-label={`Raw camera preview for frame ${String(frameNumber).padStart(10, '0')}`}
          className="absolute inset-0 size-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          viewBox="0 0 1200 520"
        >
          <rect fill={rawSkyColors[scene]} height="520" width="1200" />
          <path d={`M0 ${230 + horizonOffset} L155 198 L268 220 L414 182 L555 224 L713 190 L843 215 L1000 180 L1200 214 V344 H0 Z`} fill="#69747b" />
          <path d="M0 260 L90 242 L90 344 H0 Z M176 230 L282 246 L282 344 H176 Z M430 220 L520 240 L520 344 H430 Z M760 224 L855 236 L855 344 H760 Z M1020 218 L1130 242 L1130 344 H1020 Z" fill="#849096" />
          <path d="M0 304 H1200 V365 H0 Z" fill="#546957" />
          <path d="M0 520 L368 338 H836 L1200 520 Z" fill="#373e43" />
          <path d="M578 520 L590 402 H610 L630 520 Z" fill="#d7d2b2" />
          <path d="M78 520 L425 355 H448 L188 520 Z M1122 520 L752 355 H730 L1015 520 Z" fill="#596267" />
          <path d="M450 361 H750 L810 388 H390 Z" fill="#52655a" />
          <path d="M512 385 H625 L660 424 H475 Z" fill="#c7c8c3" />
          <path d="M532 390 H601 L618 408 H514 Z" fill="#7f9298" />
          <path d="M0 338 H1200" stroke="#c1c4c0" strokeWidth="3" />
          <path d="M282 250 V300 M520 243 V299 M855 241 V302" stroke="#c0c4c1" strokeWidth="4" />
        </svg>
      )}
      {segmentedImageUrl && (
        <img
          alt={`Segmentation result for frame ${String(frameNumber).padStart(10, '0')}`}
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          loading="eager"
          src={segmentedImageUrl}
          style={{ opacity: segmentationOpacity / 100 }}
        />
      )}
    </>
  )
}

export default FrameArtwork
