import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCurrentFamilyId,
  selectIsAdmin,
  selectFamilyDetails,
  loadFamilyDetails,
  removeFamilyMember,
  updateFamilyPin,
} from "../features/family/familySlice";
import { selectUser } from "../features/auth/authSlice";

export default function FamilySettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const currentFamilyId = useSelector(selectCurrentFamilyId);
  const isAdmin = useSelector(selectIsAdmin);
  const familyDetails = useSelector(selectFamilyDetails);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentFamilyId) {
      dispatch(loadFamilyDetails(currentFamilyId));
    }
  }, [currentFamilyId, dispatch]);

  if (!currentFamilyId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No family selected</p>
      </div>
    );
  }

  if (!familyDetails) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading family details...</p>
      </div>
    );
  }

  const members = Object.values(familyDetails.members || {});

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      await dispatch(
        removeFamilyMember({
          familyId: currentFamilyId,
          memberId,
        })
      ).unwrap();
      setSuccess("Member removed successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err || "Failed to remove member");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    try {
      await dispatch(
        updateFamilyPin({
          familyId: currentFamilyId,
          newPin,
        })
      ).unwrap();
      setSuccess("PIN updated successfully");
      setNewPin("");
      setConfirmPin("");
      setShowPinChange(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err || "Failed to update PIN");
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}?family=${currentFamilyId}`;
    navigator.clipboard.writeText(inviteUrl);
    setSuccess("Invite link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {familyDetails.name}
              </h1>
              <p className="text-gray-500 mt-1">Family ID: {currentFamilyId}</p>
            </div>
            {isAdmin && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                👑 Admin
              </span>
            )}
          </div>

          {/* Invite Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Invite Family Members
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Share this link for others to join your family
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}?family=${currentFamilyId}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              They'll need the Family ID ({currentFamilyId}) and PIN to join
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Admin Controls
            </h2>

            {/* Change PIN */}
            {!showPinChange ? (
              <button
                onClick={() => setShowPinChange(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Change Family PIN
              </button>
            ) : (
              <form onSubmit={handleUpdatePin} className="space-y-4">
                <h3 className="font-semibold text-gray-900">Change PIN</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    maxLength={4}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinChange(false);
                      setNewPin("");
                      setConfirmPin("");
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Family Members ({members.length})
          </h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {member.userId === user?.uid ? "You" : member.userId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.isAdmin ? "Admin" : "Member"} · Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                {isAdmin &&
                  member.userId !== user?.uid &&
                  !member.isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

