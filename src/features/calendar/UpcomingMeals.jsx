import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUpcomingMeals, selectCalendarStatus } from "./calendarSlice";
import { selectMenuItemById } from "../menu/menuSlice";
import { selectIsAdmin, selectFamilyDetails } from "../family/familySlice";
import MenuItemCard from "../menu/MenuItemCard";
import { useState } from "react";
import MenuItemDetailModal from "../menu/MenuItemDetailModal";

const UpcomingMeals = () => {
  const navigate = useNavigate();
  const upcomingMeals = useSelector(selectUpcomingMeals);
  const calendarStatus = useSelector(selectCalendarStatus);
  const isAdmin = useSelector(selectIsAdmin);
  const familyDetails = useSelector(selectFamilyDetails);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const hasCalendar = familyDetails?.calendarId;

  // Empty state when no calendar is linked
  if (!hasCalendar) {
    if (isAdmin) {
      return (
        <div className="p-6 bg-blue-50 rounded-lg m-4">
          <div className="text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Calendar Linked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Link a Google Calendar to show upcoming meals to your family.
            </p>
            <button
              onClick={() => navigate("/family/settings")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set Up Calendar
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-6 bg-gray-50 rounded-lg m-4">
          <div className="text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Calendar Linked
            </h3>
            <p className="text-sm text-gray-600">
              Ask your family admin to link a Google Calendar to see upcoming
              meals here.
            </p>
          </div>
        </div>
      );
    }
  }

  // Error state - calendar is linked but can't be accessed
  if (hasCalendar && calendarStatus === "failed") {
    if (isAdmin) {
      return (
        <div className="p-6 bg-red-50 rounded-lg m-4 border border-red-200">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cannot Access Calendar
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              The linked calendar is not accessible. This usually means the
              calendar is not set to public.
            </p>
            <div className="bg-white p-4 rounded border border-red-300 text-left mb-4 text-sm">
              <p className="font-medium mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Open Google Calendar</li>
                <li>Go to Settings → Your calendar name</li>
                <li>Under "Access permissions", check "Make available to public"</li>
                <li>Ensure "See all event details" is selected</li>
                <li>Click "Save" and try again here</li>
              </ol>
            </div>
            <button
              onClick={() => navigate("/family/settings")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Update Calendar Settings
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-6 bg-red-50 rounded-lg m-4 border border-red-200">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cannot Access Calendar
            </h3>
            <p className="text-sm text-gray-600">
              The calendar is not accessible. Please ask your family admin to
              check the calendar permissions.
            </p>
          </div>
        </div>
      );
    }
  }

  // Empty state when calendar is linked but no meals scheduled
  if (upcomingMeals.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-center">No upcoming meals scheduled</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 p-4">
          {upcomingMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {selectedItem && (
        <MenuItemDetailModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </>
  );
};

const MealCard = ({ meal, onCardClick }) => {
  // Try to match meal URL with menu item
  const menuItem = useSelector((state) => {
    if (!meal.url) return null;
    
    // Try to match URL with menu item ID
    const allIds = state.menu.allItemIds;
    const matchingId = allIds.find((id) => meal.url.includes(id));
    
    if (matchingId) {
      return selectMenuItemById(state, matchingId);
    }
    
    return null;
  });

  // If we have a matching menu item, render MenuItemCard
  if (menuItem) {
    return (
      <div className="flex-shrink-0 w-64">
        <MenuItemCard menuItem={menuItem} onCardClick={onCardClick} />
      </div>
    );
  }

  // Otherwise, render a pastel-colored square with meal title
  const pastelColors = [
    "bg-pink-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-indigo-200",
  ];
  
  // Use meal title to consistently pick a color
  const colorIndex = meal.title.length % pastelColors.length;
  const bgColor = pastelColors[colorIndex];

  return (
    <div className="flex-shrink-0 w-64">
      <div className={`${bgColor} rounded-lg overflow-hidden shadow-md`}>
        <div className="w-full aspect-video flex items-center justify-center p-6">
          <h3 className="font-semibold text-lg text-center text-gray-800">
            {meal.title}
          </h3>
        </div>
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-600">
            {new Date(meal.start).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          {meal.keywords.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {meal.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeals;

