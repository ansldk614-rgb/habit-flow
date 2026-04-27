import { useEffect, useRef, useState } from 'react'
import { Check, Download, RotateCcw, Upload, X } from 'lucide-react'
import { THEMES } from '../../constants/themeConstants'

const BACKUP_VERSION = 1
const PERIOD_MODE_STORAGE_KEY = 'habit-flow-period-mode'
const LIGHT_THEME_IDS = new Set(['softMintDay', 'warmPaperPeach'])

function getBackupFileName() {
  const dateKey = new Date().toISOString().slice(0, 10)
  return `habit-flow-backup-${dateKey}.json`
}

function validateBackup(value) {
  if (!value || typeof value !== 'object' || value.app !== 'Habit Flow') {
    return 'This file is not a valid Habit Flow backup.'
  }

  if (!value.data || typeof value.data !== 'object') {
    return 'Backup data is missing.'
  }

  if (!Array.isArray(value.data.habits) || !value.data.completions || typeof value.data.completions !== 'object') {
    return 'Backup habits or completions are invalid.'
  }

  if (value.data.events && !Array.isArray(value.data.events)) {
    return 'Backup events are invalid.'
  }

  if (value.data.todos && !Array.isArray(value.data.todos)) {
    return 'Backup todos are invalid.'
  }

  return ''
}

function ThemeCard({ theme, isSelected, onSelectTheme }) {
  return (
    <button
      type="button"
      className={`theme-card ${isSelected ? 'theme-card--selected' : ''}`}
      onClick={() => onSelectTheme(theme)}
      aria-pressed={isSelected}
    >
      <span className="theme-card__check" aria-hidden="true">
        {isSelected ? <Check size={15} /> : null}
      </span>
      <span className="theme-card__body">
        <strong>{theme.name}</strong>
        <small>{theme.description}</small>
        <span className="theme-swatches" aria-hidden="true">
          <i style={{ background: theme.colors.bg }} />
          <i style={{ background: theme.colors.surface }} />
          <i style={{ background: theme.colors.accent }} />
          <i style={{ background: theme.colors.danger }} />
        </span>
      </span>
    </button>
  )
}

export default function SettingsPanel({
  selectedThemeId,
  periodMode = 'recent',
  appData,
  onSelectTheme,
  onImportData,
  onResetData,
  onClose,
}) {
  const fileInputRef = useRef(null)
  const [dataMessage, setDataMessage] = useState('')
  const [dataError, setDataError] = useState('')
  const darkThemes = THEMES.filter((theme) => !LIGHT_THEME_IDS.has(theme.id))
  const lightThemes = THEMES.filter((theme) => LIGHT_THEME_IDS.has(theme.id))
  const themeGroups = [
    { title: 'Dark Themes', themes: darkThemes },
    { title: 'Light Themes', themes: lightThemes },
  ].filter((group) => group.themes.length > 0)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function clearDataStatus() {
    setDataMessage('')
    setDataError('')
  }

  function exportData() {
    clearDataStatus()

    const backup = {
      app: 'Habit Flow',
      backupVersion: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        version: appData?.version ?? 1,
        habits: appData?.habits ?? [],
        completions: appData?.completions ?? {},
        events: appData?.events ?? [],
        todos: appData?.todos ?? [],
        settings: appData?.settings ?? {},
      },
      theme: selectedThemeId,
      periodMode: window.localStorage.getItem(PERIOD_MODE_STORAGE_KEY) ?? periodMode,
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getBackupFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setDataMessage('Backup exported.')
  }

  function importData(event) {
    clearDataStatus()
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const validationError = validateBackup(parsed)

        if (validationError) {
          setDataError(validationError)
          return
        }

        if (!window.confirm('Importing this backup will replace your current Habit Flow data. Continue?')) {
          setDataMessage('Import canceled.')
          return
        }

        onImportData?.(parsed)
        setDataMessage('Backup imported. Your dashboard has been updated.')
      } catch {
        setDataError('Could not read this JSON file.')
      }
    }

    reader.onerror = () => setDataError('Could not read this file.')
    reader.readAsText(file)
  }

  function resetData() {
    clearDataStatus()

    if (!window.confirm('This will delete your Habit Flow data in this browser. Export a backup first if needed. Continue?')) {
      setDataMessage('Reset canceled.')
      return
    }

    onResetData?.()
    setDataMessage('Data reset complete.')
  }

  return (
    <div className="settings-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-panel__head">
          <div>
            <span>Settings</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button type="button" className="settings-icon-button" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </header>

        <section className="settings-section">
          <div className="settings-section__head">
            <span>Appearance</span>
            <strong>Theme</strong>
          </div>

          <div className="theme-group-list">
            {themeGroups.map((group) => (
              <div className="theme-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="theme-card-list">
                  {group.themes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isSelected={selectedThemeId === theme.id}
                      onSelectTheme={onSelectTheme}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section settings-section--data">
          <div className="settings-section__head">
            <span>Data Management</span>
            <strong>Backup / Restore</strong>
          </div>

          <p className="settings-help-text">
            Your data is stored locally in this browser. Export a backup before clearing browser data.
          </p>

          <div className="settings-data-actions">
            <button type="button" className="settings-action-button" onClick={exportData}>
              <Download size={15} />
              Export Data
            </button>
            <button type="button" className="settings-action-button" onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} />
              Import Data
            </button>
            <button type="button" className="settings-action-button settings-action-button--danger" onClick={resetData}>
              <RotateCcw size={15} />
              Reset Data
            </button>
          </div>

          <input ref={fileInputRef} className="settings-file-input" type="file" accept="application/json,.json" onChange={importData} />
          {dataError ? <p className="settings-status settings-status--error">{dataError}</p> : null}
          {dataMessage ? <p className="settings-status">{dataMessage}</p> : null}
        </section>
      </aside>
    </div>
  )
}
