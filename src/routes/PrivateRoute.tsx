import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}