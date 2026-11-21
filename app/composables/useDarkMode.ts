const STORAGE_KEY = 's3e-theme'

type Theme = 'light' | 'dark'

// Browser chrome color for each page background
const THEME_COLORS: Record<Theme, string> = { light: '#ffffff', dark: '#020817' }

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', THEME_COLORS[theme])
  })
}

export function useDarkMode() {
  const isDark = useState<boolean>('dark-mode', () => false)

  // The head script in nuxt.config.ts picks the theme before the first paint
  // (stored choice, else a dark system theme from 23:00 to 07:00): read it back
  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  function toggle() {
    isDark.value = !isDark.value
    const theme: Theme = isDark.value ? 'dark' : 'light'
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage blocked (private mode, sandboxed frame): the choice lasts for the page
    }
  }

  return { isDark, toggle }
}
