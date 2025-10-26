import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthListener } from "./hooks/useAuthListener";
import { selectAuthStatus, selectIsAuthenticated, selectUser } from "./features/auth/authSlice";
import { listenForMenuItems } from "./features/menu/menuSlice";
import { listenForRestaurants } from "./features/restaurants/restaurantSlice";
import { fetchUpcomingMeals } from "./features/calendar/calendarSlice";
import { loadUserFamilies, selectCurrentFamilyId, selectFamilyStatus } from "./features/family/familySlice";
import MainLayout from "./components/layout/MainLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import LoginButton from "./features/auth/LoginButton";
import FamilyOnboarding from "./features/family/FamilyOnboarding";

function App() {
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const currentFamilyId = useSelector(selectCurrentFamilyId);
  const familyStatus = useSelector(selectFamilyStatus);
  const [familiesLoaded, setFamiliesLoaded] = useState(false);

  // Debug logging
  console.log("App render - authStatus:", authStatus, "isAuthenticated:", isAuthenticated);

  // Set up Firebase auth listener
  useAuthListener();

  // Load user families when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(loadUserFamilies(user.uid)).then(() => {
        setFamiliesLoaded(true);
      });
    } else {
      setFamiliesLoaded(false);
    }
  }, [isAuthenticated, user, dispatch]);

  // Load data when authenticated and has a family
  useEffect(() => {
    if (isAuthenticated && currentFamilyId) {
      dispatch(listenForMenuItems());
      dispatch(listenForRestaurants());
      dispatch(fetchUpcomingMeals());
    }
  }, [isAuthenticated, currentFamilyId, dispatch]);

  // Show loading spinner while checking auth status or loading families
  if (authStatus === "loading" || (isAuthenticated && !familiesLoaded)) {
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

  // Show family onboarding if authenticated but no family selected
  if (isAuthenticated && !currentFamilyId) {
    return <FamilyOnboarding />;
  }

  // Show main app when authenticated and has a family
  return <MainLayout />;
}

export default App;
