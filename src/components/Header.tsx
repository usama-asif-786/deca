import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleTheme } from "@/redux/theme/actions"
import type { RootState } from "@/redux/store"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sun, Moon, BarChart3, Activity, Monitor, Users, User, LogOut, AlertTriangle } from "lucide-react"
import { logout } from "@/redux/slices/authSlice"
import { useEffect, useState } from "react"
import { getCurrentUserApi } from "@/services/authService"

const Header: React.FC = () => {
  const dispatch = useDispatch()
  const darkMode = useSelector((state: RootState) => state.theme.darkMode)
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | null>(null)
  const userRole = useSelector((state: RootState) => state.auth.user?.role)

  const isActive = (path: string) => location.pathname === path

const baseNavigationItems = [
  { name: "Dashboard", path: "/", icon: Monitor },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Incidents", path: "/incidents", icon: AlertTriangle },
  { name: "Performance", path: "/health", icon: Activity },
]

const navigationItems =
  userRole === "admin" || userRole === "superuser"
    ? [...baseNavigationItems, { name: "User Management", path: "/usermanagement", icon: Users }]
    : baseNavigationItems

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUserApi()
        setCurrentUser({
          name: data.name || data.username,
          avatar: data.avatar, 
        })
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUser()
  }, [])

  const handleUpdateProfile = () => {
    navigate("/updatepassword")
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full h-[8vh] backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-tr from-cyan-400/10 to-pink-600/10 rounded-full blur-2xl" />
      </div>


        <div className="flex justify-end gap-3">
          <Button
            onClick={() => dispatch(toggleTheme())}
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-600 dark:text-slate-400" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name || "User"} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {currentUser?.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
              align="end"
              forceMount
            >
              <DropdownMenuItem
                onClick={handleUpdateProfile}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Update Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </header>
  )
}

export default Header
