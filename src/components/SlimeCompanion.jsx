import habitBuddySlimeCute from '../assets/habit-buddy-slime-cute.png'
import { formatCount, formatPercent, safeNumber } from '../utils/habitUtils'

export default function SlimeCompanion({ rpgProfile }) {
  return (
    <div className="character-layout">
      <div className="character-visual-card">
        <div className={`slime-stage-frame slime-stage-frame--${rpgProfile.stageIndex + 1}`}>
          <div className="slime-aura" />
          <img src={habitBuddySlimeCute} alt="성장형 슬라임 동료" className="character-image" style={{ '--slime-scale': rpgProfile.growthScale }} />
        </div>
        <div className="character-caption">
          <strong>{rpgProfile.stage} Lv. {rpgProfile.level}</strong>
          <span>{rpgProfile.maturityText}</span>
        </div>
      </div>

      <div className="character-stats-panel">
        <div className="currency-grid">
          <article className="currency-card"><strong>{formatCount(rpgProfile.gold)}</strong><span>골드</span></article>
          <article className="currency-card"><strong>{formatCount(rpgProfile.crystals)}</strong><span>크리스탈</span></article>
          <article className="currency-card"><strong>{formatPercent(rpgProfile.energy)}</strong><span>에너지</span></article>
        </div>

        <div className="xp-panel">
          <div className="schedule-head">
            <strong>다음 레벨까지 XP</strong>
            <span>{formatCount(rpgProfile.xpCurrent)}/{formatCount(rpgProfile.xpMax, 220)}</span>
          </div>
          <div className="progress-bar">
            <span style={{ width: formatPercent((safeNumber(rpgProfile.xpCurrent) / safeNumber(rpgProfile.xpMax, 220)) * 100) }} />
          </div>
        </div>

        <div className="stat-board">
          <article className="stat-row"><span>근성</span><strong>{formatCount(rpgProfile.strength)}</strong></article>
          <article className="stat-row"><span>집중력</span><strong>{formatCount(rpgProfile.focus)}</strong></article>
          <article className="stat-row"><span>규율</span><strong>{formatCount(rpgProfile.discipline)}</strong></article>
          <article className="stat-row"><span>체력</span><strong>{formatCount(rpgProfile.vitality)}</strong></article>
        </div>

        <div className="summary-list">
          <article className="summary-item"><strong>{formatCount(rpgProfile.level, 1)}</strong><span>현재 레벨</span></article>
          <article className="summary-item"><strong>{formatCount(safeNumber(rpgProfile.stageIndex) + 1, 1)}</strong><span>성장 단계</span></article>
          <article className="summary-item"><strong>{formatCount(rpgProfile.penalties)}</strong><span>누적 패널티</span></article>
        </div>

        <p className="summary-highlight">기상은 정시 보상과 지각 패널티, 운동은 볼륨 기반 보상, 공부는 시간 기반 보상으로 연결됩니다.</p>
        <div className="reward-guide">
          <article className="reward-guide-card"><strong>골드</strong><p>일반 할 일, 정시 기상, 운동 볼륨, 공부 시간에서 조금씩 얻습니다. 일을 해낸 총량을 보여주는 기본 재화예요.</p></article>
          <article className="reward-guide-card"><strong>에너지</strong><p>운동 기록과 주간 완료율, 연속 달성일이 높을수록 잘 유지됩니다. 하루 컨디션과 활동성을 나타내는 값으로 쓰면 좋아요.</p></article>
          <article className="reward-guide-card"><strong>경험치</strong><p>공부 시간, 운동 볼륨, 기상 성공, 일반 습관 진행률이 모두 누적됩니다. 슬라임 레벨과 성장 단계에 직접 연결됩니다.</p></article>
          <article className="reward-guide-card"><strong>크리스탈</strong><p>목표를 100% 달성하거나 기상 시간을 잘 지킨 날처럼 품질이 좋은 기록에서 얻습니다. 희귀 보상이나 진화 재료로 쓰기 좋습니다.</p></article>
          <article className="reward-guide-card reward-guide-card--warning"><strong>패널티</strong><p>기상 시간이 늦어질수록 조금씩 쌓입니다. 누적되면 골드와 경험치 성장 효율이 줄어드는 방향으로 반영됩니다.</p></article>
        </div>
      </div>
    </div>
  )
}
