import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dbOnValue, dbUpdate, dbRef, getServerTimestamp } from "../../services/firebase";
import { ref, set, get } from "firebase/database";
import { rtdb } from "../../services/firebase";

const initialState = {
  currentFamilyId: null,
  families: {}, // { familyId: { id, name, role: 'admin' | 'member', joinedAt } }
  familyDetails: null, // Details of current family including members
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Helper function to generate a random 6-character family ID
export const generateFamilyId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to validate PIN (4 digits)
export const validatePin = (pin) => {
  return /^\d{4}$/.test(pin);
};

// Thunks
export const loadUserFamilies = createAsyncThunk(
  "family/loadUserFamilies",
  async (userId, { dispatch }) => {
    return new Promise((resolve, reject) => {
      dbOnValue(`userFamilies/${userId}`, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch(familySlice.actions.setFamilies(data));
          
          // If there's a current family set, load it
          if (data.currentFamilyId) {
            dispatch(familySlice.actions.setCurrentFamily(data.currentFamilyId));
          }
        } else {
          dispatch(familySlice.actions.setFamilies({}));
        }
        resolve(data);
      });
    });
  }
);

export const createFamily = createAsyncThunk(
  "family/createFamily",
  async ({ userId, familyName, pin }, { rejectWithValue }) => {
    try {
      console.log("createFamily called with:", { userId, familyName, pin });
      console.log("rtdb object:", rtdb);
      
      if (!validatePin(pin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      // Generate unique family ID
      let familyId = generateFamilyId();
      let attempts = 0;
      
      console.log("Generated family ID:", familyId);
      
      // Check if ID already exists (very unlikely but good to check)
      while (attempts < 10) {
        const familyRef = ref(rtdb, `families/${familyId}`);
        console.log("Checking if family ID exists...", familyId);
        const snapshot = await get(familyRef);
        if (!snapshot.exists()) {
          break;
        }
        familyId = generateFamilyId();
        attempts++;
      }

      const timestamp = Date.now();

      // Create family document
      const familyData = {
        id: familyId,
        name: familyName,
        pin: pin,
        createdAt: timestamp,
        createdBy: userId,
      };

      console.log("Creating family in Firebase:", familyData);
      await set(ref(rtdb, `families/${familyId}`), familyData);
      console.log("✓ Family created");

      // Add user to family members
      console.log("Adding user to family members...");
      await set(ref(rtdb, `familyMembers/${familyId}/${userId}`), {
        userId,
        isAdmin: true,
        joinedAt: timestamp,
      });
      console.log("✓ Family member added");

      // Add family to user's families
      console.log("Adding family to user's families...");
      await set(ref(rtdb, `userFamilies/${userId}/families/${familyId}`), {
        familyId,
        name: familyName,
        isAdmin: true,
        joinedAt: timestamp,
      });
      console.log("✓ User family added");

      // Set as current family
      console.log("Setting as current family...");
      await set(ref(rtdb, `userFamilies/${userId}/currentFamilyId`), familyId);
      console.log("✓ Current family set");

      console.log("Family creation complete!");
      return { familyId, name: familyName, isAdmin: true, joinedAt: timestamp };
    } catch (error) {
      console.error("createFamily error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return rejectWithValue(error.message);
    }
  }
);

export const joinFamily = createAsyncThunk(
  "family/joinFamily",
  async ({ userId, familyId, pin }, { rejectWithValue }) => {
    try {
      if (!validatePin(pin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      // Get family data
      const familyRef = ref(rtdb, `families/${familyId}`);
      const snapshot = await get(familyRef);

      if (!snapshot.exists()) {
        throw new Error("Family not found");
      }

      const familyData = snapshot.val();

      // Validate PIN
      if (familyData.pin !== pin) {
        throw new Error("Incorrect PIN");
      }

      const timestamp = Date.now();

      // Add user to family members
      await set(ref(rtdb, `familyMembers/${familyId}/${userId}`), {
        userId,
        isAdmin: false,
        joinedAt: timestamp,
      });

      // Add family to user's families
      await set(ref(rtdb, `userFamilies/${userId}/families/${familyId}`), {
        familyId,
        name: familyData.name,
        isAdmin: false,
        joinedAt: timestamp,
      });

      // Set as current family if it's the first one
      const userFamiliesRef = ref(rtdb, `userFamilies/${userId}/currentFamilyId`);
      const currentFamilySnapshot = await get(userFamiliesRef);
      
      if (!currentFamilySnapshot.exists()) {
        await set(userFamiliesRef, familyId);
      }

      return { familyId, name: familyData.name, isAdmin: false, joinedAt: timestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const switchFamily = createAsyncThunk(
  "family/switchFamily",
  async ({ userId, familyId }, { rejectWithValue }) => {
    try {
      await set(ref(rtdb, `userFamilies/${userId}/currentFamilyId`), familyId);
      return familyId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadFamilyDetails = createAsyncThunk(
  "family/loadFamilyDetails",
  async (familyId, { dispatch }) => {
    return new Promise((resolve) => {
      // Load family info
      dbOnValue(`families/${familyId}`, async (familySnapshot) => {
        const familyData = familySnapshot.val();
        
        if (familyData) {
          // Load family members
          const membersRef = ref(rtdb, `familyMembers/${familyId}`);
          const membersSnapshot = await get(membersRef);
          const members = membersSnapshot.val() || {};

          dispatch(familySlice.actions.setFamilyDetails({
            ...familyData,
            members,
          }));
        }
        resolve();
      });
    });
  }
);

export const removeFamilyMember = createAsyncThunk(
  "family/removeFamilyMember",
  async ({ familyId, memberId }, { rejectWithValue }) => {
    try {
      // Remove from family members
      await set(ref(rtdb, `familyMembers/${familyId}/${memberId}`), null);
      
      // Remove from user's families
      await set(ref(rtdb, `userFamilies/${memberId}/families/${familyId}`), null);
      
      // If this was their current family, clear it
      const currentFamilyRef = ref(rtdb, `userFamilies/${memberId}/currentFamilyId`);
      const snapshot = await get(currentFamilyRef);
      if (snapshot.exists() && snapshot.val() === familyId) {
        await set(currentFamilyRef, null);
      }

      return { familyId, memberId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFamilyPin = createAsyncThunk(
  "family/updateFamilyPin",
  async ({ familyId, newPin }, { rejectWithValue }) => {
    try {
      if (!validatePin(newPin)) {
        throw new Error("PIN must be exactly 4 digits");
      }

      await set(ref(rtdb, `families/${familyId}/pin`), newPin);
      return { familyId, newPin };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const familySlice = createSlice({
  name: "family",
  initialState,
  reducers: {
    setCurrentFamily: (state, action) => {
      state.currentFamilyId = action.payload;
    },
    setFamilies: (state, action) => {
      const data = action.payload;
      state.families = data.families || {};
      state.currentFamilyId = data.currentFamilyId || null;
    },
    setFamilyDetails: (state, action) => {
      state.familyDetails = action.payload;
    },
    clearFamilyState: (state) => {
      state.currentFamilyId = null;
      state.families = {};
      state.familyDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFamilies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadUserFamilies.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(loadUserFamilies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        const family = action.payload;
        state.families[family.familyId] = family;
        state.currentFamilyId = family.familyId;
        state.status = "succeeded";
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(joinFamily.fulfilled, (state, action) => {
        const family = action.payload;
        state.families[family.familyId] = family;
        if (!state.currentFamilyId) {
          state.currentFamilyId = family.familyId;
        }
        state.status = "succeeded";
      })
      .addCase(joinFamily.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(switchFamily.fulfilled, (state, action) => {
        state.currentFamilyId = action.payload;
      })
      .addCase(loadFamilyDetails.fulfilled, (state) => {
        state.status = "succeeded";
      });
  },
});

// Selectors
export const selectCurrentFamilyId = (state) => state.family.currentFamilyId;
export const selectUserFamilies = (state) => state.family.families;
export const selectFamilyDetails = (state) => state.family.familyDetails;
export const selectFamilyStatus = (state) => state.family.status;
export const selectFamilyError = (state) => state.family.error;
export const selectIsAdmin = (state) => {
  const currentFamilyId = state.family.currentFamilyId;
  if (!currentFamilyId || !state.family.families[currentFamilyId]) {
    return false;
  }
  return state.family.families[currentFamilyId].isAdmin;
};

export const { setCurrentFamily, setFamilies, setFamilyDetails, clearFamilyState } = familySlice.actions;

export default familySlice.reducer;

