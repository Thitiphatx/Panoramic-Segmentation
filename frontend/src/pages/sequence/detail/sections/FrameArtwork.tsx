import type React from 'react'
import type { IFrameArtworkProps } from '../interface'

const rawSkyColors = {
  city: '#a7c1ca',
  overcast: '#b8c2c7',
  sunset: '#d5ad86',
}

const FrameArtwork: React.FC<IFrameArtworkProps> = ({ scene, frameNumber, viewMode, isUnsegmented = false, imageUrl, segmentedImageUrl }) => {
  const isSegmentedView = viewMode === 'segmented'
  const skyColor = isSegmentedView ? '#55a9d1' : rawSkyColors[scene]
  const buildingColor = isSegmentedView ? '#8a9298' : '#69747b'
  const roadColor = isSegmentedView ? '#4c5863' : '#373e43'
  const vegetationColor = isSegmentedView ? '#4f8b5e' : '#546957'
  const vehicleColor = isSegmentedView ? '#e0a04b' : '#c7c8c3'
  const horizonOffset = frameNumber % 7

  const displayedImageUrl = isSegmentedView ? segmentedImageUrl : imageUrl

  if (displayedImageUrl) {
    return (
      <img
        alt={`${isSegmentedView ? 'Segmented' : 'Raw camera'} frame ${String(frameNumber).padStart(10, '0')}`}
        className={`absolute inset-0 size-full object-cover ${isUnsegmented ? 'grayscale' : ''}`}
        decoding="async"
        fetchPriority="high"
        loading="eager"
        src={displayedImageUrl}
      />
    )
  }

  return (
    <svg
      aria-label={`Frame ${String(frameNumber).padStart(10, '0')} ${isSegmentedView ? 'segmentation preview' : 'raw camera preview'}`}
      className={`absolute inset-0 size-full ${isUnsegmented ? 'grayscale' : ''}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      viewBox="0 0 1200 520"
    >
      <rect fill={skyColor} height="520" width="1200" />
      <path d={`M0 ${230 + horizonOffset} L155 198 L268 220 L414 182 L555 224 L713 190 L843 215 L1000 180 L1200 214 V344 H0 Z`} fill={buildingColor} />
      <path d="M0 260 L90 242 L90 344 H0 Z M176 230 L282 246 L282 344 H176 Z M430 220 L520 240 L520 344 H430 Z M760 224 L855 236 L855 344 H760 Z M1020 218 L1130 242 L1130 344 H1020 Z" fill={isSegmentedView ? '#747e85' : '#849096'} />
      <path d="M0 304 H1200 V365 H0 Z" fill={vegetationColor} />
      <path d="M0 520 L368 338 H836 L1200 520 Z" fill={roadColor} />
      <path d="M578 520 L590 402 H610 L630 520 Z" fill={isSegmentedView ? '#e8cb65' : '#d7d2b2'} />
      <path d="M78 520 L425 355 H448 L188 520 Z M1122 520 L752 355 H730 L1015 520 Z" fill={isSegmentedView ? '#7c8790' : '#596267'} />
      <path d="M450 361 H750 L810 388 H390 Z" fill={isSegmentedView ? '#3c7b52' : '#52655a'} />
      <path d="M512 385 H625 L660 424 H475 Z" fill={vehicleColor} />
      <path d="M532 390 H601 L618 408 H514 Z" fill={isSegmentedView ? '#8fc4d8' : '#7f9298'} />
      <path d="M0 338 H1200" stroke={isSegmentedView ? '#c0d7df' : '#c1c4c0'} strokeWidth="3" />
      <path d="M282 250 V300 M520 243 V299 M855 241 V302" stroke={isSegmentedView ? '#aab6bd' : '#c0c4c1'} strokeWidth="4" />
    </svg>
  )
}

export default FrameArtwork
