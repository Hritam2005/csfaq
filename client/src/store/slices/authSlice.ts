import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  permissions: string[];
  spurtiPoints?: number;
  spurtiPointsSyncedAt?: string;
  profile?: {
    title?: string;
    bio?: string;
    avatar?: string;
    phone?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setInitialized: (state) => {
      state.isInitializing = false;
    },
    updateUserPoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.spurtiPoints = action.payload;
      }
    }
  },
});

export const { setCredentials, logout, setInitialized, updateUserPoints } = authSlice.actions;
export default authSlice.reducer;
