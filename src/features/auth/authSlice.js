import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "loading", // 'loading' | 'idle' | 'authenticated'
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "idle";
    },
    setAuthLoading: (state, action) => {
      state.status = action.payload ? "loading" : "idle";
    },
  },
});

export const { setUser, setAuthLoading } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => state.auth.status === "authenticated";

export default authSlice.reducer;

