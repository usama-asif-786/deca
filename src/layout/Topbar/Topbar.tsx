import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { SCREEN_TITLES } from '@/lib/constants'
import SearchInput from '@/components/common/SearchInput'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  const activeScreen = useAppSelector((s) => s.ui.activeScreen)
  const [search, setSearch] = useState('')

  const title = SCREEN_TITLES[activeScreen] ?? activeScreen

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-actions">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search..."
          className="w-[200px] h-[25px]"
        />

        <button
          className="btn btn-xs btn-ghost"
          title="Platform Tour"
          style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}
        >
          <MapPin size={13} />
          Tour
        </button>

        <ThemeToggle />
        <NotificationBell />
      </div>
    </div>
  )
}
