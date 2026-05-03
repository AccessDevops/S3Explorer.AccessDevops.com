const STORAGE_KEY = 's3e-theme'

type Theme = 'light' | 'dark'

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function readStored(): Theme | null {
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const isDark = useState<boolean>('dark-mode', () => false)

  onMounted(() => {
    const stored = readStored()
    isDark.value = stored ? stored === 'dark' : systemPrefersDark()
    applyTheme(isDark.value ? 'dark' : 'light')
  })

  function toggle() {
    isDark.value = !isDark.value
    const theme: Theme = isDark.value ? 'dark' : 'light'
    applyTheme(theme)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }

  return { isDark, toggle }
}
