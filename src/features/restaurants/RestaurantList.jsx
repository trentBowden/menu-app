import { useSelector } from "react-redux";
import { selectAllRestaurants } from "./restaurantSlice";

const RestaurantList = () => {
  const restaurants = useSelector(selectAllRestaurants);

  if (restaurants.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No restaurants added yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-600">
            {restaurant.menuItemIds?.length || 0} menu{" "}
            {restaurant.menuItemIds?.length === 1 ? "item" : "items"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RestaurantList;

