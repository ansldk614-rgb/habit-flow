import { useMemo, useState } from 'react'
import { AlertTriangle, RotateCcw, Sparkles, Wand2 } from 'lucide-react'
import {
  SLIME_CLASS_LIST,
  getAllEvolutionNodes,
} from '../../constants/slimeEvolutionConstants'
import {
  addGrowthLog,
  applyDebugXp,
  createDefaultSlimeProfile,
  setDebugSlimeLevel,
  updateSlimeCurrencies,
  updateSlimeEvolutionDebug,
} from '../../utils/rpgUtils'
import { formatCount, safeNumber } from '../../utils/habitUtils'

const STAGE_OPTIONS = ['baby', 'tiny', 'rookie', 'evolved', 'master']
const CLASS_OPTIONS = ['none', 'warrior', 'rogue', 'mage', 'archer']

export default function SlimeDebugPanel({
  slimeProfile,
  rewardedCompletions = {},
  onUpdateSlimeProfile,
  onResetRewardHistory,
}) {
  const [customXp, setCustomXp] = useState(100)
  const [targetLevel, setTargetLevel] = useState(slimeProfile.level ?? 1)
  const [currencyDraft, setCurrencyDraft] = useState(() => ({
    gold: slimeProfile.gold ?? 0,
    crystals: slimeProfile.crystals ?? 0,
    energy: slimeProfile.energy ?? 50,
    maxEnergy: slimeProfile.maxEnergy ?? 100,
  }))
  const [evolutionDraft, setEvolutionDraft] = useState(() => ({
    evolutionStage: slimeProfile.evolutionStage ?? 'baby',
    classLine: slimeProfile.classLine ?? 'none',
    branchLine: slimeProfile.branchLine ?? 'none',
    selectedEvolutionNodeId: slimeProfile.selectedEvolutionNodeId ?? 'none',
  }))
  const evolutionNodes = useMemo(() => getAllEvolutionNodes(), [])
  const selectedClass = SLIME_CLASS_LIST.find((item) => item.id === evolutionDraft.classLine)
  const branchOptions = selectedClass?.branches ?? []

  function updateProfile(updater) {
    onUpdateSlimeProfile?.(updater)
  }

  function addXp(amount) {
    updateProfile((current) => applyDebugXp(current, amount))
  }

  function applyLevel() {
    updateProfile((current) => setDebugSlimeLevel(current, targetLevel))
  }

  function addCurrency(patch) {
    updateProfile((current) => updateSlimeCurrencies(current, {
      gold: safeNumber(current.gold) + safeNumber(patch.gold),
      crystals: safeNumber(current.crystals) + safeNumber(patch.crystals),
      energy: safeNumber(current.energy) + safeNumber(patch.energy),
      maxEnergy: safeNumber(current.maxEnergy, 100) + safeNumber(patch.maxEnergy),
    }))
  }

  function applyCurrencies() {
    updateProfile((current) => updateSlimeCurrencies(current, currencyDraft))
  }

  function updateEvolutionDraft(field, value) {
    setEvolutionDraft((current) => {
      const next = { ...current, [field]: value }
      if (field === 'classLine') {
        next.branchLine = 'none'
        next.selectedEvolutionNodeId = 'none'
      }
      if (field === 'branchLine') {
        next.selectedEvolutionNodeId = 'none'
      }
      return next
    })
  }

  function applyEvolution() {
    updateProfile((current) => updateSlimeEvolutionDebug(current, evolutionDraft))
  }

  function addTestLog(type) {
    const message = type === 'evolution'
      ? 'Debug: evolution log preview.'
      : 'Debug: level-up log preview.'
    updateProfile((current) => addGrowthLog(current, { type, message }))
  }

  function clearGrowthLog() {
    if (!window.confirm('Clear only slime growth logs?')) return
    updateProfile((current) => ({ ...current, growthLog: [] }))
  }

  function resetSlimeProfile() {
    if (!window.confirm('Reset only the slime profile? Habits and completions will stay.')) return
    updateProfile(() => createDefaultSlimeProfile())
  }

  function resetRewardHistory() {
    if (!window.confirm('Reset only rewarded habit completion history? Habit records will stay.')) return
    onResetRewardHistory?.()
  }

  function syncDraftsFromProfile() {
    setTargetLevel(slimeProfile.level ?? 1)
    setCurrencyDraft({
      gold: slimeProfile.gold ?? 0,
      crystals: slimeProfile.crystals ?? 0,
      energy: slimeProfile.energy ?? 50,
      maxEnergy: slimeProfile.maxEnergy ?? 100,
    })
    setEvolutionDraft({
      evolutionStage: slimeProfile.evolutionStage ?? 'baby',
      classLine: slimeProfile.classLine ?? 'none',
      branchLine: slimeProfile.branchLine ?? 'none',
      selectedEvolutionNodeId: slimeProfile.selectedEvolutionNodeId ?? 'none',
    })
  }

  return (
    <section className="slime-debug-panel">
      <div className="slime-debug-panel__head">
        <div>
          <span className="debug-mode-badge"><AlertTriangle size={13} /> Developer Mode</span>
          <strong>Slime Test Controls</strong>
          <p>Local testing only. These controls change slime data, not habits or completions.</p>
        </div>
        <button type="button" className="compact-button" onClick={syncDraftsFromProfile}>
          <RotateCcw size={14} /> Sync
        </button>
      </div>

      <div className="slime-debug-grid">
        <section className="slime-debug-section">
          <h3>XP / Level</h3>
          <div className="debug-button-row">
            {[10, 50, 100, 500].map((amount) => (
              <button key={amount} type="button" className="compact-button" onClick={() => addXp(amount)}>+{amount} XP</button>
            ))}
          </div>
          <label className="debug-field">
            <span>Custom XP</span>
            <input type="number" min="0" value={customXp} onChange={(event) => setCustomXp(event.target.value)} />
          </label>
          <button type="button" className="primary-button debug-full-button" onClick={() => addXp(customXp)}>
            <Sparkles size={15} /> Add XP
          </button>
          <label className="debug-field">
            <span>Set Level</span>
            <input type="number" min="1" value={targetLevel} onChange={(event) => setTargetLevel(event.target.value)} />
          </label>
          <button type="button" className="compact-button debug-full-button" onClick={applyLevel}>Apply Level</button>
        </section>

        <section className="slime-debug-section">
          <h3>Currencies</h3>
          <div className="debug-button-row">
            <button type="button" className="compact-button" onClick={() => addCurrency({ gold: 100 })}>Gold +100</button>
            <button type="button" className="compact-button" onClick={() => addCurrency({ crystals: 10 })}>Crystal +10</button>
            <button type="button" className="compact-button" onClick={() => addCurrency({ energy: 20 })}>Energy +20</button>
            <button type="button" className="compact-button" onClick={() => addCurrency({ maxEnergy: 10 })}>Max +10</button>
          </div>
          {['gold', 'crystals', 'energy', 'maxEnergy'].map((field) => (
            <label key={field} className="debug-field">
              <span>{field}</span>
              <input
                type="number"
                min="0"
                value={currencyDraft[field]}
                onChange={(event) => setCurrencyDraft((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
          <button type="button" className="compact-button debug-full-button" onClick={applyCurrencies}>Apply Currencies</button>
        </section>

        <section className="slime-debug-section">
          <h3>Evolution Display</h3>
          <label className="debug-field">
            <span>Stage</span>
            <select value={evolutionDraft.evolutionStage} onChange={(event) => updateEvolutionDraft('evolutionStage', event.target.value)}>
              {STAGE_OPTIONS.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <label className="debug-field">
            <span>Class</span>
            <select value={evolutionDraft.classLine} onChange={(event) => updateEvolutionDraft('classLine', event.target.value)}>
              {CLASS_OPTIONS.map((classId) => <option key={classId} value={classId}>{classId}</option>)}
            </select>
          </label>
          <label className="debug-field">
            <span>Branch</span>
            <select value={evolutionDraft.branchLine} onChange={(event) => updateEvolutionDraft('branchLine', event.target.value)}>
              <option value="none">none</option>
              {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.id}</option>)}
            </select>
          </label>
          <label className="debug-field">
            <span>Node</span>
            <select value={evolutionDraft.selectedEvolutionNodeId} onChange={(event) => updateEvolutionDraft('selectedEvolutionNodeId', event.target.value)}>
              <option value="none">none</option>
              {evolutionNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.nameEn} · Lv.{formatCount(node.unlockLevel)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="primary-button debug-full-button" onClick={applyEvolution}>
            <Wand2 size={15} /> Apply Evolution Display
          </button>
        </section>

        <section className="slime-debug-section slime-debug-section--danger">
          <h3>Logs / Reset</h3>
          <div className="debug-button-row">
            <button type="button" className="compact-button" onClick={() => addTestLog('levelUp')}>Add level-up log</button>
            <button type="button" className="compact-button" onClick={() => addTestLog('evolution')}>Add evolution log</button>
          </div>
          <button type="button" className="compact-button debug-full-button" onClick={clearGrowthLog}>Clear growth log</button>
          <button type="button" className="settings-action-button settings-action-button--danger" onClick={resetSlimeProfile}>Reset Slime Profile</button>
          <button type="button" className="settings-action-button settings-action-button--danger" onClick={resetRewardHistory}>Reset Reward History</button>
          <small>Reward history entries: {formatCount(Object.keys(rewardedCompletions ?? {}).length)}</small>
        </section>
      </div>
    </section>
  )
}
