import { useResetPasswordMutation } from '@/app/services/authApi';
import { ApiError } from '@/types/auth';
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';


export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Invalid or missing reset token.'); return; }
    try {
      await resetPassword({ token, newPassword }).unwrap();
      navigate('/login', { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.data?.message ?? 'Reset failed. The link may have expired.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, margin: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="sidebar-logo" style={{ padding: 0, borderBottom: 'none', marginBottom: 6 }}>
            ◆ Fulcrum Hub
          </div>
          <p className="text-muted text-sm">Set a new password</p>
        </div>

        {error && (
          <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 'var(--text-sm)', marginBottom: 16, border: '1px solid var(--red)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New password</label>
            <input id="newPassword" type="password" className="form-input" placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" className="form-input" placeholder="Repeat your password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading || !token}>
            {isLoading ? <span className="spinner" /> : null}
            {isLoading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
