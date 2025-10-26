 import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CreateFamily from "./CreateFamily";
import JoinFamily from "./JoinFamily";

export default function FamilyOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null, 'create', or 'join'
  const prefillFamilyId = searchParams.get("family");

  useEffect(() => {
    // If there's a family parameter, default to join mode
    if (prefillFamilyId) {
      setMode("join");
    }
  }, [prefillFamilyId]);

  const handleSuccess = () => {
    // Redirect to home after successful creation/join
    navigate("/", { replace: true });
    window.location.reload(); // Reload to fetch family data
  };

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <CreateFamily 
          onSuccess={handleSuccess}
          onCancel={() => setMode(null)}
        />
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <JoinFamily 
          onSuccess={handleSuccess}
          onCancel={prefillFamilyId ? null : () => setMode(null)}
          prefillFamilyId={prefillFamilyId}
        />
      </div>
    );
  }

  // Initial choice screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Menu App! 🍽️
          </h1>
          <p className="text-xl text-gray-600">
            To get started, create a family group or join an existing one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Family Card */}
          <button
            onClick={() => setMode("create")}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 text-left"
          >
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create a Family
            </h2>
            <p className="text-gray-600 mb-4">
              Start a new family group and invite others to join
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                You'll be the admin
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get a shareable family ID
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Set a PIN for security
              </li>
            </ul>
          </button>

          {/* Join Family Card */}
          <button
            onClick={() => setMode("join")}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 text-left"
          >
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join a Family
            </h2>
            <p className="text-gray-600 mb-4">
              Enter a family ID and PIN to join an existing group
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get the ID from admin
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Enter the 4-digit PIN
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Start sharing meals
              </li>
            </ul>
          </button>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            You can be part of multiple families and switch between them anytime
          </p>
        </div>
      </div>
    </div>
  );
}

