import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { MOCK_NOTIFICATIONS, type Notification } from '@/lib/mockData'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

const initialState: NotificationState = {
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload)
      if (notif && !notif.read) {
        notif.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead(state) {
      state.notifications.forEach((n) => { n.read = true })
      state.unreadCount = 0
    },
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      const newNotif: Notification = {
        ...action.payload,
        id: `n-${Date.now()}`,
      }
      state.notifications.unshift(newNotif)
      if (!newNotif.read) state.unreadCount += 1
    },
    dismissNotification(state, action: PayloadAction<string>) {
      const idx = state.notifications.findIndex((n) => n.id === action.payload)
      if (idx !== -1) {
        if (!state.notifications[idx].read) state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.notifications.splice(idx, 1)
      }
    },
  },
})

export const { markRead, markAllRead, addNotification, dismissNotification } = notificationSlice.actions
export default notificationSlice.reducer
