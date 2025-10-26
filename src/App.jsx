import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthListener } from "./hooks/useAuthListener";
import { selectAuthStatus, selectIsAuthenticated } from "./features/auth/authSlice";
import { listenForMenuItems } from "./features/menu/menuSlice";
import { listenForRestaurants } from "./features/restaurants/restaurantSlice";
import { fetchUpcomingMeals } from "./features/calendar/calendarSlice";
import MainLayout from "./components/layout/MainLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import LoginButton from "./features/auth/LoginButton";

function App() {
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Debug logging
  console.log("App render - authStatus:", authStatus, "isAuthenticated:", isAuthenticated);

  // Set up Firebase auth listener
  useAuthListener();

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(listenForMenuItems());
      dispatch(listenForRestaurants());
      dispatch(fetchUpcomingMeals());
    }
  }, [isAuthenticated, dispatch]);

  // Show loading spinner while checking auth status
  if (authStatus === "loading") {
    return <LoadingSpinner fullPage size="large" />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🌺 Hula Eats</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your family meal planning companion
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  // Show main app when authenticated
  return <MainLayout />;
}

export default App;
