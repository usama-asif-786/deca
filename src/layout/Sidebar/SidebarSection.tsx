interface SidebarSectionProps {
  label: string
}

export default function SidebarSection({ label }: SidebarSectionProps) {
  return <div className="sidebar-section">{label}</div>
}
