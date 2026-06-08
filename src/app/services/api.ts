import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

import {
  MOCK_KPI_STATS,
  MOCK_TASKS,
  MOCK_ALERTS,
  MOCK_SOURCES,
  MOCK_CHAT_MESSAGES,
  MOCK_MONITORING,
  MOCK_TEAM,
  MOCK_TENANTS,
  type KPIStats,
  type Task,
  type Alert,
  type DataSource,
  type ChatMessage,
  type TeamMember,
  type Tenant,
} from '@/lib/mockData'
import { delay } from '@/lib/utils'

// ─── RTK Query API ─────────────────────────────────
export const api = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: '/',

    // ✅ Attach token from Redux
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),

  tagTypes: [
    'Dashboard',
    'Tasks',
    'Alerts',
    'Sources',
    'Chat',
    'Monitoring',
    'Team',
    'Tenants',
  ],

  endpoints: (builder) => ({
    // 🔐 LOGIN API
    login: builder.mutation<
      { access_token: string; user: any },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login', // 🔥 change to your backend
        method: 'POST',
        body: credentials,
      }),
    }),

    // ─── MOCK APIs ─────────────────
    getDashboardStats: builder.query<KPIStats[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_KPI_STATS }
      },
      providesTags: ['Dashboard'],
    }),

    getTasks: builder.query<Task[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_TASKS }
      },
      providesTags: ['Tasks'],
    }),

    getAlerts: builder.query<Alert[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_ALERTS }
      },
      providesTags: ['Alerts'],
    }),

    getSources: builder.query<DataSource[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_SOURCES }
      },
      providesTags: ['Sources'],
    }),

    getChatMessages: builder.query<ChatMessage[], void>({
      queryFn: async () => {
        await delay(200)
        return { data: MOCK_CHAT_MESSAGES }
      },
      providesTags: ['Chat'],
    }),

    getMonitoringData: builder.query<typeof MOCK_MONITORING, void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_MONITORING }
      },
      providesTags: ['Monitoring'],
    }),

    getTeam: builder.query<TeamMember[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_TEAM }
      },
      providesTags: ['Team'],
    }),

    getTenants: builder.query<Tenant[], void>({
      queryFn: async () => {
        await delay(300)
        return { data: MOCK_TENANTS }
      },
      providesTags: ['Tenants'],
    }),
  }),
})

// ✅ EXPORT HOOKS
export const {
  useLoginMutation, 
  useGetDashboardStatsQuery,
  useGetTasksQuery,
  useGetAlertsQuery,
  useGetSourcesQuery,
  useGetChatMessagesQuery,
  useGetMonitoringDataQuery,
  useGetTeamQuery,
  useGetTenantsQuery,
} = api