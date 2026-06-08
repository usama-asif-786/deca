const SUGGESTIONS = [
  'What is our current churn rate?',
  'Summarize Q1 revenue performance',
  'Which data sources need attention?',
  'Show me NPS trends by segment',
  'What are the top pipeline bottlenecks?',
  'Generate a retention action plan',
]

interface SuggestChipsProps {
  onSelect: (text: string) => void
}

export default function SuggestChips({ onSelect }: SuggestChipsProps) {
  return (
    <div className="suggest-chips">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          className="suggest-chip"
          onClick={() => onSelect(s)}
          type="button"
        >
          {s}
        </button>
      ))}
    </div>
  )
}
