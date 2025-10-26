import { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { addResponseToItem, clearResponseFromItem, updateMenuItemLink, selectMenuItemById } from "./menuSlice";
import { selectUser } from "../auth/authSlice";
import { getMostRecentUserResponse } from "../responses/responseLogic";

const MenuItemDetailModal = ({ item, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [editingLink, setEditingLink] = useState(null); // { recipeIndex, linkType }
  const [linkValue, setLinkValue] = useState("");

  // Get the latest version of the item from Redux store to reflect real-time updates
  const currentItem = useSelector((state) => selectMenuItemById(state, item.id)) || item;

  const userResponse = getMostRecentUserResponse(currentItem.responses, user?.uid);

  const handleResponse = (responseType) => {
    if (!user) return;
    dispatch(
      addResponseToItem({
        userId: user.uid,
        itemId: currentItem.id,
        responseType,
      })
    );
  };

  const handleClearResponse = () => {
    if (!user) return;
    dispatch(
      clearResponseFromItem({
        userId: user.uid,
        itemId: currentItem.id,
      })
    );
  };

  const startEditingLink = (recipeIndex, linkType, currentUrl) => {
    setEditingLink({ recipeIndex, linkType });
    setLinkValue(currentUrl || "");
  };

  const saveLink = () => {
    if (!editingLink) return;
    dispatch(
      updateMenuItemLink({
        itemId: currentItem.id,
        recipeIndex: editingLink.recipeIndex,
        linkType: editingLink.linkType,
        newUrl: linkValue,
      })
    );
    setEditingLink(null);
    setLinkValue("");
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setLinkValue("");
  };

  const getButtonStyle = (responseType) => {
    const isSelected = userResponse?.type === responseType;
    const baseStyle = "flex-1 py-3 rounded-lg font-medium transition-all";

    if (responseType === "Nah") {
      return `${baseStyle} ${
        isSelected
          ? "bg-gray-600 text-white ring-4 ring-gray-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`;
    }
    if (responseType === "Interested") {
      return `${baseStyle} ${
        isSelected
          ? "bg-blue-600 text-white ring-4 ring-blue-300"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`;
    }
    if (responseType === "Craving") {
      return `${baseStyle} ${
        isSelected
          ? "bg-pink-600 text-white ring-4 ring-pink-300"
          : "bg-pink-100 text-pink-700 hover:bg-pink-200"
      }`;
    }
    return baseStyle;
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{currentItem.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Action Bar */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">How do you feel?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleResponse("Nah")}
                className={getButtonStyle("Nah")}
                disabled={!user}
              >
                👎 Nah
              </button>
              <button
                onClick={() => handleResponse("Interested")}
                className={getButtonStyle("Interested")}
                disabled={!user}
              >
                🤔 Interested
              </button>
              <button
                onClick={() => handleResponse("Craving")}
                className={getButtonStyle("Craving")}
                disabled={!user}
              >
                🤤 Craving
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border-2 border-gray-200 font-medium transition-all disabled:opacity-50"
                disabled={!user || !userResponse}
                title="Clear response"
              >
                ✕
              </button>
            </div>
            {userResponse && (
              <p className="text-xs text-gray-500 mt-2">
                Your answer only counts for today
              </p>
            )}
          </div>

          {/* Recipes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recipes</h3>
            {currentItem.recipes.map((recipe, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                <div className="flex gap-4 mb-3">
                  {recipe.imageURL && (
                    <img
                      src={recipe.imageURL}
                      alt={recipe.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{recipe.title}</h4>
                  </div>
                </div>

                {/* Original Recipe Link */}
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Original Recipe
                  </label>
                  {editingLink?.recipeIndex === index &&
                  editingLink?.linkType === "originalRecipeLink" ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                      <button
                        onClick={saveLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : recipe.originalRecipeLink ? (
                    <div className="flex gap-2 items-center">
                      <a
                        href={recipe.originalRecipeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                      >
                        🔗 View Recipe
                      </a>
                      <button
                        onClick={() =>
                          startEditingLink(index, "originalRecipeLink", recipe.originalRecipeLink)
                        }
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        ✏️
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingLink(index, "originalRecipeLink", "")}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Add Link
                    </button>
                  )}
                </div>

                {/* Coles Order List Link */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Coles Shopping List
                  </label>
                  {editingLink?.recipeIndex === index &&
                  editingLink?.linkType === "colesOrderListLink" ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                      <button
                        onClick={saveLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : recipe.colesOrderListLink ? (
                    <div className="flex gap-2 items-center">
                      <a
                        href={recipe.colesOrderListLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                      >
                        🛒 Shop at Coles
                      </a>
                      <button
                        onClick={() =>
                          startEditingLink(index, "colesOrderListLink", recipe.colesOrderListLink)
                        }
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        ✏️
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingLink(index, "colesOrderListLink", "")}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Add Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuItemDetailModal;

