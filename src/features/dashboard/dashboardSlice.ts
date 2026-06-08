import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface DashboardState {
  activeTab: string
  dateRange: string
}

const initialState: DashboardState = {
  activeTab: 'overview',
  dateRange: '30d',
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload
    },
    setDateRange(state, action: PayloadAction<string>) {
      state.dateRange = action.payload
    },
  },
})

export const { setActiveTab, setDateRange } = dashboardSlice.actions
export default dashboardSlice.reducer
