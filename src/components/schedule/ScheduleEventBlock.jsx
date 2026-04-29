import { StickyNote } from 'lucide-react'
import { getCategoryMeta, getRepeatLabel, getScheduleLinkLabel } from '../../utils/scheduleUtils'

export default function ScheduleEventBlock({ event, style, habits = [], todos = [], isConflict = false, onClick }) {
  const category = getCategoryMeta(event.category)
  const repeatLabel = getRepeatLabel(event.repeatType)
  const link = getScheduleLinkLabel(event, habits, todos)
  const linkName = link.name || (link.isMissing ? '삭제된 항목' : '')

  return (
    <button
      type="button"
      className={`weekly-schedule-block weekly-schedule-block--${category.id} ${isConflict ? 'weekly-schedule-block--conflict' : ''}`}
      style={{
        ...style,
        '--schedule-block-color': event.color || category.defaultColor,
      }}
      onClick={onClick}
      title={`${event.title} ${event.startTime}-${event.endTime}${event.memo ? ` · ${event.memo}` : ''}`}
    >
      <strong>{event.title}</strong>
      <span>{event.startTime} - {event.endTime}</span>
      <em>
        {category.label}
        {event.memo ? <StickyNote size={11} aria-label="메모 있음" /> : null}
      </em>
      {link.type !== 'none' ? (
        <small className={`weekly-schedule-block__link weekly-schedule-block__link--${link.type}`}>
          {link.badge}{linkName ? ` · ${linkName}` : ''}
        </small>
      ) : null}
      {repeatLabel ? <small className="weekly-schedule-block__repeat">{repeatLabel}</small> : null}
    </button>
  )
}
