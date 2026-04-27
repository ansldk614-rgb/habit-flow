import { useState } from 'react'
import { SLIME_FALLBACK_IMAGE } from '../../constants/slimeEvolutionConstants'
import { formatCount, safeNumber } from '../../utils/habitUtils'

export default function EvolutionNodeCard({ node, level = 1, isCurrent = false }) {
  const [imageSrc, setImageSrc] = useState(node?.image || SLIME_FALLBACK_IMAGE)
  const [hasImageFailed, setHasImageFailed] = useState(false)
  const safeLevel = Math.max(1, safeNumber(level, 1))
  const unlockLevel = Math.max(1, safeNumber(node?.unlockLevel, 1))
  const isAvailable = safeLevel >= unlockLevel
  const stateClass = isCurrent ? 'is-current' : isAvailable ? 'is-available' : 'is-locked'
  const stateLabel = isCurrent ? '현재' : isAvailable ? '해금 가능' : `Lv.${formatCount(unlockLevel)} 필요`

  function handleImageError() {
    if (imageSrc !== SLIME_FALLBACK_IMAGE) {
      setImageSrc(SLIME_FALLBACK_IMAGE)
      return
    }

    setHasImageFailed(true)
  }

  return (
    <article className={`evolution-node-card ${stateClass}`}>
      <div className="evolution-node-card__image">
        {hasImageFailed ? (
          <span>SLIME</span>
        ) : (
          <img src={imageSrc} alt={node?.nameKo ?? node?.nameEn ?? 'Slime evolution'} onError={handleImageError} />
        )}
      </div>

      <div className="evolution-node-card__body">
        <div className="evolution-node-card__title">
          <strong>{node?.nameKo ?? 'Unknown Slime'}</strong>
          <span>{node?.nameEn ?? 'Unknown'}</span>
        </div>
        <p>{node?.description ?? 'Evolution details are not available yet.'}</p>
        <div className="evolution-node-card__meta">
          <span>Lv.{formatCount(unlockLevel)}</span>
          <em>{stateLabel}</em>
        </div>
      </div>
    </article>
  )
}
