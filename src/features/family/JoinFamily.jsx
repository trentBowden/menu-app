import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinFamily } from "./familySlice";

export default function JoinFamily({ onSuccess, onCancel, prefillFamilyId = "" }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [familyId, setFamilyId] = useState(prefillFamilyId);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillFamilyId) {
      setFamilyId(prefillFamilyId);
    }
  }, [prefillFamilyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!familyId.trim()) {
      setError("Please enter a family ID");
      return;
    }

    if (familyId.trim().length !== 6) {
      setError("Family ID must be 6 characters");
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    setIsLoading(true);

    try {
      const result = await dispatch(
        joinFamily({
          userId: user.uid,
          familyId: familyId.trim().toUpperCase(),
          pin,
        })
      ).unwrap();

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err || "Failed to join family");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join a Family</h2>
          <p className="text-gray-600 mt-2">
            Enter the family ID and PIN to join
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family ID
            </label>
            <input
              type="text"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest uppercase font-mono"
              disabled={isLoading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ask the family admin for this 6-character ID
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
              disabled={isLoading}
              maxLength={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              The 4-digit PIN provided by the family admin
            </p>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Join Family"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

