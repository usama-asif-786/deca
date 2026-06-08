import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface TasksState {
  filter: string
  expandedTask: string | null
  page: number
}

const initialState: TasksState = {
  filter: 'all',
  expandedTask: null,
  page: 1,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload
      state.page = 1
    },
    setExpandedTask(state, action: PayloadAction<string | null>) {
      state.expandedTask = action.payload
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
  },
})

export const { setFilter, setExpandedTask, setPage } = tasksSlice.actions
export default tasksSlice.reducer
