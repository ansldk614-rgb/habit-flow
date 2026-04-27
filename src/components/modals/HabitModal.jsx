import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { HABIT_MODAL_PRESETS } from '../../constants/habitConstants'

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
    color: habit?.color ?? COLOR_OPTIONS[0],
    category: habit?.type ?? 'custom',
    active: habit?.active ?? true,
  }
}

function validateForm(form) {
  const errors = {}
  const monthlyGoal = Number(form.monthlyGoal)

  if (!form.name.trim()) {
    errors.name = 'Habit name is required.'
  }

  if (!Number.isFinite(monthlyGoal) || monthlyGoal < 1 || monthlyGoal > 31) {
    errors.monthlyGoal = 'Monthly goal must be between 1 and 31.'
  }

  return errors
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

  function applyPreset(preset) {
    setForm((current) => ({
      ...current,
      name: preset.name,
      emoji: preset.emoji,
      monthlyGoal: preset.monthlyGoal,
      color: preset.color,
      category: preset.category,
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
      color: form.color,
      type: form.category,
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
              <input type="number" min="1" max="31" value={form.monthlyGoal} onChange={(event) => updateField('monthlyGoal', event.target.value)} aria-invalid={Boolean(errors.monthlyGoal)} />
              {errors.monthlyGoal ? <small>{errors.monthlyGoal}</small> : null}
            </label>

            <label className="modal-field">
              <span>CATEGORY</span>
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {CATEGORY_OPTIONS.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>
          </div>

          <div className="modal-field">
            <span>COLOR</span>
            <div className="modal-color-row">
              {COLOR_OPTIONS.map((color) => (
                <button key={color} type="button" className={`modal-color ${form.color === color ? 'modal-color--active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateField('color', color)} aria-label={`Select ${color}`} />
              ))}
            </div>
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
