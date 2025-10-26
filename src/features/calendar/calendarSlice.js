import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCalendarEvents } from "../../services/googleCalendar";

const initialState = {
  upcomingMeals: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunks
export const fetchUpcomingMeals = createAsyncThunk(
  "calendar/fetchUpcomingMeals",
  async (calendarId) => {
    if (!calendarId) {
      return [];
    }
    const events = await fetchCalendarEvents(calendarId);
    return events;
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingMeals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUpcomingMeals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.upcomingMeals = action.payload;
      })
      .addCase(fetchUpcomingMeals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// Selectors
export const selectUpcomingMeals = (state) => state.calendar.upcomingMeals;
export const selectCalendarStatus = (state) => state.calendar.status;

export default calendarSlice.reducer;

