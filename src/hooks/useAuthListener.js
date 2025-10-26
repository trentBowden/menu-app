import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../services/firebase";
import { setUser, setAuthLoading } from "../features/auth/authSlice";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Custom hook to sync Firebase Auth state with Redux
 * Should be called once in App.jsx
 */
export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Setting up auth listener...");
    dispatch(setAuthLoading(true));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log("Auth state changed: User signed in", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
        // Don't call setAuthLoading(false) here - setUser already sets status to "authenticated"
      } else {
        // User is signed out
        console.log("Auth state changed: User signed out");
        dispatch(setUser(null));
        dispatch(setAuthLoading(false)); // Only set to idle when signed out
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);
};

