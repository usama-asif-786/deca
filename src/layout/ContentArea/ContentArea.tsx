import { useAppSelector } from '@/app/hooks'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ChatPage from '@/features/chat/ChatPage'
import TasksPage from '@/features/tasks/TasksPage'
import AlertsPage from '@/features/alerts/AlertsPage'
import SourcesPage from '@/features/sources/SourcesPage'
import MonitoringPage from '@/features/monitoring/MonitoringPage'
import TenantsPage from '@/features/tenants/TenantsPage'
import DataCardsPage from '@/features/datacards/DataCardsPage'
import DataManagementPage from '@/features/datamanagement/DataManagementPage'
import CatalogPage from '@/features/catalog/CatalogPage'
import FeatureStorePage from '@/features/featurestore/FeatureStorePage'
import LabelingPage from '@/features/labeling/LabelingPage'
import TrainingPage from '@/features/training/TrainingPage'
import ModelsPage from '@/features/models/ModelsPage'
import FederatedPage from '@/features/federated/FederatedPage'
import OperationsPage from '@/features/operations/OperationsPage'
import DeveloperPage from '@/features/developer/DeveloperPage'
import InfraPage from '@/features/infra/InfraPage'
import TeamUsersPage from '@/features/teamusers/TeamUsersPage'

export default function ContentArea() {
  const activeScreen = useAppSelector((s) => s.ui.activeScreen)

  const renderScreen = () => {
    switch (activeScreen) {
      case 'insights':
        return <DashboardPage />
      case 'monitoring':
        return <MonitoringPage />
      case 'askai':
        return <ChatPage />
      case 'datacards':
        return <DataCardsPage />
      case 'tenants':
        return <TenantsPage />
      case 'dataconnectors':
        return <SourcesPage />
      case 'datamanagement':
        return <DataManagementPage />
      case 'catalog':
        return <CatalogPage />
      case 'featurestore':
        return <FeatureStorePage />
      case 'labeling':
        return <LabelingPage />
      case 'training':
        return <TrainingPage />
      case 'models':
        return <ModelsPage />
      case 'federated':
        return <FederatedPage />
      case 'operations':
        return <OperationsPage />
      case 'developer':
        return <DeveloperPage />
      case 'infra':
        return <InfraPage />
      case 'teamusers':
        return <TeamUsersPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="content" id="content">
      <div className="animate-in">{renderScreen()}</div>
    </div>
  )
}
