import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import calendarReducer from "../features/calendar/calendarSlice";
import menuReducer from "../features/menu/menuSlice";
import restaurantReducer from "../features/restaurants/restaurantSlice";
import familyReducer from "../features/family/familySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer,
    menu: menuReducer,
    restaurants: restaurantReducer,
    family: familyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase auth user object and timestamps
        ignoredActions: ["auth/setUser"],
        ignoredPaths: ["auth.user"],
      },
    }),
});

