import Pill from '@/components/common/Pill'

interface SourceStatusBadgeProps {
  connected: boolean
}

export default function SourceStatusBadge({ connected }: SourceStatusBadgeProps) {
  return (
    <Pill variant={connected ? 'green' : 'gray'}>
      {connected ? 'Connected' : 'Disconnected'}
    </Pill>
  )
}
