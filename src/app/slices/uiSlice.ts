import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  activeModal: string | null
  activeScreen: string
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  activeModal: null,
  activeScreen: 'insights',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.activeModal = null
    },
    setScreen(state, action: PayloadAction<string>) {
      state.activeScreen = action.payload
    },
  },
})

export const { toggleSidebar, setSidebarOpen, setTheme, openModal, closeModal, setScreen } = uiSlice.actions
export default uiSlice.reducer
