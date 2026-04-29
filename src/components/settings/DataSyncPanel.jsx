import { useMemo, useState } from 'react'
import { CloudUpload } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SCHEDULE_STORAGE_KEY } from '../../constants/scheduleConstants'
import { THEME_STORAGE_KEY } from '../../constants/themeConstants'
import { migrateStoredState } from '../../hooks/useLocalStorage'
import { normalizeProgress } from '../../utils/habitUtils'
import { normalizeScheduleEvents } from '../../utils/scheduleUtils'
import { upsertCompletion, upsertHabit } from '../../services/habitService'
import { upsertTodo } from '../../services/todoService'
import { upsertSchedule } from '../../services/scheduleService'
import { upsertSlimeProfile } from '../../services/slimeService'
import { upsertUserSettings } from '../../services/settingsService'

const PERIOD_MODE_STORAGE_KEY = 'habit-flow-period-mode'
const CLOUD_MODE_STORAGE_KEY = 'habitFlowCloudModeReady'

function getSeparateStoredSchedules() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(SCHEDULE_STORAGE_KEY)
    return saved ? normalizeScheduleEvents(JSON.parse(saved)) : []
  } catch {
    return []
  }
}

function mergeSchedules(appSchedules, separateSchedules) {
  const byId = new Map()

  ;[...normalizeScheduleEvents(appSchedules), ...normalizeScheduleEvents(separateSchedules)].forEach((schedule) => {
    if (schedule.id) {
      byId.set(schedule.id, schedule)
    }
  })

  return [...byId.values()]
}

function getCompletionRows(completions) {
  const rows = []

  Object.entries(completions ?? {}).forEach(([dateKey, entries]) => {
    Object.entries(entries ?? {}).forEach(([habitId, log]) => {
      const progressPercent = normalizeProgress(
        typeof log === 'object' && log !== null ? log.progressPercent : log,
      )

      rows.push({
        habitId,
        dateKey,
        value: progressPercent,
        progressPercent,
        isCompleted: progressPercent >= 100,
      })
    })
  })

  return rows
}

async function runBatch(items, action, label) {
  const failures = []
  let successCount = 0

  for (const item of items) {
    const result = await action(item)
    if (result?.error) {
      failures.push(`${label}: ${item?.name || item?.title || item?.id || item?.dateKey || 'item'} - ${result.error.message}`)
      continue
    }

    successCount += 1
  }

  return { successCount, failures }
}

export default function DataSyncPanel({ appData }) {
  const { user, isAuthenticated, isSupabaseConfigured } = useAuth()
  const [isMigrating, setIsMigrating] = useState(false)
  const [result, setResult] = useState(null)
  const [cloudModeReady, setCloudModeReady] = useState(() => (
    typeof window !== 'undefined' && window.localStorage.getItem(CLOUD_MODE_STORAGE_KEY) === 'true'
  ))

  const migrationSource = useMemo(() => {
    const normalizedAppData = migrateStoredState(appData)
    const schedules = mergeSchedules(normalizedAppData.schedules, getSeparateStoredSchedules())

    return {
      ...normalizedAppData,
      schedules,
      completionRows: getCompletionRows(normalizedAppData.completions),
    }
  }, [appData])

  const summary = {
    habits: migrationSource.habits.length,
    completions: migrationSource.completionRows.length,
    todos: migrationSource.todos.length,
    schedules: migrationSource.schedules.length,
    slimeProfile: migrationSource.companion ? 1 : 0,
    settings: 1,
  }

  function setCloudReady(nextValue) {
    setCloudModeReady(nextValue)
    window.localStorage.setItem(CLOUD_MODE_STORAGE_KEY, nextValue ? 'true' : 'false')
  }

  async function migrateToCloud() {
    setResult(null)

    if (!isSupabaseConfigured) {
      setResult({ ok: false, failures: ['Supabase environment variables are not configured.'] })
      return
    }

    if (!isAuthenticated || !user?.id) {
      setResult({ ok: false, failures: ['Log in before migrating local data.'] })
      return
    }

    if (!window.confirm('Copy your current local Habit Flow data to this Supabase account? Your local data will not be deleted.')) {
      setResult({ ok: false, canceled: true, failures: [] })
      return
    }

    setIsMigrating(true)

    try {
      const failures = []
      const counts = {}
      const userId = user.id

      const habitResult = await runBatch(migrationSource.habits, (habit) => upsertHabit(userId, habit), 'habit')
      counts.habits = habitResult.successCount
      failures.push(...habitResult.failures)

      const completionResult = await runBatch(
        migrationSource.completionRows,
        (completion) => upsertCompletion(userId, completion),
        'completion',
      )
      counts.completions = completionResult.successCount
      failures.push(...completionResult.failures)

      const todoResult = await runBatch(migrationSource.todos, (todo) => upsertTodo(userId, todo), 'todo')
      counts.todos = todoResult.successCount
      failures.push(...todoResult.failures)

      const scheduleResult = await runBatch(
        migrationSource.schedules,
        (schedule) => upsertSchedule(userId, schedule),
        'schedule',
      )
      counts.schedules = scheduleResult.successCount
      failures.push(...scheduleResult.failures)

      const slimeResult = await upsertSlimeProfile(userId, migrationSource.companion)
      counts.slimeProfile = slimeResult.error ? 0 : 1
      if (slimeResult.error) failures.push(`slimeProfile: ${slimeResult.error.message}`)

      const settingsResult = await upsertUserSettings(userId, {
        themeId: window.localStorage.getItem(THEME_STORAGE_KEY) || migrationSource.settings?.theme,
        developerMode: window.localStorage.getItem('habitFlowDeveloperMode') === 'true',
        settings: {
          ...migrationSource.settings,
          periodMode: window.localStorage.getItem(PERIOD_MODE_STORAGE_KEY) || 'recent',
        },
      })
      counts.settings = settingsResult.error ? 0 : 1
      if (settingsResult.error) failures.push(`settings: ${settingsResult.error.message}`)

      setResult({ ok: failures.length === 0, counts, failures })

      if (failures.length === 0) {
        setCloudReady(true)
      }
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <section className="settings-section settings-section--sync">
      <div className="settings-section__head">
        <span>Data Sync</span>
        <strong>Move Local Data to Cloud</strong>
      </div>

      <p className="settings-help-text">
        This copies your browser data to your signed-in account. Local data stays on this device.
      </p>

      <div className="sync-summary-grid" aria-label="Migration data summary">
        <span>Habits <strong>{summary.habits}</strong></span>
        <span>Records <strong>{summary.completions}</strong></span>
        <span>Todos <strong>{summary.todos}</strong></span>
        <span>Schedules <strong>{summary.schedules}</strong></span>
      </div>

      <button
        type="button"
        className="settings-action-button"
        onClick={migrateToCloud}
        disabled={isMigrating || !isAuthenticated || !isSupabaseConfigured}
      >
        <CloudUpload size={15} />
        {isMigrating ? 'Migrating...' : 'Move Local Data to Cloud'}
      </button>

      {!isAuthenticated ? (
        <p className="settings-status settings-status--error">Log in before moving data to the cloud.</p>
      ) : null}

      {isAuthenticated && !isSupabaseConfigured ? (
        <p className="settings-status settings-status--error">Supabase environment variables are missing.</p>
      ) : null}

      {cloudModeReady ? (
        <p className="settings-status">Cloud data is prepared for this account. UI switching will be connected in the next step.</p>
      ) : null}

      {result?.canceled ? <p className="settings-status">Migration canceled.</p> : null}

      {result && !result.canceled ? (
        <div className={result.ok ? 'settings-status' : 'settings-status settings-status--error'}>
          <strong>{result.ok ? 'Migration complete.' : 'Migration finished with issues.'}</strong>
          {result.counts ? (
            <small>
              Habits {result.counts.habits ?? 0}, Records {result.counts.completions ?? 0}, Todos {result.counts.todos ?? 0}, Schedules {result.counts.schedules ?? 0}
            </small>
          ) : null}
          {result.failures?.length ? (
            <ul className="sync-failure-list">
              {result.failures.slice(0, 8).map((failure) => (
                <li key={failure}>{failure}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
