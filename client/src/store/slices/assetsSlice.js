import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../../utils/api";
import { setLoading } from "./globalSlice";

export const fundsRequest = createAsyncThunk(
  "funds/request",
  async (
    { amount, currency, network, walletAddress, type },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await API.post("/funds/request", {
        amount,
        currency,
        network,
        type,
        walletAddress,
      });
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

export const getWallet = createAsyncThunk(
  "user/wallet",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Detect if user is on iOS/macOS
      const userAgent = navigator.userAgent.toLowerCase();
      const isApple = /(mac|iphone|ipad|ipod)/i.test(userAgent);
      const isSafari =
        isApple &&
        /safari/i.test(userAgent) &&
        !/chrome|crios/i.test(userAgent);

      // Add a random query parameter to prevent caching on Safari
      const cacheBuster = `_t=${Date.now()}`;
      const url = isSafari
        ? `/user/getwallet?${cacheBuster}`
        : "/user/getwallet";

      // Use a different configuration for Apple devices if needed
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        timeout: isApple ? 60000 : 30000, // Longer timeout for Apple devices
      };

      // For Safari, use a retry mechanism with progressive backoff
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!response && attempts < maxAttempts) {
        try {
          attempts++;
          response = await API.get(url, config);
          break;
        } catch (error) {
          console.warn(
            `Wallet fetch attempt ${attempts} failed: ${error.message}`
          );

          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait longer between each retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Ensure we have valid data before returning
      if (!response?.data) {
        throw new Error("Invalid wallet data received");
      }

      // Add safety checks for wallet properties
      const walletData = response.data;

      // Ensure all required wallet properties exist
      const safeWallet = {
        spotWallet: walletData.spotWallet || 0,
        exchangeWallet: walletData.exchangeWallet || 0,
        futuresWallet: walletData.futuresWallet || 0,
        perpetualsWallet: walletData.perpetualsWallet || 0,
        holdings: Array.isArray(walletData.holdings) ? walletData.holdings : [],
        exchangeHoldings: Array.isArray(walletData.exchangeHoldings)
          ? walletData.exchangeHoldings
          : [],
        frozenAssets: Array.isArray(walletData.frozenAssets)
          ? walletData.frozenAssets
          : [],
        ...walletData,
      };

      return safeWallet;
    } catch (error) {
      console.error("Wallet fetch error:", error);

      // Create a user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch wallet data" +
          (error.message ? `: ${error.message}` : "");

      toast.error(errorMessage);

      return rejectWithValue(error.response?.data || { message: errorMessage });
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

export const swapAssets = createAsyncThunk(
  "wallet/swapAssets",
  async (
    { fromAsset, toAsset, amount, exchangeRate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await API.post("/user/swap", {
        fromAsset,
        toAsset,
        amount,
        exchangeRate,
      });

      toast.success(response.data.message || "Swap successful");
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

export const fetchExchangeRate = createAsyncThunk(
  "wallet/fetchExchangeRate",
  async ({ fromAsset, toAsset }, { rejectWithValue }) => {
    try {
      // Validate inputs
      if (!fromAsset || !toAsset) {
        return rejectWithValue({ message: "Invalid currency pair" });
      }

      // Make the API request to CryptoCompare
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/price`,
        {
          params: {
            fsym: fromAsset.toUpperCase(), // Convert from (e.g., BTC)
            tsyms: toAsset.toUpperCase(), // Convert to (e.g., ETH)
          },
        }
      );

      // Extract the exchange rate from the response
      const exchangeRate = response.data[toAsset.toUpperCase()];

      if (!exchangeRate) {
        toast.error("Invalid currency pair or no data available");
        return rejectWithValue({
          message: "Invalid currency pair or no data available",
        });
      }

      return exchangeRate;
    } catch (error) {
      toast.error(
        error.response?.data?.Message || "Failed to fetch exchange rate"
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

// Transfer Funds Async Thunk
export const transferFunds = createAsyncThunk(
  "assets/transferFunds",
  async (
    { fromWallet, toWallet, amount, transferAsset, asset },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await API.post("/wallet/transfer", {
        fromWallet,
        toWallet,
        transferAsset,
        amount,
        asset: transferAsset,
      });
      toast.success(response?.data?.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
      return rejectWithValue(
        error.response?.data?.message || "Transfer failed"
      );
    } finally {
      dispatch(setLoading(false)); // Stop loading after request
    }
  }
);

const assetsSlice = createSlice({
  name: "assets",
  initialState: {
    balance: 0,
    pendingTransactions: [],
    depositHistory: [],
    withdrawalHistory: [],
    status: "idle",
    error: null,
    exchangeRate: null, // Add exchangeRate to the initial state
  },
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    addPendingTransaction: (state, action) => {
      state.pendingTransactions.push(action.payload);
    },
    removePendingTransaction: (state, action) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        (tx) => tx.id !== action.payload
      );
    },
    addDepositHistory: (state, action) => {
      state.depositHistory.push(action.payload);
    },
    addWithdrawalHistory: (state, action) => {
      state.withdrawalHistory.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fundsRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fundsRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.balance += action.payload.amount;
        state.depositHistory.push(action.payload);
        state.error = null;
      })
      .addCase(fundsRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to process deposit";
      })
      .addCase(getWallet.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wallet = action.payload;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to fetch wallet data";
      })
      .addCase(fetchExchangeRate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExchangeRate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exchangeRate = action.payload;
      })
      .addCase(fetchExchangeRate.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Failed to fetch exchange rate";
      })

      // Transfer Funds Cases
      .addCase(transferFunds.pending, (state) => {
        state.transferStatus = "loading";
      })
      .addCase(transferFunds.fulfilled, (state, action) => {
        state.transferStatus = "succeeded";
      })
      .addCase(transferFunds.rejected, (state, action) => {
        state.transferStatus = "failed";
        state.transferError = action.payload;
      });
  },
});

export const {
  updateBalance,
  addPendingTransaction,
  removePendingTransaction,
  addDepositHistory,
  addWithdrawalHistory,
} = assetsSlice.actions;

export default assetsSlice.reducer;
