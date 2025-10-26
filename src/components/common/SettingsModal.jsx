import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentFamilyId,
  selectIsAdmin,
  selectFamilyDetails,
  loadFamilyDetails,
  removeFamilyMember,
  updateFamilyPin,
  updateFamilyCalendar,
} from "../../features/family/familySlice";
import { selectUser } from "../../features/auth/authSlice";

export default function SettingsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const currentFamilyId = useSelector(selectCurrentFamilyId);
  const isAdmin = useSelector(selectIsAdmin);
  const familyDetails = useSelector(selectFamilyDetails);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);
  const [calendarId, setCalendarId] = useState("");
  const [showCalendarChange, setShowCalendarChange] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentFamilyId && isOpen) {
      dispatch(loadFamilyDetails(currentFamilyId));
    }
  }, [currentFamilyId, dispatch, isOpen]);

  useEffect(() => {
    if (familyDetails?.calendarId) {
      setCalendarId(familyDetails.calendarId);
    }
  }, [familyDetails]);

  if (!isOpen) {
    return null;
  }

  if (!currentFamilyId) {
    return null;
  }

  if (!familyDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <p className="text-gray-600">Loading family details...</p>
        </div>
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

  const handleUpdateCalendar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await dispatch(
        updateFamilyCalendar({
          familyId: currentFamilyId,
          calendarId: calendarId.trim() || null,
        })
      ).unwrap();
      setSuccess(
        calendarId.trim()
          ? "Calendar linked successfully"
          : "Calendar unlinked successfully"
      );
      setShowCalendarChange(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err || "Failed to update calendar");
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}?family=${currentFamilyId}`;
    navigator.clipboard.writeText(inviteUrl);
    setSuccess("Invite link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {familyDetails.name}
              </h1>
              {isAdmin && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  👑 Admin
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-gray-500 mt-2 text-sm">Family ID: {currentFamilyId}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Admin Controls
              </h2>

              {/* Calendar Settings */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📅 Google Calendar Integration
                </h3>
                {familyDetails.calendarId && !showCalendarChange ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Calendar is linked. Family members can view upcoming meals.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCalendarChange(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Calendar
                      </button>
                    </div>
                  </div>
                ) : !showCalendarChange ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      No calendar linked yet. Link a Google Calendar to show
                      upcoming meals to your family.
                    </p>
                    <button
                      onClick={() => setShowCalendarChange(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Link Calendar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateCalendar} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
                      <p className="font-medium text-gray-900">
                        How to link your Google Calendar:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        <li>Open Google Calendar on your computer</li>
                        <li>Create a new calendar or use an existing one</li>
                        <li>Click Settings (gear icon) → Settings</li>
                        <li>Select your calendar from the left sidebar</li>
                        <li className="font-semibold text-blue-900">
                          Under "Access permissions", check "Make available to public" ⚠️
                        </li>
                        <li className="font-semibold text-blue-900">
                          Ensure "See all event details" is selected ⚠️
                        </li>
                        <li>Scroll to "Integrate calendar" section</li>
                        <li>Copy the "Calendar ID" (looks like an email)</li>
                        <li>Paste the Calendar ID below and save</li>
                      </ol>
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Note: The calendar MUST be public for the app to access it.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Calendar ID
                      </label>
                      <input
                        type="text"
                        value={calendarId}
                        onChange={(e) => setCalendarId(e.target.value)}
                        placeholder="example@group.calendar.google.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to unlink the calendar
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCalendarChange(false);
                          setCalendarId(familyDetails.calendarId || "");
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
                        {calendarId.trim() ? "Save Calendar" : "Unlink Calendar"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Change PIN */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔐 Family PIN</h3>
                {!showPinChange ? (
                  <button
                    onClick={() => setShowPinChange(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Change Family PIN
                  </button>
                ) : (
                  <form onSubmit={handleUpdatePin} className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}

