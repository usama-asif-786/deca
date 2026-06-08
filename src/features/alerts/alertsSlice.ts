import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AlertsState {
  activeTab: string
  expandedAlert: string | null
}

const initialState: AlertsState = {
  activeTab: 'alerts',
  expandedAlert: null,
}

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload
    },
    setExpandedAlert(state, action: PayloadAction<string | null>) {
      state.expandedAlert = action.payload
    },
  },
})

export const { setActiveTab, setExpandedAlert } = alertsSlice.actions
export default alertsSlice.reducer
