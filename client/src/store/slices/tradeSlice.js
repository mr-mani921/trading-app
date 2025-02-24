import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../../utils/api";
import { toast } from "react-toastify";
import { setLoading } from "./globalSlice";

// Fetch coin market data
export const fetchCoinData = createAsyncThunk(
  "trade/fetchCoinData",
  async (coinId) => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: "1",
          interval: "hourly",
        },
      }
    );
    return response.data;
  }
);

// Place a new order (User Side)
export const placeOrder = createAsyncThunk(
  "trade/placeOrder",
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.post("/trade/placeOrder", orderData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

// Fetch pending orders for Admin Approval
export const fetchPendingOrders = createAsyncThunk(
  "trade/fetchPendingOrders",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.get("/trade/pending-orders", {
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

// Admin Approves an Order
export const approveOrder = createAsyncThunk(
  "trade/approveOrder",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.put(`/admin/approve-order/${orderId}`, {});
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

// Admin Rejects an Order
export const rejectOrder = createAsyncThunk(
  "trade/rejectOrder",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.put(`/admin/reject-order/${orderId}`, {});
      toast.success(response.data.message);

      return response.data;
    } catch (error) {
      toast.success(error.response.data.message);

      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

const tradeSlice = createSlice({
  name: "trade",
  initialState: {
    selectedCoin: null,
    chartData: [],
    recentTrades: [],
    trades: [],
    pendingOrders: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setSelectedCoin: (state, action) => {
      state.selectedCoin = action.payload;
    },
    addTrade: (state, action) => {
      state.recentTrades.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoinData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoinData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chartData = action.payload.prices;
      })
      .addCase(fetchCoinData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(placeOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.trades.push(action.payload.trade);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Pending Orders
      .addCase(fetchPendingOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPendingOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pendingOrders = action.payload;
      })
      .addCase(fetchPendingOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Approve Order
      .addCase(approveOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(approveOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pendingOrders = state.pendingOrders.filter(
          (order) => order._id !== action.payload.trade._id
        );
      })
      .addCase(approveOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Reject Order
      .addCase(rejectOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pendingOrders = state.pendingOrders.filter(
          (order) => order._id !== action.payload.trade._id
        );
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setSelectedCoin, addTrade } = tradeSlice.actions;
export default tradeSlice.reducer;
