import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ViewMode = 'table' | 'card'

interface SourcesState {
  view: ViewMode
  search: string
  typeFilter: string
  tenantFilter: string
  page: number
}

const initialState: SourcesState = {
  view: 'table',
  search: '',
  typeFilter: 'all',
  tenantFilter: 'all',
  page: 1,
}

const sourcesSlice = createSlice({
  name: 'sources',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<ViewMode>) {
      state.view = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setTypeFilter(state, action: PayloadAction<string>) {
      state.typeFilter = action.payload
      state.page = 1
    },
    setTenantFilter(state, action: PayloadAction<string>) {
      state.tenantFilter = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
  },
})

export const { setView, setSearch, setTypeFilter, setTenantFilter, setPage } = sourcesSlice.actions
export default sourcesSlice.reducer
