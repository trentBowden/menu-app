import { useSelector, useDispatch } from "react-redux";
import { selectAllMenuItems } from "./menuSlice";
import { addResponseToItem } from "./menuSlice";
import { selectUser } from "../auth/authSlice";
import MenuItemCard from "./MenuItemCard";
import { useState } from "react";
import MenuItemDetailModal from "./MenuItemDetailModal";

const MenuItemList = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector(selectAllMenuItems);
  const user = useSelector(selectUser);
  const [selectedItem, setSelectedItem] = useState(null);

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

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No menu items yet</p>
        <p className="text-gray-400 text-sm">Add your first item using the New tab</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {menuItems.map((item) => (
          <MenuItemCard
            key={item.id}
            menuItem={item}
            onCardClick={handleCardClick}
            onQuickCraving={handleQuickCraving}
            showQuickButton={true}
          />
        ))}
      </div>

      {selectedItem && (
        <MenuItemDetailModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default MenuItemList;

