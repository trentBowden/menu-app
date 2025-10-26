import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import HomePage from "../../pages/HomePage";
import AllItemsPage from "../../pages/AllItemsPage";
import NewItemPage from "../../pages/NewItemPage";
import UserMenu from "../common/UserMenu";
import SettingsModal from "../common/SettingsModal";
import FamilySelector from "../../features/family/FamilySelector";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const tabs = [
    { name: "Home", icon: "🏠", path: "/" },
    { name: "All", icon: "📋", path: "/all" },
    { name: "New", icon: "➕", path: "/new" },
  ];

  // Determine active tab from URL
  const getTabIndexFromPath = (pathname) => {
    const index = tabs.findIndex(tab => tab.path === pathname);
    return index >= 0 ? index : 0;
  };

  const [activeTab, setActiveTab] = useState(getTabIndexFromPath(location.pathname));

  // Sync tab with URL changes
  useEffect(() => {
    const newIndex = getTabIndexFromPath(location.pathname);
    setActiveTab(newIndex);
  }, [location.pathname]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    navigate(tabs[index].path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center px-4 py-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">🌺 Hula Eats</h1>
          <div className="flex items-center gap-3">
            <FamilySelector />
            <UserMenu onOpenSettings={() => setIsSettingsOpen(true)} />
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="flex border-t border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors relative ${
                activeTab === index
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </header>

      {/* Swipeable Content */}
      <div className="flex-1 overflow-hidden">
        <SwipeableViews
          index={activeTab}
          onChangeIndex={handleTabChange}
          enableMouseEvents
          resistance
          className="h-full"
        >
          <div className="overflow-y-auto h-full">
            <HomePage onOpenSettings={() => setIsSettingsOpen(true)} />
          </div>
          <div className="overflow-y-auto h-full">
            <AllItemsPage />
          </div>
          <div className="overflow-y-auto h-full">
            <NewItemPage />
          </div>
        </SwipeableViews>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default MainLayout;

