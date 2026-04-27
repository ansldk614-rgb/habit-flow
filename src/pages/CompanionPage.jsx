import { MoonStar } from 'lucide-react'
import SlimeCompanion from '../components/SlimeCompanion'

export default function CompanionPage({ rpgProfile }) {
  return (
    <section className="panel character-panel">
      <div className="section-header"><div><p className="section-kicker">동료</p><h2>슬라임 성장 보드</h2></div><MoonStar size={18} /></div>
      <SlimeCompanion rpgProfile={rpgProfile} />
    </section>
  )
}
