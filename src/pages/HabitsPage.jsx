import { useState } from 'react'
import { ChevronDown, ChevronUp, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { HABIT_TYPES, QUICK_HABITS, WEEKDAY_OPTIONS } from '../constants/habitConstants'
import HabitForm from '../components/HabitForm'
import { getHabitDisplayName, getHabitEmoji, getHabitGoalLabel, getHabitMonthlyGoalLabel, safeNumber } from '../utils/habitUtils'

export default function HabitsPage({ habits, form, habitErrors, quickSettings, updateFormField, updateQuickSetting, toggleQuickActiveDay, toggleDay, handleCreateHabit, resetHabitForm, addQuickHabit, deleteHabit, onEditHabit }) {
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false)

  return (
    <>
      <section className="panel quick-habits-panel">
        <div className="section-header"><div><p className="section-kicker">빠른 추가</p><h2>자주 쓰는 습관</h2></div><Plus size={18} /></div>
        <div className="quick-habit-grid">
          {QUICK_HABITS.map((habit) => {
            const settings = quickSettings[habit.id] ?? habit.defaults
            return (
              <article key={habit.id} className="quick-habit-card">
                <div className="quick-habit-card__head">
                  <strong><span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>{habit.name}</strong>
                  <div className="quick-habit-card__tools">
                    <span>{HABIT_TYPES.find((item) => item.value === habit.type)?.label}</span>
                    <button type="button" className="quick-add-button quick-add-button--icon" onClick={() => addQuickHabit(habit)} aria-label={`${habit.name} 추가`}><Plus size={14} /></button>
                  </div>
                </div>
                {habit.type === 'wake' && <label className="quick-field"><span>목표 기상 시간</span><input type="time" value={settings.targetTime ?? '07:00'} onChange={(event) => updateQuickSetting(habit.id, 'targetTime', event.target.value)} /></label>}
                {habit.type === 'workout' && <label className="quick-field"><span>목표 운동 볼륨</span><input type="number" min="1" value={safeNumber(settings.targetVolume, 5000)} onChange={(event) => updateQuickSetting(habit.id, 'targetVolume', event.target.value)} /></label>}
                {habit.type === 'study' && <div className="quick-field-grid"><label className="quick-field"><span>{habit.id === 'reading' ? '읽을 내용' : '공부할 내용'}</span><input type="text" value={settings.subject ?? ''} onChange={(event) => updateQuickSetting(habit.id, 'subject', event.target.value)} placeholder={habit.id === 'reading' ? '예: 경제 책' : '예: 영어 단어'} /></label><label className="quick-field"><span>목표 시간(분)</span><input type="number" min="1" value={safeNumber(settings.targetMinutes, 30)} onChange={(event) => updateQuickSetting(habit.id, 'targetMinutes', event.target.value)} /></label></div>}
                <div className="quick-day-row" aria-label="Active days">
                  {WEEKDAY_OPTIONS.map((day) => (
                    <button key={day.value} type="button" className={`day-pill ${settings.activeDays?.includes(day.value) ? 'day-pill--active' : ''}`} onClick={() => toggleQuickActiveDay?.(habit.id, day.value)}>
                      {day.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="quick-add-button" onClick={() => addQuickHabit(habit)}><Plus size={16} />추가</button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel habit-create-panel">
        <div className="section-header">
          <div>
            <p className="section-kicker">직접 추가</p>
            <h2>새 습관 만들기</h2>
            <p className="compact-helper habit-create-panel__hint">필요할 때만 열어서 세부 습관을 직접 설정하세요.</p>
          </div>
          <button type="button" className="compact-toggle-button" onClick={() => setIsHabitFormOpen((current) => !current)} aria-expanded={isHabitFormOpen}>
            {isHabitFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{isHabitFormOpen ? '닫기' : '열기'}</span>
          </button>
        </div>
        {isHabitFormOpen ? <HabitForm form={form} errors={habitErrors} updateFormField={updateFormField} toggleDay={toggleDay} handleCreateHabit={handleCreateHabit} onCancel={resetHabitForm} /> : null}
      </section>

      <section className="panel">
        <div className="section-header"><div><p className="section-kicker">수정</p><h2>등록된 습관 관리</h2></div><ClipboardList size={18} /></div>
        <div className="manage-list">
          {habits.length === 0 ? <div className="empty-card"><p>아직 등록된 습관이 없어요.</p><span>빠른 추가나 직접 추가로 먼저 습관을 만들어 보세요.</span></div> : habits.map((habit) => (
            <article key={habit.id} className="manage-row manage-row--clickable" role="button" tabIndex={0} onClick={() => onEditHabit?.(habit)} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onEditHabit?.(habit)
            }}>
              <span className="overview-dot" style={{ backgroundColor: habit.color }} />
              <div><strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong><span>{HABIT_TYPES.find((item) => item.value === habit.type)?.label} ? {getHabitMonthlyGoalLabel(habit)} ? {getHabitGoalLabel(habit)}</span></div>
              <button type="button" className="icon-danger-button" onClick={(event) => {
                event.stopPropagation()
                deleteHabit(habit.id)
              }} aria-label={`${habit.name} 삭제`} title="삭제"><Trash2 size={16} /></button>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
