import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dbOnValue, dbPush } from "../../services/firebase";

const initialState = {
  restaurantsById: {},
  allRestaurantIds: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunks
export const listenForRestaurants = createAsyncThunk(
  "restaurants/listenForRestaurants",
  async (_, { dispatch }) => {
    return new Promise((resolve) => {
      dbOnValue("restaurants", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const restaurantsById = {};
          const allRestaurantIds = [];
          
          Object.entries(data).forEach(([id, restaurant]) => {
            restaurantsById[id] = { ...restaurant, id };
            allRestaurantIds.push(id);
          });
          
          dispatch(restaurantSlice.actions.setRestaurants({ restaurantsById, allRestaurantIds }));
        } else {
          dispatch(restaurantSlice.actions.setRestaurants({ restaurantsById: {}, allRestaurantIds: [] }));
        }
        resolve();
      });
    });
  }
);

export const createRestaurant = createAsyncThunk(
  "restaurants/createRestaurant",
  async (restaurantData) => {
    const newRestaurant = {
      ...restaurantData,
      menuItemIds: restaurantData.menuItemIds || [],
    };
    
    const result = await dbPush("restaurants", newRestaurant);
    return { id: result.key, ...newRestaurant };
  }
);

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurantsById = action.payload.restaurantsById;
      state.allRestaurantIds = action.payload.allRestaurantIds;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenForRestaurants.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenForRestaurants.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(listenForRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        const restaurant = action.payload;
        state.restaurantsById[restaurant.id] = restaurant;
        state.allRestaurantIds.push(restaurant.id);
      });
  },
});

// Selectors
export const selectAllRestaurants = (state) =>
  state.restaurants.allRestaurantIds.map((id) => state.restaurants.restaurantsById[id]);

export const selectRestaurantById = (state, restaurantId) =>
  state.restaurants.restaurantsById[restaurantId];

export const selectRestaurantsStatus = (state) => state.restaurants.status;

export default restaurantSlice.reducer;

