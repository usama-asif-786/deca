import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { api } from './services/api'

import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'

import dashboardReducer from '@/features/dashboard/dashboardSlice'
import chatReducer from '@/features/chat/chatSlice'
import alertsReducer from '@/features/alerts/alertsSlice'
import sourcesReducer from '@/features/sources/sourcesSlice'

// ─────────────────────────────────────────────
// 1. Combine all reducers
// ─────────────────────────────────────────────
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,

  auth: authReducer,
  ui: uiReducer,
  notifications: notificationReducer,

  dashboard: dashboardReducer,
  chat: chatReducer,
  alerts: alertsReducer,
  sources: sourcesReducer,
})

// ─────────────────────────────────────────────
// 2. Persist config (ONLY auth will persist)
// ─────────────────────────────────────────────
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // 🔥 only auth survives refresh
}

// ─────────────────────────────────────────────
// 3. Create persisted reducer
// ─────────────────────────────────────────────
const persistedReducer = persistReducer(persistConfig, rootReducer)

// ─────────────────────────────────────────────
// 4. Store
// ─────────────────────────────────────────────
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }).concat(api.middleware),
})

// ─────────────────────────────────────────────
// 5. Persistor (IMPORTANT)
// ─────────────────────────────────────────────
export const persistor = persistStore(store)

// ─────────────────────────────────────────────
// 6. Types
// ─────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch