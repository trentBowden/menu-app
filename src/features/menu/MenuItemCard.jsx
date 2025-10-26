import { useSelector } from "react-redux";
import { selectUser } from "../auth/authSlice";
import { getMostRecentResponse, getRecentActivityDescriptions } from "../responses/responseLogic";

const MenuItemCard = ({ menuItem, onCardClick, onQuickCraving, showQuickButton = false, showActivityDescriptions = false }) => {
  const user = useSelector(selectUser);
  const recipes = menuItem.recipes || [];

  // Get most recent response for avatar display
  const mostRecentResponse = getMostRecentResponse(menuItem.responses);
  const mostRecentUser = mostRecentResponse
    ? { photoURL: mostRecentResponse.userPhotoURL, displayName: mostRecentResponse.userName }
    : null;

  // Get activity descriptions for recent activity
  const activities = showActivityDescriptions ? getRecentActivityDescriptions(menuItem.responses) : [];

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking the craving button
    if (e.target.closest(".craving-button")) return;
    onCardClick?.(menuItem);
  };

  const handleCravingClick = (e) => {
    e.stopPropagation();
    onQuickCraving?.(menuItem.id);
  };

  // Composite image rendering logic
  const renderCompositeImage = () => {
    if (recipes.length === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No Image</span>
        </div>
      );
    }

    if (recipes.length === 1) {
      return (
        <img
          src={recipes[0].imageURL || "https://via.placeholder.com/400x225"}
          alt={recipes[0].title}
          className="w-full h-full object-cover"
        />
      );
    }

    // Multiple recipes - create composite
    const widthPercent = 100 / recipes.length;

    return (
      <div className="w-full h-full flex">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            style={{ width: `${widthPercent}%` }}
            className="h-full overflow-hidden"
          >
            <img
              src={recipe.imageURL || "https://via.placeholder.com/400x225"}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
    >
      <div className="w-full aspect-video relative">
        {renderCompositeImage()}
        
        {/* User avatar overlay (bottom-right) */}
        {mostRecentUser?.photoURL && (
          <div className="absolute bottom-2 right-2">
            <img
              src={mostRecentUser.photoURL}
              alt={mostRecentUser.displayName || "User"}
              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{menuItem.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-1">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>

        {showActivityDescriptions && activities.length > 0 && (
          <div className="mt-3 space-y-1">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-base leading-none">{activity.emoji}</span>
                <span className="text-gray-700 line-clamp-1">{activity.description}</span>
              </div>
            ))}
          </div>
        )}

        {showQuickButton && (
          <button
            onClick={handleCravingClick}
            className="craving-button mt-3 w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm"
          >
            🤤 Craving!
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;

