import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectCurrentFamilyId, 
  selectUserFamilies, 
  switchFamily 
} from "./familySlice";
import { selectUser } from "../auth/authSlice";

export default function FamilySelector() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const currentFamilyId = useSelector(selectCurrentFamilyId);
  const families = useSelector(selectUserFamilies);
  const [isOpen, setIsOpen] = useState(false);

  const familyList = Object.values(families);
  const currentFamily = families[currentFamilyId];

  if (familyList.length <= 1) {
    // Don't show selector if user only has one family
    return null;
  }

  const handleSwitchFamily = async (familyId) => {
    if (familyId !== currentFamilyId && user) {
      await dispatch(switchFamily({ 
        userId: user.uid, 
        familyId 
      }));
      // Reload page to refresh data
      window.location.reload();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        <span className="font-medium text-gray-700">
          {currentFamily?.name || "Select Family"}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="py-1">
              {familyList.map((family) => (
                <button
                  key={family.familyId}
                  onClick={() => handleSwitchFamily(family.familyId)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    family.familyId === currentFamilyId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{family.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {family.isAdmin ? '👑 Admin' : 'Member'} · ID: {family.familyId}
                      </div>
                    </div>
                    {family.familyId === currentFamilyId && (
                      <svg 
                        className="w-5 h-5 text-blue-600" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

