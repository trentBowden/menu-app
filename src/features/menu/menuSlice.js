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
    const { menu, family, auth } = getState();
    const user = auth.user;
    
    const response = {
      userId,
      type: responseType,
      timestamp: Date.now(),
      userName: user?.displayName || "Unknown User",
      userPhotoURL: user?.photoURL || null,
    };
    
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

export const clearResponseFromItem = createAsyncThunk(
  "menu/clearResponseFromItem",
  async ({ userId, itemId }, { getState }) => {
    const { menu, family } = getState();
    const familyId = family.currentFamilyId;
    
    if (!familyId) {
      throw new Error("No family selected");
    }

    const item = menu.itemsById[itemId];
    const responses = item?.responses || [];
    
    // Filter out all responses from this user
    const updatedResponses = responses.filter(r => r.userId !== userId);
    
    await dbUpdate(`families/${familyId}/menuItems/${itemId}`, {
      responses: updatedResponses,
    });
    
    return { itemId, userId };
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
      // Note: We don't optimistically add items on createMenuItem.fulfilled
      // because the Firebase listener will automatically pick up the new item
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
      })
      .addCase(clearResponseFromItem.fulfilled, (state, action) => {
        const { itemId, userId } = action.payload;
        if (state.itemsById[itemId]) {
          state.itemsById[itemId].responses = state.itemsById[itemId].responses.filter(
            r => r.userId !== userId
          );
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

