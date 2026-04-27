import { Plus, X } from 'lucide-react'
import { EVENT_CATEGORY_OPTIONS, EVENT_COLOR_OPTIONS } from '../constants/habitConstants'

function FieldError({ message }) {
  return message ? <span className="field-error">{message}</span> : null
}

export default function EventForm({ eventForm, errors = {}, updateEventFormField, handleCreateEvent, onCancel }) {
  return (
    <form className="habit-form" onSubmit={handleCreateEvent} noValidate>
      <label className="field">
        <span>일정 제목</span>
        <input type="text" value={eventForm.title} onChange={(event) => updateEventFormField('title', event.target.value)} placeholder="예: 병원 예약" aria-invalid={Boolean(errors.title)} />
        <FieldError message={errors.title} />
      </label>

      <div className="form-split">
        <label className="field">
          <span>날짜</span>
          <input type="date" value={eventForm.date} onChange={(event) => updateEventFormField('date', event.target.value)} aria-invalid={Boolean(errors.date)} />
          <FieldError message={errors.date} />
        </label>
        <label className="field field--inline">
          <span>하루 종일</span>
          <input type="checkbox" checked={eventForm.isAllDay} onChange={(event) => updateEventFormField('isAllDay', event.target.checked)} />
        </label>
      </div>

      <div className="form-split">
        <label className="field">
          <span>시작 시간</span>
          <input type="time" value={eventForm.startTime} disabled={eventForm.isAllDay} onChange={(event) => updateEventFormField('startTime', event.target.value)} aria-invalid={Boolean(errors.time)} />
        </label>
        <label className="field">
          <span>종료 시간</span>
          <input type="time" value={eventForm.endTime} disabled={eventForm.isAllDay} onChange={(event) => updateEventFormField('endTime', event.target.value)} aria-invalid={Boolean(errors.time)} />
        </label>
      </div>
      <FieldError message={errors.time} />

      <div className="form-split">
        <label className="field">
          <span>장소</span>
          <input type="text" value={eventForm.location} onChange={(event) => updateEventFormField('location', event.target.value)} placeholder="예: 강남역" />
        </label>
        <label className="field">
          <span>카테고리</span>
          <select className="select-field" value={eventForm.category} onChange={(event) => updateEventFormField('category', event.target.value)}>
            {EVENT_CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>색상</span>
        <div className="color-row">
          {EVENT_COLOR_OPTIONS.map((color) => (
            <button key={color} type="button" className={`color-swatch ${eventForm.color === color ? 'color-swatch--active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateEventFormField('color', color)} aria-label={`${color} 색상 선택`} />
          ))}
        </div>
      </label>

      <label className="field">
        <span>메모</span>
        <textarea className="memo-input memo-input--compact" value={eventForm.memo} onChange={(event) => updateEventFormField('memo', event.target.value)} placeholder="필요한 내용을 적어두세요." />
      </label>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}><X size={18} />취소</button>
        <button className="primary-button" type="submit"><Plus size={18} />일정 추가</button>
      </div>
    </form>
  )
}
