import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { HABIT_MODAL_PRESETS, WEEKDAY_OPTIONS } from '../../constants/habitConstants'

const DEFAULT_EMOJI = '✅'
const EMOJI_OPTIONS = ['✅', '💪', '📚', '⏰', '🧠', '💧', '🧘', '🚀', '📝', '🔥', '⭐', '🎯']
const COLOR_OPTIONS = ['#86ff5d', '#ffffff', '#00e5ff', '#f8ff7a', '#ff806e']
const CATEGORY_OPTIONS = [
  { value: 'custom', label: 'GENERAL' },
  { value: 'wake', label: 'WAKE' },
  { value: 'workout', label: 'WORKOUT' },
  { value: 'study', label: 'STUDY' },
]

function createFormState(habit) {
  return {
    name: habit?.name ?? '',
    emoji: habit?.emoji ?? DEFAULT_EMOJI,
    monthlyGoal: habit?.monthlyGoal ?? 20,
    goal: habit?.goal ?? habit?.monthlyGoal ?? 20,
    color: habit?.color ?? COLOR_OPTIONS[0],
    category: habit?.type ?? 'custom',
    activeDays: habit?.activeDays ?? habit?.days ?? [1, 2, 3, 4, 5],
    targetTime: habit?.target?.targetTime ?? '07:00',
    targetVolume: habit?.target?.targetVolume ?? 5000,
    targetMinutes: habit?.target?.targetMinutes ?? 90,
    targetPercent: habit?.target?.targetPercent ?? 100,
    unit: habit?.unit ?? '',
    memo: habit?.memo ?? '',
    active: habit?.active ?? true,
  }
}

function validateForm(form) {
  const errors = {}
  const monthlyGoal = Number(form.monthlyGoal)
  const goal = Number(form.goal)

  if (!form.name.trim()) {
    errors.name = 'Habit name is required.'
  }

  if (!Number.isFinite(monthlyGoal) || monthlyGoal < 1 || monthlyGoal > 31) {
    errors.monthlyGoal = 'Monthly goal must be between 1 and 31.'
  }
  if (!Number.isFinite(goal) || goal < 1) {
    errors.goal = 'Goal must be at least 1.'
  }
  if (!Array.isArray(form.activeDays) || form.activeDays.length === 0) {
    errors.activeDays = 'Select at least one active day.'
  }

  if (form.category === 'wake' && !form.targetTime) {
    errors.targetTime = 'Target time is required.'
  }

  if (form.category === 'workout' && Number(form.targetVolume) <= 0) {
    errors.targetVolume = 'Target volume must be greater than 0.'
  }

  if (form.category === 'study' && Number(form.targetMinutes) <= 0) {
    errors.targetMinutes = 'Target minutes must be greater than 0.'
  }

  if (form.category === 'custom' && (Number(form.targetPercent) <= 0 || Number(form.targetPercent) > 100)) {
    errors.targetPercent = 'Target percent must be between 1 and 100.'
  }

  return errors
}

function createTargetFromForm(form) {
  switch (form.category) {
    case 'wake':
      return { targetTime: form.targetTime || '07:00' }
    case 'workout':
      return { targetVolume: Number(form.targetVolume) || 5000 }
    case 'study':
      return { targetMinutes: Number(form.targetMinutes) || 90 }
    default:
      return { targetPercent: Number(form.targetPercent) || 100 }
  }
}

export default function HabitModal({ mode = 'add', habit, onClose, onSave }) {
  const [form, setForm] = useState(() => createFormState(habit))
  const [errors, setErrors] = useState({})
  const isEdit = mode === 'edit'

  useEffect(() => {
    setForm(createFormState(habit))
    setErrors({})
  }, [habit, mode])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function toggleActiveDay(day) {
    setForm((current) => {
      const exists = current.activeDays.includes(day)
      const nextDays = exists ? current.activeDays.filter((item) => item !== day) : [...current.activeDays, day]
      return nextDays.length === 0 ? current : { ...current, activeDays: nextDays.sort((left, right) => left - right) }
    })
    setErrors((current) => ({ ...current, activeDays: undefined }))
  }

  function applyPreset(preset) {
    setForm((current) => ({
      ...current,
      name: preset.name,
      emoji: preset.emoji,
      monthlyGoal: preset.monthlyGoal,
      goal: preset.monthlyGoal,
      color: preset.color,
      category: preset.category,
      activeDays: preset.activeDays ?? [1, 2, 3, 4, 5],
      targetTime: preset.category === 'wake' ? '07:00' : current.targetTime,
      targetVolume: preset.category === 'workout' ? 5000 : current.targetVolume,
      targetMinutes: preset.category === 'study' ? 90 : current.targetMinutes,
      targetPercent: preset.category === 'custom' ? 100 : current.targetPercent,
      active: true,
    }))
    setErrors({})
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSave({
      name: form.name.trim(),
      emoji: form.emoji || DEFAULT_EMOJI,
      monthlyGoal: Number(form.monthlyGoal),
      goal: Number(form.goal),
      color: form.color,
      type: form.category,
      category: form.category,
      activeDays: form.activeDays,
      days: form.activeDays,
      target: createTargetFromForm(form),
      targetWakeTime: form.category === 'wake' ? form.targetTime : undefined,
      targetMinutes: form.category === 'study' ? Number(form.targetMinutes) || 90 : undefined,
      targetAmount: form.category === 'workout' ? Number(form.targetVolume) || 5000 : undefined,
      unit: form.unit,
      memo: form.memo,
      active: Boolean(form.active),
    })
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="habit-modal" role="dialog" aria-modal="true" aria-labelledby="habit-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="habit-modal__head">
          <h2 id="habit-modal-title">{isEdit ? 'EDIT HABIT' : 'ADD HABIT'}</h2>
          <button type="button" className="modal-icon-button" onClick={onClose} aria-label="Close habit modal">
            <X size={18} />
          </button>
        </div>

        <form className="habit-modal__form" onSubmit={handleSubmit} noValidate>
          {!isEdit ? (
            <section className="habit-preset-panel" aria-label="Quick habit presets">
              <div className="habit-preset-panel__head">
                <span>QUICK PRESET</span>
                <small>Pick one and edit before saving</small>
              </div>
              <div className="habit-preset-list">
                {HABIT_MODAL_PRESETS.map((preset) => (
                  <button key={preset.id} type="button" className="habit-preset-pill" onClick={() => applyPreset(preset)}>
                    <span aria-hidden="true">{preset.emoji}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <label className="modal-field">
            <span>HABIT NAME</span>
            <input type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="운동하기" aria-invalid={Boolean(errors.name)} autoFocus />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>

          <div className="modal-field">
            <span>EMOJI</span>
            <div className="modal-emoji-grid">
              {EMOJI_OPTIONS.map((emoji) => (
                <button key={emoji} type="button" className={`modal-emoji ${form.emoji === emoji ? 'modal-emoji--active' : ''}`} onClick={() => updateField('emoji', emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form-grid">
            <label className="modal-field">
              <span>MONTHLY GOAL</span>
              <input type="number" min="1" value={form.goal} onChange={(event) => {
                updateField('goal', event.target.value)
                updateField('monthlyGoal', event.target.value)
              }} aria-invalid={Boolean(errors.goal)} />
              {errors.goal ? <small>{errors.goal}</small> : null}
            </label>

            <label className="modal-field">
              <span>CATEGORY</span>
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {CATEGORY_OPTIONS.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>
          </div>

          <div className="modal-field">
            <span>ACTIVE DAYS</span>
            <div className="day-pill-row">
              {WEEKDAY_OPTIONS.map((day) => (
                <button key={day.value} type="button" className={`day-pill ${form.activeDays.includes(day.value) ? 'day-pill--active' : ''}`} onClick={() => toggleActiveDay(day.value)}>
                  {day.label}
                </button>
              ))}
            </div>
            {errors.activeDays ? <small>{errors.activeDays}</small> : null}
          </div>

          <div className="modal-form-grid">
            {form.category === 'wake' ? (
              <label className="modal-field">
                <span>TARGET WAKE TIME</span>
                <input type="time" value={form.targetTime} onChange={(event) => updateField('targetTime', event.target.value)} aria-invalid={Boolean(errors.targetTime)} />
                {errors.targetTime ? <small>{errors.targetTime}</small> : null}
              </label>
            ) : null}

            {form.category === 'workout' ? (
              <label className="modal-field">
                <span>TARGET VOLUME</span>
                <input type="number" min="1" value={form.targetVolume} onChange={(event) => updateField('targetVolume', event.target.value)} aria-invalid={Boolean(errors.targetVolume)} />
                {errors.targetVolume ? <small>{errors.targetVolume}</small> : null}
              </label>
            ) : null}

            {form.category === 'study' ? (
              <label className="modal-field">
                <span>TARGET MINUTES</span>
                <input type="number" min="1" value={form.targetMinutes} onChange={(event) => updateField('targetMinutes', event.target.value)} aria-invalid={Boolean(errors.targetMinutes)} />
                {errors.targetMinutes ? <small>{errors.targetMinutes}</small> : null}
              </label>
            ) : null}

            {form.category === 'custom' ? (
              <label className="modal-field">
                <span>TARGET PERCENT</span>
                <input type="number" min="1" max="100" value={form.targetPercent} onChange={(event) => updateField('targetPercent', event.target.value)} aria-invalid={Boolean(errors.targetPercent)} />
                {errors.targetPercent ? <small>{errors.targetPercent}</small> : null}
              </label>
            ) : null}
          </div>

          <div className="modal-field">
            <span>COLOR</span>
            <div className="modal-color-row">
              {COLOR_OPTIONS.map((color) => (
                <button key={color} type="button" className={`modal-color ${form.color === color ? 'modal-color--active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateField('color', color)} aria-label={`Select ${color}`} />
              ))}
            </div>
          </div>

          <div className="modal-form-grid">
            <label className="modal-field">
              <span>UNIT</span>
              <input type="text" value={form.unit} onChange={(event) => updateField('unit', event.target.value)} placeholder="min, pages, volume" />
            </label>
            <label className="modal-field">
              <span>MEMO</span>
              <input type="text" value={form.memo} onChange={(event) => updateField('memo', event.target.value)} placeholder="Optional note" />
            </label>
          </div>

          <label className="modal-toggle">
            <input type="checkbox" checked={form.active} onChange={(event) => updateField('active', event.target.checked)} />
            <span>ACTIVE</span>
          </label>

          <div className="habit-modal__actions">
            <button type="button" className="modal-cancel-button" onClick={onClose}>CANCEL</button>
            <button type="submit" className="modal-save-button">SAVE</button>
          </div>
        </form>
      </section>
    </div>
  )
}
