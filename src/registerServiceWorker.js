export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Habit Flow service worker registration failed.', error)
    })
  }

  if (document.readyState === 'complete') {
    register()
    return
  }

  window.addEventListener('load', register, { once: true })
}
