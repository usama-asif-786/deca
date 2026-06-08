// Navigation items definition
export interface NavItem {
  id: string
  label: string
  icon: string
  section: string
  badgeKey?: string
}

export const NAV_ITEMS: NavItem[] = [
  // Insights
  { id: 'insights', label: 'Dashboard', icon: 'BarChart2', section: 'Insights' },
  { id: 'monitoring', label: 'Monitoring & Alerts', icon: 'Bell', section: 'Insights', badgeKey: 'alerts' },
  { id: 'askai', label: 'Ask AI', icon: 'Sparkles', section: 'Insights' },
  { id: 'datacards', label: 'Data Cards', icon: 'CreditCard', section: 'Insights' },
  // Data
  { id: 'tenants', label: 'Tenants & Privacy', icon: 'Building2', section: 'Data', badgeKey: 'tenants' },
  { id: 'dataconnectors', label: 'Data Connectors', icon: 'Plug', section: 'Data', badgeKey: 'sources' },
  { id: 'datamanagement', label: 'Data Management', icon: 'Settings', section: 'Data' },
  { id: 'catalog', label: 'Catalog & Lineage', icon: 'BookOpen', section: 'Data' },
  { id: 'featurestore', label: 'Feature Store', icon: 'Dice6', section: 'Data' },
  // AI & ML
  { id: 'labeling', label: 'Data Labeling', icon: 'Tags', section: 'AI & ML' },
  { id: 'training', label: 'Training & Experiments', icon: 'Rocket', section: 'AI & ML' },
  { id: 'models', label: 'Models & Governance', icon: 'Bot', section: 'AI & ML' },
  { id: 'federated', label: 'Federated & Decentralized', icon: 'Globe', section: 'AI & ML' },
  // Platform
  { id: 'operations', label: 'Operations', icon: 'Zap', section: 'Platform' },
  { id: 'developer', label: 'Developer & Marketplace', icon: 'Monitor', section: 'Platform' },
  { id: 'infra', label: 'Infrastructure', icon: 'Cloud', section: 'Platform' },
  // Team
  { id: 'teamusers', label: 'Team & Users', icon: 'Users', section: 'Team' },
]

export const SCREEN_TITLES: Record<string, string> = {
  insights: 'Dashboard',
  monitoring: 'Monitoring & Alerts',
  askai: 'Ask AI',
  datacards: 'Data Cards',
  tenants: 'Tenants & Privacy',
  dataconnectors: 'Data Connectors',
  datamanagement: 'Data Management',
  catalog: 'Catalog & Lineage',
  featurestore: 'Feature Store',
  labeling: 'Data Labeling',
  training: 'Training & Experiments',
  models: 'Models & Governance',
  federated: 'Federated & Decentralized',
  operations: 'Operations',
  developer: 'Developer & Marketplace',
  infra: 'Infrastructure',
  teamusers: 'Team & Users',
}

export const DATE_RANGE_OPTIONS = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'ytd', label: 'YTD' },
]
