import { Sun, Moon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setTheme } from '@/app/slices/uiSlice'
import { useEffect } from 'react'

export default function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.ui.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
  }

  return (
    <button
      className="btn btn-ghost btn-xs"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  )
}
