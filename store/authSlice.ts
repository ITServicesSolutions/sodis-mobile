import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "@/services/userService";

// --- LOGOUT ---
export const logout = createAsyncThunk("auth/logout", async () => {
  // Supprime les données persistées
  await AsyncStorage.multiRemove(["access_token", "user"]);
  return true; // valeur de retour inutile, mais utile pour signaler le succès
});

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (body: any, { rejectWithValue }) => {
    try {
      return await userService.login(body);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// GET USER
export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUser();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (body: any, { rejectWithValue }) => {
    try {
      return await userService.register(body);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      return await userService.forgotPassword(email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (body: any, { rejectWithValue }) => {
    try {
      return await userService.resetPassword(body);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// --- UPDATE USER ---
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(data);
      return response;
    } catch (error: any) {
      let message = error.response?.data?.detail || error.message;
      return rejectWithValue(message);
    }
  }
);


// --- CHANGE PASSWORD ---
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: any, { rejectWithValue }) => {
    try {
      // Appel de l'API via userService
      const response = await userService.changePassword(data);

      return response;
    } catch (error: any) {
      let message = error.response?.data?.detail || error.message;

      // Normalisation du message d'erreur
      if (Array.isArray(message)) {
        message = message.join("\n");
      } else if (typeof message === "object") {
        message = JSON.stringify(message, null, 2);
      }

      return rejectWithValue(message);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as any,
    users: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
  builder
    // --- LOGIN ---
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- GET USER ---
    .addCase(getUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(getUser.rejected, (state, action) => {
      state.loading = false;

      // 🚀 Si l’erreur est "Not authenticated", on déconnecte en silence
      if (action.payload === "Not authenticated") {
        state.user = null;
        state.error = null; // on ignore l’erreur
      } else {
        state.error = action.payload as string; // autres erreurs
      }
    })

    // --- REGISTER ---
    .addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.successMessage = "Inscription réussie.";
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- FORGOT PASSWORD ---
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      state.successMessage = "Lien de réinitialisation envoyé à votre email.";
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- RESET PASSWORD ---
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.successMessage =
        "Votre mot de passe a été réinitialisé avec succès.";
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- UPDATE USER ---
    .addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.successMessage = "Profil mis à jour avec succès.";
    })
    .addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- CHANGE PASSWORD ---
    .addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(changePassword.fulfilled, (state) => {
      state.loading = false;
      state.successMessage = "Mot de passe mis à jour avec succès.";
    })
    .addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // --- LOGOUT ---
    .addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.successMessage = "Déconnexion réussie.";
    });
},
});

export const { clearMessages } = authSlice.actions;
export default authSlice.reducer;
