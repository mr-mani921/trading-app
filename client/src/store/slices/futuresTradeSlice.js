import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api.js";
import { toast } from "react-toastify";
import { setLoading } from "./globalSlice.js";

// Fetch Open Positions
export const fetchOpenPositions = createAsyncThunk(
  "futures/positions",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.get("/futures/positions");

      return response.data.trades;
    } catch (error) {
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Open a New Futures Trade
export const openFuturesTrade = createAsyncThunk(
  "futures/openTrade",
  async (
    { pair, type, assetsAmount, leverage, quantity, amountInUSDT, entryPrice },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await API.post(
        "/futures/open",
        {
          pair,
          type,
          assetsAmount,
          leverage,
          quantity,
          amountInUSDT,
          entryPrice,
        },
        { withCredentials: true }
      );
      toast.success("Trade Opened Successfully");
      return response.data;
    } catch (error) {
      console.log(error.response.data.message);
      toast.error(error.response?.data?.message || "Failed to open trade");
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

// Close a Trade
export const closeFuturesTrade = createAsyncThunk(
  "futures/closeTrade",
  async ({ tradeId, closePrice }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Close a trade by trade ID using the futures/close endpoint in the API
      const response = await API.post(
        "/futures/close",
        { tradeId, closePrice },
        { withCredentials: true }
      );
      toast.success("Trade Closed Successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close trade");
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

// Fetch History Trades
export const fetchFuturesTradesHistory = createAsyncThunk(
  "futures/history",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await API.get("/futures/history");
      return response.data.trades;
    } catch (error) {
      return rejectWithValue(error.response.data);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Initial State
const initialState = {
  openPositions: [],
  futuresHistoryTrades: [], // Add historyTrades to the initial state
  status: "idle",
  error: null,
};

// Futures Slice
const futuresTradeSlice = createSlice({
  name: "futures",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenPositions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOpenPositions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.openPositions = action.payload;
      })
      .addCase(fetchOpenPositions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(openFuturesTrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(openFuturesTrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.openPositions.push(action.payload);
      })
      .addCase(openFuturesTrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(closeFuturesTrade.pending, (state) => {
        state.status = "loading";
      })
      .addCase(closeFuturesTrade.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.openPositions = state.openPositions.filter(
          (trade) => trade._id !== action.payload.tradeId
        );
      })
      .addCase(closeFuturesTrade.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchFuturesTradesHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFuturesTradesHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.futuresHistoryTrades = action.payload;
      })
      .addCase(fetchFuturesTradesHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default futuresTradeSlice.reducer;
