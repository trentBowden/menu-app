import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dbOnValue, dbPush, dbUpdate, getServerTimestamp } from "../../services/firebase";

const initialState = {
  itemsById: {},
  allItemIds: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunks
export const listenForMenuItems = createAsyncThunk(
  "menu/listenForMenuItems",
  async (_, { dispatch, getState }) => {
    const { family } = getState();
    const familyId = family.currentFamilyId;
    
    if (!familyId) {
      console.warn("No family selected, skipping menu items load");
      return;
    }

    return new Promise((resolve) => {
      dbOnValue(`families/${familyId}/menuItems`, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const itemsById = {};
          const allItemIds = [];
          
          Object.entries(data).forEach(([id, item]) => {
            itemsById[id] = { ...item, id };
            allItemIds.push(id);
          });
          
          dispatch(menuSlice.actions.setMenuItems({ itemsById, allItemIds }));
        } else {
          dispatch(menuSlice.actions.setMenuItems({ itemsById: {}, allItemIds: [] }));
        }
        resolve();
      });
    });
  }
);

export const createMenuItem = createAsyncThunk(
  "menu/createMenuItem",
  async (itemData, { getState }) => {
    const { auth, family } = getState();
    const familyId = family.currentFamilyId;
    
    if (!familyId) {
      throw new Error("No family selected");
    }

    const newItem = {
      ...itemData,
      createdBy: auth.user?.uid || "anonymous",
      familyId,
      responses: [],
      createdAt: Date.now(),
    };
    
    const result = await dbPush(`families/${familyId}/menuItems`, newItem);
    return { id: result.key, ...newItem };
  }
);

export const updateMenuItemLink = createAsyncThunk(
  "menu/updateMenuItemLink",
  async ({ itemId, recipeIndex, linkType, newUrl }, { getState }) => {
    const { family } = getState();
    const familyId = family.currentFamilyId;
    
    if (!familyId) {
      throw new Error("No family selected");
    }

    await dbUpdate(`families/${familyId}/menuItems/${itemId}`, {
      [`recipes/${recipeIndex}/${linkType}`]: newUrl,
    });
    return { itemId, recipeIndex, linkType, newUrl };
  }
);

export const addResponseToItem = createAsyncThunk(
  "menu/addResponseToItem",
  async ({ userId, itemId, responseType }, { getState }) => {
    const response = {
      userId,
      type: responseType,
      timestamp: Date.now(),
    };
    
    const { menu, family } = getState();
    const familyId = family.currentFamilyId;
    
    if (!familyId) {
      throw new Error("No family selected");
    }

    const item = menu.itemsById[itemId];
    const responses = item?.responses || [];
    
    await dbUpdate(`families/${familyId}/menuItems/${itemId}`, {
      responses: [...responses, response],
    });
    
    return { itemId, response };
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuItems: (state, action) => {
      state.itemsById = action.payload.itemsById;
      state.allItemIds = action.payload.allItemIds;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenForMenuItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenForMenuItems.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(listenForMenuItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        const item = action.payload;
        state.itemsById[item.id] = item;
        state.allItemIds.push(item.id);
      })
      .addCase(updateMenuItemLink.fulfilled, (state, action) => {
        const { itemId, recipeIndex, linkType, newUrl } = action.payload;
        if (state.itemsById[itemId]) {
          state.itemsById[itemId].recipes[recipeIndex][linkType] = newUrl;
        }
      })
      .addCase(addResponseToItem.fulfilled, (state, action) => {
        const { itemId, response } = action.payload;
        if (state.itemsById[itemId]) {
          state.itemsById[itemId].responses.push(response);
        }
      });
  },
});

// Selectors
export const selectAllMenuItems = (state) => 
  state.menu.allItemIds.map((id) => state.menu.itemsById[id]);

export const selectMenuItemById = (state, itemId) => 
  state.menu.itemsById[itemId];

export const selectMenuStatus = (state) => state.menu.status;

export default menuSlice.reducer;

