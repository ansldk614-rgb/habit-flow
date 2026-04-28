import { MoonStar } from 'lucide-react'
import SlimeCompanion from '../components/SlimeCompanion'

export default function CompanionPage({
  rpgProfile,
  developerMode = false,
  rewardedCompletions = {},
  onUpdateSlimeProfile,
  onResetRewardHistory,
}) {
  return (
    <section className="panel character-panel">
      <div className="section-header">
        <div>
          <p className="section-kicker">Companion</p>
          <h2>Slime Growth Board</h2>
        </div>
        <MoonStar size={18} />
      </div>
      <SlimeCompanion
        rpgProfile={rpgProfile}
        developerMode={developerMode}
        rewardedCompletions={rewardedCompletions}
        onUpdateSlimeProfile={onUpdateSlimeProfile}
        onResetRewardHistory={onResetRewardHistory}
      />
    </section>
  )
}
