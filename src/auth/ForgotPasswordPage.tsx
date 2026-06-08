import { useForgotPasswordMutation } from '@/app/services/authApi';
import { ApiError } from '@/types/auth';
import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';


export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.data?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, margin: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="sidebar-logo" style={{ padding: 0, borderBottom: 'none', marginBottom: 6 }}>
            ◆ Fulcrum Hub
          </div>
          <p className="text-muted text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div style={{ background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: 'var(--text-sm)', border: '1px solid var(--green)' }}>
            ✓ Check your inbox — we've sent a reset link to <strong>{email}</strong>.
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 'var(--text-sm)', marginBottom: 16, border: '1px solid var(--red)' }}>
                {error}
              </div>
            )}
            <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="form-input" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
                {isLoading ? <span className="spinner" /> : null}
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
