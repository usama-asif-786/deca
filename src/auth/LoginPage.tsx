import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/app/hooks'
import { useLoginMutation } from '@/app/services/authApi'
import { setCredentials } from '@/app/slices/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const result = await login({ email, password }).unwrap()

      // ✅ Store in Redux (NO localStorage)
      dispatch(
        setCredentials({
          user: result.user,
          token: result.access_token,
        })
      )

      navigate('/')
    } catch (err: any) {
      setError(err?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 420, margin: 0 }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            className="sidebar-logo"
            style={{ padding: 0, borderBottom: 'none', marginBottom: 6 }}
          >
            ◆ Fulcrum Hub
          </div>
          <p className="text-muted text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--red-bg)',
              color: 'var(--red)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              fontSize: 'var(--text-sm)',
              marginBottom: 16,
              border: '1px solid var(--red)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-muted"
              style={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner" /> : null}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p
          className="text-xs text-muted"
          style={{ textAlign: 'center', marginTop: 20 }}
        >
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/register"
            style={{
              color: 'var(--text)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}