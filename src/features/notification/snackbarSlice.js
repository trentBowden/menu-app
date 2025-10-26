import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  title: "",
  subtitle: "",
  link: null, // { text: string, url: string }
  duration: 5000,
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.open = true;
      state.title = action.payload.title || "";
      state.subtitle = action.payload.subtitle || "";
      state.link = action.payload.link || null;
      state.duration = action.payload.duration || 5000;
    },
    hideSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

// Selectors
export const selectSnackbarState = (state) => state.snackbar;

export default snackbarSlice.reducer;

