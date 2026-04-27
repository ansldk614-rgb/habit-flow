import { useEffect, useState } from 'react'
import { GitBranch } from 'lucide-react'
import { formatCount, formatPercent, safeNumber } from '../utils/habitUtils'
import { SLIME_FALLBACK_IMAGE } from '../constants/slimeEvolutionConstants'
import EvolutionTreeModal from './slime/EvolutionTreeModal'
import {
  getEvolutionProgressInfo,
  getSlimeDisplayName,
  getSlimeImagePath,
} from '../utils/slimeImageUtils'

const STAGE_DESCRIPTIONS = {
  baby: 'Small and cute beginner slime',
  tiny: 'A softer slime with early growth',
  rookie: 'A slime getting used to your routine',
  evolved: 'A slime evolved through habit power',
  master: 'The result of steady consistency',
}

const STAGE_LABELS = {
  baby: 'Baby',
  tiny: 'Tiny',
  rookie: 'Rookie',
  evolved: 'Evolved',
  master: 'Master',
}

function getEvolutionMessage(rpgProfile) {
  const nextEvolution = rpgProfile.nextEvolution

  if (nextEvolution?.isFinalUnlocked) {
    return 'Final evolution unlocked'
  }

  if (nextEvolution?.isAvailable) {
    return 'Evolution available'
  }

  if (!nextEvolution?.nextLevel) {
    return 'Keep completing habits to unlock evolution'
  }

  return `Next evolution at Lv.${nextEvolution.nextLevel}, ${formatCount(nextEvolution.remainingLevels)} levels left`
}

function getEvolutionDetail(rpgProfile) {
  const nextEvolution = rpgProfile.nextEvolution

  if (nextEvolution?.isFinalUnlocked) {
    return 'Final Evolution Available'
  }

  if (nextEvolution?.isAvailable) {
    return nextEvolution.label ?? 'Evolution milestone unlocked'
  }

  const remainingLevels = safeNumber(nextEvolution?.remainingLevels)
  return `${formatCount(remainingLevels)} level${remainingLevels === 1 ? '' : 's'} left`
}

function formatLogTime(createdAt) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function SlimeCompanion({ rpgProfile }) {
  const slimeImagePath = getSlimeImagePath(rpgProfile)
  const slimeDisplayName = getSlimeDisplayName(rpgProfile)
  const evolutionProgressInfo = getEvolutionProgressInfo(rpgProfile)
  const [imageSrc, setImageSrc] = useState(slimeImagePath)
  const [hasImageFailed, setHasImageFailed] = useState(false)
  const [isEvolutionTreeOpen, setIsEvolutionTreeOpen] = useState(false)
  const evolutionStage = rpgProfile.evolutionStage ?? 'baby'
  const stageLabel = STAGE_LABELS[evolutionStage] ?? STAGE_LABELS.baby
  const stageDescription = STAGE_DESCRIPTIONS[evolutionStage] ?? STAGE_DESCRIPTIONS.baby
  const xpCurrent = safeNumber(rpgProfile.xpCurrent ?? rpgProfile.xp)
  const xpMax = Math.max(1, safeNumber(rpgProfile.xpMax ?? rpgProfile.requiredXp, 100))
  const xpPercent = formatPercent((xpCurrent / xpMax) * 100)
  const recentLogs = (Array.isArray(rpgProfile.growthLog) ? rpgProfile.growthLog : []).slice(0, 8)
  const energy = safeNumber(rpgProfile.energy)
  const maxEnergy = Math.max(1, safeNumber(rpgProfile.maxEnergy, 100))
  const energyPercent = safeNumber((energy / maxEnergy) * 100)
  const isEnergyLow = energyPercent <= 25
  const isEvolutionAvailable = Boolean(rpgProfile.nextEvolution?.isAvailable || rpgProfile.nextEvolution?.isFinalUnlocked)
  const nextEvolutionText = evolutionProgressInfo.nextUnlockLevel == null
    ? '다음 진화: 최종 형태 도달'
    : `다음 진화: Lv.${formatCount(evolutionProgressInfo.nextUnlockLevel)}에서 선택 가능`

  useEffect(() => {
    setImageSrc(slimeImagePath)
    setHasImageFailed(false)
  }, [slimeImagePath])

  function handleImageError() {
    if (imageSrc !== SLIME_FALLBACK_IMAGE) {
      setImageSrc(SLIME_FALLBACK_IMAGE)
      return
    }

    setHasImageFailed(true)
  }

  return (
    <>
      <div className="character-layout character-layout--growth">
        <div className="character-visual-card slime-status-card">
          <div className="slime-status-card__head">
            <div>
              <span className="slime-name">Habit Slime</span>
              <strong>Lv. {formatCount(rpgProfile.level, 1)} {stageLabel}</strong>
            </div>
            <div className="slime-status-card__actions">
              <span className={`stage-badge stage-badge--${evolutionStage}`}>{evolutionStage}</span>
              <button type="button" className="evolution-tree-button" onClick={() => setIsEvolutionTreeOpen(true)}>
                <GitBranch size={15} />
                진화 트리
              </button>
            </div>
          </div>

          <div className={`slime-stage-frame slime-stage-frame--${safeNumber(rpgProfile.stageIndex) + 1}`}>
            <div className="slime-aura" />
            {hasImageFailed ? (
              <div className="character-image-fallback" aria-label={slimeDisplayName}>
                <strong>SLIME</strong>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={slimeDisplayName}
                className="character-image"
                style={{ '--slime-scale': rpgProfile.growthScale }}
                onError={handleImageError}
              />
            )}
          </div>

          <div className="character-caption">
            <strong>현재 형태: {slimeDisplayName}</strong>
            <span>{rpgProfile.maturityText}</span>
            <small>{stageDescription}</small>
            <small>{nextEvolutionText}</small>
          </div>
        </div>

        <div className="character-stats-panel slime-growth-panel">
          <section className="xp-panel slime-xp-panel">
            <div className="schedule-head">
              <strong>XP Progress</strong>
              <span>{formatCount(xpCurrent)} / {formatCount(xpMax)} XP</span>
            </div>
            <div className="progress-bar progress-bar--xp">
              <span style={{ width: xpPercent }} />
            </div>
            <p>{formatCount(Math.max(0, xpMax - xpCurrent))} XP to Lv. {formatCount(safeNumber(rpgProfile.level, 1) + 1)}</p>
          </section>

          <section className={`evolution-card ${isEvolutionAvailable ? 'evolution-card--available' : ''}`}>
            <span>Evolution</span>
            <strong>{getEvolutionMessage(rpgProfile)}</strong>
            <p>{getEvolutionDetail(rpgProfile)}</p>
          </section>

          <div className="currency-grid slime-currency-grid">
            <article className="currency-card"><span>Gold</span><strong>{formatCount(rpgProfile.gold)}</strong></article>
            <article className="currency-card"><span>Crystal</span><strong>{formatCount(rpgProfile.crystals)}</strong></article>
            <article className={`currency-card ${isEnergyLow ? 'currency-card--low-energy' : ''}`}>
              <span>Energy</span>
              <strong>{formatCount(energy)} / {formatCount(maxEnergy)}</strong>
            </article>
          </div>

          <div className="stat-board slime-stat-board">
            <article className="stat-row"><span>Strength</span><strong>{formatCount(rpgProfile.strength)}</strong></article>
            <article className="stat-row"><span>Focus</span><strong>{formatCount(rpgProfile.focus)}</strong></article>
            <article className="stat-row"><span>Discipline</span><strong>{formatCount(rpgProfile.discipline)}</strong></article>
            <article className="stat-row"><span>Vitality</span><strong>{formatCount(rpgProfile.vitality)}</strong></article>
          </div>

          <section className="growth-log-card">
            <div className="schedule-head">
              <strong>Growth Log</strong>
              <span>Latest</span>
            </div>

            {recentLogs.length === 0 ? (
              <p className="growth-log-empty">Complete habits to help your slime grow.</p>
            ) : (
              <div className="growth-log-list">
                {recentLogs.map((log) => (
                  <article key={log.id} className={`growth-log-item growth-log-item--${log.type}`}>
                    <strong>{log.message}</strong>
                    <span>{formatLogTime(log.createdAt)}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isEvolutionTreeOpen ? (
        <EvolutionTreeModal profile={rpgProfile} onClose={() => setIsEvolutionTreeOpen(false)} />
      ) : null}
    </>
  )
}
