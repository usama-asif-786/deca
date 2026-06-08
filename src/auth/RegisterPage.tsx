import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/app/hooks'
import { useRegisterMutation } from '@/app/services/authApi'
import { setCredentials } from '@/app/slices/authSlice'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const result = await register(form).unwrap()

      // ✅ STORE IN REDUX ONLY
      dispatch(
        setCredentials({
          user: result.user,
          token: result.access_token,
        })
      )

      // ✅ go to dashboard
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, margin: 0 }}>

        <div style={{ marginBottom: 28 }}>
          <div className="sidebar-logo" style={{ padding: 0, borderBottom: 'none', marginBottom: 6 }}>
            ◆ Fulcrum Hub
          </div>
          <p className="text-muted text-sm">Create your account</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-bg)',
            color: 'var(--red)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            fontSize: 'var(--text-sm)',
            marginBottom: 16,
            border: '1px solid var(--red)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              className="form-input"
              required
            />

            <input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
            required
            style={{ marginTop: 12 }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="form-input"
            required
            minLength={8}
            style={{ marginTop: 12 }}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 16 }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}