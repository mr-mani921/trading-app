import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../../utils/api.js";
import { toast } from "react-toastify";

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await API.post("/user/login", { email, password });
      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success(response.data.message);

      return response.data;
    } catch (error) {
      toast.error(JSON.stringify(error.response.data.message));
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for registering
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const response = await API.post("/user/register", {
        email,
        password,
        firstName,
        lastName,
      });
      toast.success(response.data.message);
      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      toast.error(JSON.stringify(error.response.data.message));
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for logging out
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await API.get("/user/logout", {});
      // Remove user data from local storage
      localStorage.removeItem("user");
      toast.success("User logged out successfully")
      return {};
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const logoutAdmin = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await API.get("/admin/logout", {});
      // Remove user data from local storage
      localStorage.removeItem("user");
      toast.success("Admin logged out successfully")
      return {};
    } catch (error) {
      toast.error(error.response.data.message)
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
