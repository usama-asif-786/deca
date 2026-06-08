import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string; 
}

interface AuthState {
  user: User | null;
  authorizationToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  authorizationToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        user: User | null;
        authorizationToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.authorizationToken = action.payload.authorizationToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout(state) {
      state.user = null;
      state.authorizationToken = null;
      state.refreshToken = null;
    },
    setAuthTokens(
      state,
      action: PayloadAction<{
        authorizationToken: string;
        refreshToken: string;
      }>
    ) {
      state.authorizationToken = action.payload.authorizationToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

export const { login, logout, setAuthTokens } = authSlice.actions;
export default authSlice.reducer;
