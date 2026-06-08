import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),

  endpoints: (builder) => ({

    // 🔐 LOGIN
    login: builder.mutation<
      { access_token: string; user: any },
      { email: string; password: string }
    >({
      queryFn: async ({ email, password }) => {
        await new Promise((res) => setTimeout(res, 500))

        if (email !== 'test@gmail.com' || password !== '123') {
          return {
            error: {
              status: 401,
              data: { message: 'Invalid credentials' },
            },
          }
        }

        return {
          data: {
            access_token: 'dummy_token_123456',
            user: {
              id: '1',
              name: 'Demo User',
              email,
              role: 'User',
            },
          },
        }
      },
    }),

    // 🆕 REGISTER
    register: builder.mutation<
      { access_token: string; user: any },
      { firstName: string; lastName: string; email: string; password: string }
    >({
      queryFn: async (body) => {
        await new Promise((res) => setTimeout(res, 600))

        return {
          data: {
            access_token: 'dummy_token_987654',
            user: {
              id: '2',
              name: `${body.firstName} ${body.lastName}`,
              email: body.email,
              role: 'User',
            },
          },
        }
      },
    }),

    // 🔑 FORGOT PASSWORD (ADD THIS)
    forgotPassword: builder.mutation<
      { message: string },
      { email: string }
    >({
      queryFn: async ({ email }) => {
        await new Promise((res) => setTimeout(res, 800))

        // simulate email check
        if (email !== 'test@gmail.com') {
          return {
            error: {
              status: 404,
              data: { message: 'Email not found' },
            },
          }
        }

        return {
          data: {
            message: 'Reset link sent successfully',
          },
        }
      },
    }),

      // 🔑 RESET PASSWORD
    resetPassword: builder.mutation<
      { message: string },
      { token: string; newPassword: string }
    >({
      queryFn: async ({ token, newPassword }) => {
        await new Promise((res) => setTimeout(res, 800))

        // simulate token validation
        if (!token || token !== 'valid_token') {
          return {
            error: {
              status: 400,
              data: { message: 'Invalid or expired token' },
            },
          }
        }

        return {
          data: {
            message: 'Password reset successful',
          },
        }
      },
    }),

  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi