import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createMenuItem } from "../features/menu/menuSlice";
import { selectUser } from "../features/auth/authSlice";

const NewItemPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [title, setTitle] = useState("");
  const [recipes, setRecipes] = useState([
    { title: "", originalRecipeLink: "", colesOrderListLink: "", imageURL: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRecipe = () => {
    setRecipes([
      ...recipes,
      { title: "", originalRecipeLink: "", colesOrderListLink: "", imageURL: "" },
    ]);
  };

  const removeRecipe = (index) => {
    if (recipes.length === 1) return; // Keep at least one recipe
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const updateRecipe = (index, field, value) => {
    const newRecipes = [...recipes];
    newRecipes[index][field] = value;
    setRecipes(newRecipes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a menu item title");
      return;
    }

    const hasValidRecipe = recipes.some((recipe) => recipe.title.trim());
    if (!hasValidRecipe) {
      alert("Please add at least one recipe with a title");
      return;
    }

    const validRecipes = recipes.filter((recipe) => recipe.title.trim());

    setIsSubmitting(true);
    try {
      await dispatch(
        createMenuItem({
          title: title.trim(),
          recipes: validRecipes,
        })
      ).unwrap();

      // Reset form
      setTitle("");
      setRecipes([
        { title: "", originalRecipeLink: "", colesOrderListLink: "", imageURL: "" },
      ]);
      
      alert("Menu item created successfully!");
    } catch (error) {
      console.error("Error creating menu item:", error);
      alert("Failed to create menu item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please sign in to create menu items</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Menu Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Menu Item Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Menu Item Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Taco Feast"
            required
          />
        </div>

        {/* Recipes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Recipes *
            </label>
            <button
              type="button"
              onClick={addRecipe}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Add Recipe
            </button>
          </div>

          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Recipe {index + 1}</h3>
                {recipes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipe(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    value={recipe.title}
                    onChange={(e) => updateRecipe(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Spicy Chicken"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={recipe.imageURL}
                    onChange={(e) => updateRecipe(index, "imageURL", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Original Recipe Link
                  </label>
                  <input
                    type="url"
                    value={recipe.originalRecipeLink}
                    onChange={(e) =>
                      updateRecipe(index, "originalRecipeLink", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Coles Shopping List Link
                  </label>
                  <input
                    type="url"
                    value={recipe.colesOrderListLink}
                    onChange={(e) =>
                      updateRecipe(index, "colesOrderListLink", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Menu Item"}
        </button>
      </form>
    </div>
  );
};

export default NewItemPage;

