import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Construction size={28} style={{ color: 'var(--text3)' }} />
      </div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.5px' }}>
        {title}
      </h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', maxWidth: 480, lineHeight: 1.6, marginBottom: 24 }}>
        {description}
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: '100px',
          border: '1px solid var(--border)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text3)',
          background: 'var(--bg3)',
        }}
      >
        Coming soon
      </div>
    </div>
  )
}
