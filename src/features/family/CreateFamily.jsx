import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFamily } from "./familySlice";

export default function CreateFamily({ onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [familyName, setFamilyName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if user is available
    if (!user || !user.uid) {
      setError("User not authenticated. Please try logging in again.");
      console.error("User object:", user);
      return;
    }

    if (!familyName.trim()) {
      setError("Please enter a family name");
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating family with user:", user);
      console.log("User UID:", user?.uid);
      
      const result = await dispatch(
        createFamily({
          userId: user.uid,
          familyName: familyName.trim(),
          pin,
        })
      ).unwrap();

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Create family error:", err);
      setError(err.message || err.toString() || "Failed to create family");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create a Family</h2>
          <p className="text-gray-600 mt-2">
            Start a new family group to share meals together
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Smiths"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create 4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              disabled={isLoading}
              maxLength={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Others will need this PIN to join your family
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              disabled={isLoading}
              maxLength={4}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Family"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

