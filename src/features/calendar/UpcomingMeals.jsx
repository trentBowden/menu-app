import { useSelector } from "react-redux";
import { selectUpcomingMeals } from "./calendarSlice";
import { selectMenuItemById } from "../menu/menuSlice";
import MenuItemCard from "../menu/MenuItemCard";
import { useState } from "react";
import MenuItemDetailModal from "../menu/MenuItemDetailModal";

const UpcomingMeals = () => {
  const upcomingMeals = useSelector(selectUpcomingMeals);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

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

