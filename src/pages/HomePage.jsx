import { useSelector, useDispatch } from "react-redux";
import { useMemo, useState } from "react";
import { selectUpcomingMeals, selectCalendarStatus } from "../features/calendar/calendarSlice";
import { selectAllMenuItems } from "../features/menu/menuSlice";
import { addResponseToItem } from "../features/menu/menuSlice";
import { selectUser } from "../features/auth/authSlice";
import UpcomingMeals from "../features/calendar/UpcomingMeals";
import RestaurantList from "../features/restaurants/RestaurantList";
import MenuItemCard from "../features/menu/MenuItemCard";
import MenuItemDetailModal from "../features/menu/MenuItemDetailModal";
import SkeletonCard from "../components/common/SkeletonCard";
import { sortItemsByRecentResponses } from "../features/responses/responseLogic";

const HomePage = () => {
  const dispatch = useDispatch();
  const upcomingMeals = useSelector(selectUpcomingMeals);
  const calendarStatus = useSelector(selectCalendarStatus);
  const menuItems = useSelector(selectAllMenuItems);
  const user = useSelector(selectUser);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get recently craved/interested items
  const recentlyRespondedItems = useMemo(() => {
    const itemsWithResponses = menuItems.filter(
      (item) => item.responses && item.responses.length > 0
    );
    return sortItemsByRecentResponses(itemsWithResponses).slice(0, 10);
  }, [menuItems]);

  const handleQuickCraving = (itemId) => {
    if (!user) return;
    dispatch(
      addResponseToItem({
        userId: user.uid,
        itemId,
        responseType: "Craving",
      })
    );
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="pb-20">
      {/* Upcoming Meals Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold px-4 pt-6 pb-4">Upcoming Meals</h2>
        {calendarStatus === "loading" ? (
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4">
              <SkeletonCard variant="horizontal" />
              <SkeletonCard variant="horizontal" />
              <SkeletonCard variant="horizontal" />
            </div>
          </div>
        ) : (
          <UpcomingMeals />
        )}
      </section>

      {/* Recently Craved/Interested Section */}
      {recentlyRespondedItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold px-4 pb-4">Recent Activity</h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4">
              {recentlyRespondedItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-64">
                  <MenuItemCard
                    menuItem={item}
                    onCardClick={handleCardClick}
                    onQuickCraving={handleQuickCraving}
                    showQuickButton={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Restaurants Section */}
      <section>
        <h2 className="text-2xl font-bold px-4 pb-4">Restaurants</h2>
        <div className="bg-white rounded-lg mx-4 shadow-md overflow-hidden">
          <RestaurantList />
        </div>
      </section>

      {selectedItem && (
        <MenuItemDetailModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default HomePage;

