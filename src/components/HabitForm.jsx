import { Plus, X } from 'lucide-react'
import { COLOR_OPTIONS, EMOJI_OPTIONS, HABIT_TYPES, WEEKDAY_OPTIONS } from '../constants/habitConstants'
import { safeNumber } from '../utils/habitUtils'

function FieldError({ message }) {
  return message ? <span className="field-error">{message}</span> : null
}

export default function HabitForm({ form, errors = {}, updateFormField, toggleDay, handleCreateHabit, onCancel }) {
  return (
    <form className="habit-form habit-form-compact" onSubmit={handleCreateHabit} noValidate>
      <label className="field">
        <span>습관 이름</span>
        <input type="text" value={form.name} onChange={(event) => updateFormField('name', event.target.value)} placeholder="예: 하체 운동" aria-invalid={Boolean(errors.name)} />
        <FieldError message={errors.name} />
      </label>

      <div className="form-split">
        <label className="field">
          <span>습관 유형</span>
          <select className="select-field" value={form.type} onChange={(event) => updateFormField('type', event.target.value)}>
            {HABIT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="field">
          <span>이모지</span>
          <div className="emoji-row">
            {EMOJI_OPTIONS.map((emoji) => (
              <button key={emoji} type="button" className={`emoji-chip ${form.emoji === emoji ? 'emoji-chip--active' : ''}`} onClick={() => updateFormField('emoji', emoji)} aria-label={`${emoji} 이모지 선택`}>
                {emoji}
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="field">
        <span>강조 색상</span>
        <div className="color-row">
          {COLOR_OPTIONS.map((color) => (
            <button key={color} type="button" className={`color-swatch ${form.color === color ? 'color-swatch--active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateFormField('color', color)} aria-label={`${color} 색상 선택`} />
          ))}
        </div>
      </label>
      <label className="field">
        <span>Monthly Goal</span>
        <input type="number" min="1" value={safeNumber(form.goal, 20)} onChange={(event) => updateFormField('goal', event.target.value)} aria-invalid={Boolean(errors.goal)} />
        <FieldError message={errors.goal} />
      </label>

      <div className="field">
        <span>Active Days</span>
        <div className="day-grid">
          {WEEKDAY_OPTIONS.map((day) => (
            <button key={day.value} type="button" className={`day-chip ${form.days.includes(day.value) ? 'day-chip--active' : ''}`} onClick={() => toggleDay(day.value)}>
              {day.label}
            </button>
          ))}
        </div>
        <FieldError message={errors.days} />
      </div>

      {form.type === 'wake' && <label className="field"><span>목표 기상 시간</span><input type="time" value={form.targetTime} onChange={(event) => updateFormField('targetTime', event.target.value)} aria-invalid={Boolean(errors.targetTime)} /><FieldError message={errors.targetTime} /></label>}
      {form.type === 'workout' && <label className="field"><span>목표 볼륨</span><input type="number" min="1" value={safeNumber(form.targetVolume, 5000)} onChange={(event) => updateFormField('targetVolume', event.target.value)} aria-invalid={Boolean(errors.targetVolume)} /><FieldError message={errors.targetVolume} /></label>}
      {form.type === 'study' && <label className="field"><span>목표 공부 시간(분)</span><input type="number" min="1" value={safeNumber(form.targetMinutes, 90)} onChange={(event) => updateFormField('targetMinutes', event.target.value)} aria-invalid={Boolean(errors.targetMinutes)} /><FieldError message={errors.targetMinutes} /></label>}
      {form.type === 'custom' && <label className="field"><span>목표 퍼센트 기준</span><input type="number" min="1" max="100" value={safeNumber(form.targetPercent, 100)} onChange={(event) => updateFormField('targetPercent', event.target.value)} aria-invalid={Boolean(errors.targetPercent)} /><FieldError message={errors.targetPercent} /></label>}

      <div className="form-actions habit-form-compact__actions">
        <button className="secondary-button" type="button" onClick={onCancel}><X size={18} />취소</button>
        <button className="primary-button" type="submit"><Plus size={18} />습관 추가</button>
      </div>
    </form>
  )
}
