import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Save, Trash2, X } from 'lucide-react'
import {
  SCHEDULE_CATEGORIES,
  SCHEDULE_DAY_ORDER,
  SCHEDULE_REPEAT_TYPES,
  SCHEDULE_WEEKDAYS,
} from '../../constants/scheduleConstants'
import { getHabitDisplayName } from '../../utils/habitUtils'
import {
  createDefaultScheduleEvent,
  detectScheduleConflicts,
  getCategoryMeta,
  getScheduleLinkType,
  validateScheduleEvent,
} from '../../utils/scheduleUtils'

const REPEAT_LABELS = {
  none: '반복 없음',
  weekly: '매주',
  weekdays: '평일',
  weekends: '주말',
  custom: '직접 설정',
}

export default function ScheduleEventModal({
  mode = 'add',
  event,
  schedules = [],
  habits = [],
  todos = [],
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState(() => createDefaultScheduleEvent(event))
  const [errors, setErrors] = useState([])
  const linkType = getScheduleLinkType(form)

  useEffect(() => {
    setForm(createDefaultScheduleEvent(event))
    setErrors([])
  }, [event])

  const conflicts = useMemo(() => detectScheduleConflicts(schedules, form), [schedules, form])

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value }

      if (field === 'dayOfWeek') {
        next.dayOfWeek = Number(value)
        if (!['weekdays', 'weekends'].includes(next.repeatType)) {
          next.repeatDays = [Number(value)]
        }
      }

      if (field === 'repeatType') {
        if (value === 'weekdays') next.repeatDays = [1, 2, 3, 4, 5]
        if (value === 'weekends') next.repeatDays = [6, 0]
        if (value === 'weekly' || value === 'none') next.repeatDays = [Number(next.dayOfWeek)]
        if (value === 'custom' && next.repeatDays.length === 0) next.repeatDays = [Number(next.dayOfWeek)]
      }

      if (field === 'category') {
        const category = getCategoryMeta(value)
        next.color = category.defaultColor
      }

      if (field === 'linkType') {
        next.linkType = value
        next.linkedHabitId = null
        next.linkedTodoId = null
      }

      if (field === 'linkedHabitId') {
        next.linkType = value ? 'habit' : 'none'
        next.linkedHabitId = value || null
        next.linkedTodoId = null
      }

      if (field === 'linkedTodoId') {
        next.linkType = value ? 'todo' : 'none'
        next.linkedTodoId = value || null
        next.linkedHabitId = null
      }

      return next
    })
    setErrors([])
  }

  function toggleRepeatDay(dayOfWeek) {
    setForm((current) => {
      const exists = current.repeatDays.includes(dayOfWeek)
      const repeatDays = exists
        ? current.repeatDays.filter((day) => day !== dayOfWeek)
        : [...current.repeatDays, dayOfWeek]

      return {
        ...current,
        repeatDays: repeatDays.length > 0
          ? repeatDays.sort((left, right) => SCHEDULE_DAY_ORDER.indexOf(left) - SCHEDULE_DAY_ORDER.indexOf(right))
          : [Number(current.dayOfWeek)],
      }
    })
  }

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault()
    const nextErrors = validateScheduleEvent(form)
    setErrors(nextErrors)
    if (nextErrors.length > 0) return

    const scheduleEvent = createDefaultScheduleEvent({
      ...form,
      linkType,
      linkedHabitId: linkType === 'habit' ? form.linkedHabitId : null,
      linkedTodoId: linkType === 'todo' ? form.linkedTodoId : null,
    })

    onSave({
      ...scheduleEvent,
      title: scheduleEvent.title.trim(),
      dayOfWeek: Number(scheduleEvent.dayOfWeek),
    })
  }

  function handleDelete() {
    if (!form.id) return
    if (window.confirm('이 일정을 삭제할까요?')) {
      onDelete(form.id)
    }
  }

  return (
    <div className="modal-overlay schedule-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="schedule-event-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-event-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="schedule-event-modal__head">
          <div>
            <p className="section-kicker">Weekly Planner</p>
            <h2 id="schedule-event-modal-title">{mode === 'edit' ? '일정 수정' : '일정 추가'}</h2>
          </div>
          <button type="button" className="modal-icon-button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form className="schedule-event-form" onSubmit={handleSubmit} noValidate>
          <label className="field schedule-event-form__wide">
            <span>제목</span>
            <input type="text" value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="예: 알고리즘 공부" autoFocus />
          </label>

          <div className="form-split">
            <label className="field">
              <span>요일</span>
              <select className="select-field" value={form.dayOfWeek} onChange={(event) => updateField('dayOfWeek', event.target.value)}>
                {SCHEDULE_WEEKDAYS.map((day) => (
                  <option key={day.dayOfWeek} value={day.dayOfWeek}>{day.longLabel}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>카테고리</span>
              <select className="select-field" value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {Object.values(SCHEDULE_CATEGORIES).map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-split">
            <label className="field">
              <span>시작 시간</span>
              <input type="time" value={form.startTime} onChange={(event) => updateField('startTime', event.target.value)} />
            </label>
            <label className="field">
              <span>종료 시간</span>
              <input type="time" value={form.endTime} onChange={(event) => updateField('endTime', event.target.value)} />
            </label>
          </div>

          <div className="form-split">
            <label className="field">
              <span>반복</span>
              <select className="select-field" value={form.repeatType} onChange={(event) => updateField('repeatType', event.target.value)}>
                {SCHEDULE_REPEAT_TYPES.map((type) => (
                  <option key={type} value={type}>{REPEAT_LABELS[type]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>연결 대상</span>
              <select className="select-field" value={linkType} onChange={(event) => updateField('linkType', event.target.value)}>
                <option value="none">연결 없음</option>
                <option value="habit">습관 연결</option>
                <option value="todo">할 일 연결</option>
              </select>
            </label>
          </div>

          {linkType === 'habit' ? (
            <label className="field">
              <span>연결할 습관</span>
              <select className="select-field" value={form.linkedHabitId ?? ''} onChange={(event) => updateField('linkedHabitId', event.target.value || null)}>
                <option value="">습관을 선택하세요</option>
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>{getHabitDisplayName(habit)}</option>
                ))}
              </select>
            </label>
          ) : null}

          {linkType === 'todo' ? (
            <label className="field">
              <span>연결할 할 일</span>
              <select className="select-field" value={form.linkedTodoId ?? ''} onChange={(event) => updateField('linkedTodoId', event.target.value || null)}>
                <option value="">할 일을 선택하세요</option>
                {todos.map((todo) => (
                  <option key={todo.id} value={todo.id}>{todo.title || 'Untitled todo'}</option>
                ))}
              </select>
            </label>
          ) : null}

          <p className="schedule-link-helper">
            연결 정보는 일정과 습관/할 일을 함께 보여주기 위한 표시용입니다. 자동 완료와 XP/Gold 보상은 아직 실행하지 않습니다.
          </p>

          {form.repeatType === 'custom' ? (
            <div className="schedule-repeat-days">
              {SCHEDULE_WEEKDAYS.map((day) => (
                <button
                  key={day.dayOfWeek}
                  type="button"
                  className={`schedule-repeat-day ${form.repeatDays.includes(day.dayOfWeek) ? 'schedule-repeat-day--active' : ''}`}
                  onClick={() => toggleRepeatDay(day.dayOfWeek)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          ) : null}

          <label className="field">
            <span>색상</span>
            <div className="schedule-color-row">
              {Object.values(SCHEDULE_CATEGORIES).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`schedule-color-swatch ${form.color === category.defaultColor ? 'schedule-color-swatch--active' : ''}`}
                  style={{ backgroundColor: category.defaultColor }}
                  onClick={() => updateField('color', category.defaultColor)}
                  aria-label={`${category.label} 색상`}
                />
              ))}
            </div>
          </label>

          <label className="field">
            <span>메모</span>
            <textarea className="memo-input memo-input--compact" value={form.memo} onChange={(event) => updateField('memo', event.target.value)} placeholder="장소, 준비물, 목표 등을 적어주세요." />
          </label>

          {errors.length > 0 ? (
            <div className="schedule-form-alert schedule-form-alert--danger">
              {errors.map((error) => <span key={error}>{error}</span>)}
            </div>
          ) : null}

          {conflicts.length > 0 ? (
            <div className="schedule-form-alert schedule-form-alert--warning">
              <AlertTriangle size={15} />
              <span>겹치는 일정이 있습니다. 그래도 저장할 수 있습니다.</span>
            </div>
          ) : null}

          <div className="schedule-event-modal__actions">
            {mode === 'edit' ? (
              <button type="button" className="schedule-delete-button" onClick={handleDelete}>
                <Trash2 size={16} /> 삭제
              </button>
            ) : (
              <button type="button" className="secondary-button" onClick={onClose}>
                <X size={16} /> 취소
              </button>
            )}
            <button type="submit" className="primary-button">
              <Save size={16} /> 저장
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
