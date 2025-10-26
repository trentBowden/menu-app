import { useSelector } from "react-redux";
import { selectUpcomingMeals, selectCalendarStatus } from "./calendarSlice";
import { selectMenuItemById } from "../menu/menuSlice";
import { selectIsAdmin, selectFamilyDetails } from "../family/familySlice";
import MenuItemCard from "../menu/MenuItemCard";
import { useState, useMemo } from "react";
import MenuItemDetailModal from "../menu/MenuItemDetailModal";

const UpcomingMeals = ({ onOpenSettings }) => {
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

  // Group meals by day for the next 14 days
  const dailyMeals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const next14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Group meals by date
    const mealsByDate = {};
    upcomingMeals.forEach((meal) => {
      const mealDate = new Date(meal.start);
      mealDate.setHours(0, 0, 0, 0);
      const dateKey = mealDate.toISOString().split('T')[0];
      
      if (!mealsByDate[dateKey]) {
        mealsByDate[dateKey] = [];
      }
      mealsByDate[dateKey].push(meal);
    });

    // Create array of days with their meals
    return next14Days.map((date) => {
      const dateKey = date.toISOString().split('T')[0];
      return {
        date,
        dateKey,
        meals: mealsByDate[dateKey] || [],
      };
    });
  }, [upcomingMeals]);

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
              onClick={onOpenSettings}
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
              onClick={onOpenSettings}
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

  return (
    <>
      {/* Header row */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Meals</h2>
        <button
          onClick={() => navigate("/all-items")}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          See All
        </button>
      </div>

      {/* Daily meal cards */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-4 pb-4">
          {dailyMeals.map((day) => (
            <DayCard
              key={day.dateKey}
              day={day}
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

const DayCard = ({ day, onCardClick }) => {
  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day.date.getTime() === today.getTime();
  };

  const formatDate = () => {
    if (isToday()) {
      return "Today";
    }
    return day.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Date header */}
        <div className={`px-4 py-3 ${isToday() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <h3 className="font-semibold text-lg">{formatDate()}</h3>
        </div>

        {/* Meals content - fixed height for 2 meal slots */}
        <div className="p-4 h-48 flex flex-col">
          {day.meals.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-sm">Nothing planned</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto">
              {day.meals.map((meal) => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onCardClick={onCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MealItem = ({ meal, onCardClick }) => {
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

  // If we have a matching menu item, show a compact version
  if (menuItem) {
    return (
      <div
        onClick={() => onCardClick(menuItem)}
        className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 border border-gray-200 transition-colors"
      >
        <div className="flex items-start gap-3">
          {menuItem.imageUrl && (
            <img
              src={menuItem.imageUrl}
              alt={menuItem.name}
              className="w-16 h-16 object-cover rounded flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {menuItem.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1 truncate">{menuItem.restaurantName}</p>
            {meal.keywords.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {meal.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap"
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
  }

  // Otherwise, show a simple text card
  const pastelColors = [
    "bg-pink-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-purple-100",
    "bg-indigo-100",
  ];
  
  // Use meal title to consistently pick a color
  const colorIndex = meal.title.length % pastelColors.length;
  const bgColor = pastelColors[colorIndex];

  return (
    <div className={`${bgColor} rounded-lg p-3 border border-gray-200`}>
      <h4 className="font-medium text-gray-900 text-sm truncate">{meal.title}</h4>
      {meal.keywords.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {meal.keywords.map((keyword) => (
            <span
              key={keyword}
              className="text-xs px-2 py-0.5 bg-white bg-opacity-70 text-gray-700 rounded whitespace-nowrap"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMeals;

