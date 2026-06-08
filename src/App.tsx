import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import PrivateRoute from './routes/PrivateRoute'

// Pages
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
import LoginPage from '@/auth/LoginPage'
import RegisterPage from './auth/RegisterPage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="askai" element={<ChatPage />} />
          <Route path="datacards" element={<DataCardsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="dataconnectors" element={<SourcesPage />} />
          <Route path="datamanagement" element={<DataManagementPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="featurestore" element={<FeatureStorePage />} />
          <Route path="labeling" element={<LabelingPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="federated" element={<FederatedPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="infra" element={<InfraPage />} />
          <Route path="teamusers" element={<TeamUsersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}