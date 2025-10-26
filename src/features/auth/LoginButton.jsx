import { useDispatch, useSelector } from "react-redux";
import { signInWithGoogle, logOut } from "../../services/firebase";
import { selectUser, selectIsAuthenticated } from "./authSlice";

const LoginButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleSignIn = async () => {
    try {
      console.log("Attempting to sign in with Google...");
      const user = await signInWithGoogle();
      console.log("Sign in successful:", user);
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      alert(`Login failed: ${error.message}\n\nPlease check your Firebase configuration and console logs.`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-10 h-10 rounded-full"
          />
        )}
        <span className="text-sm font-medium">{user?.displayName}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;

