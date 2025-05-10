import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import { validationResult } from "express-validator";
import { generateToken } from "../utils/jwtToken.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
/**
 * @desc Register a new user
 * @route POST /api/users/register
 */
export const register = catchAsyncErrors(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }
  const userRole = role || "user";
  // Create new user
  user = new User({
    firstName,
    lastName,
    email,
    password,
    role: userRole,
  });

  await user.save();

  // Create a wallet for the user
  const wallet = new Wallet({ userId: user._id });
  await wallet.save();
  generateToken(user, "User logged in successfully", 200, res);
});

/**
 * @desc Login user & return JWT token
 * @route POST /api/users/login
 */
export const login = catchAsyncErrors(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });

  const isMatch = await user.comparePasswords(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = generateToken(user, "User logged in successfully", 200, res);
});

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("userToken", "", {
      httpOnly: true,
      secure: true,
      samesite: "none",
      path: "/",
      expires: new Date(0),
      domain: process.env.COOKIE_DOMAIN || undefined,
    })
    .json({
      success: true,
      message: "User Logout successfully",
    });
});
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      secure: true,
      samesite: "none",
      path: "/",
      expires: new Date(0),
      domain: process.env.COOKIE_DOMAIN || undefined,
    })
    .json({
      success: true,
      message: "Admin Logout successfully",
    });
});
/**
 * @desc Get logged-in user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user, message: "User successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, country } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;
    user.country = country || user.country;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

/**
 * @desc Get user's wallet balance
 * @route GET /api/users/wallet
 * @access Private
 */
export const getWallet = async (req, res) => {
  try {
    // Check if the request is from Safari
    const userAgent = req.headers["user-agent"] || "";
    const isSafari =
      userAgent.includes("Safari") &&
      !userAgent.includes("Chrome") &&
      !userAgent.includes("Android");

    // Set Safari-friendly headers
    if (isSafari) {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id })
      .populate("withdrawalHistory")
      .populate("depositHistory")
      .exec();

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Create a well-formed response to ensure Safari compatibility
    const walletData = {
      ...wallet.toObject(),
      spotWallet: wallet.spotWallet || 0,
      exchangeWallet: wallet.exchangeWallet || 0,
      futuresWallet: wallet.futuresWallet || 0,
      perpetualsWallet: wallet.perpetualsWallet || 0,
      holdings: Array.isArray(wallet.holdings) ? wallet.holdings : [],
      exchangeHoldings: Array.isArray(wallet.exchangeHoldings)
        ? wallet.exchangeHoldings
        : [],
      frozenAssets: Array.isArray(wallet.frozenAssets)
        ? wallet.frozenAssets
        : [],
    };

    res.status(200).json(walletData);
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.status(500).json({
      message: "Error fetching wallet data",
      error: error.message,
    });
  }
};

/**
 * @desc Request deposit (User uploads payment proof)
 * @route POST /api/users/deposit
 * @access Private
 */
export const requestDeposit = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const transaction = new Transaction({
      userId: req.user.userId,
      type: "deposit",
      amount,
      currency: "USDT",
      status: "pending",
    });

    await transaction.save();

    res.json({
      success: true,
      message: "Deposit request submitted",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

/**
 * @desc Request withdrawal
 * @route POST /api/users/withdraw
 * @access Private
 */
export const requestWithdraw = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const wallet = await Wallet.findOne({ userId: req.user.userId });
    if (wallet.balanceUSDT < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    const transaction = new Transaction({
      userId: req.user.userId,
      type: "withdrawal",
      amount,
      currency: "USDT",
      paymentMethod,
      status: "pending",
    });

    await transaction.save();

    wallet.balanceUSDT -= amount;
    await wallet.save();

    res.json({
      success: true,
      message: "Withdrawal request submitted",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

/**
 * @desc Get transaction history
 * @route GET /api/users/transactions
 * @access Private
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
export const swapCrypto = async (req, res) => {
  try {
    const { fromAsset, toAsset, amount, exchangeRate } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!fromAsset || !toAsset || !amount || !exchangeRate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch user's wallet
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Calculate the amount to receive
    const toAmount = amount * exchangeRate;

    // Handle 'fromAsset' logic
    if (fromAsset === "USDT") {
      // Check if the user has enough USDT in the exchangeWallet
      if (userWallet.exchangeWallet < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      // Deduct from exchangeWallet
      userWallet.exchangeWallet -= amount;
    } else {
      // Find the 'fromAsset' in the assets array
      const fromAssetIndex = userWallet.exchangeHoldings.findIndex(
        (holding) => holding.asset === fromAsset
      );

      if (
        fromAssetIndex === -1 ||
        userWallet.exchangeHoldings[fromAssetIndex].quantity < amount
      ) {
        return res
          .status(400)
          .json({ message: "Insufficient balance in exchange wallet" });
      }
      // Deduct from the existing asset balance
      userWallet.exchangeHoldings[fromAssetIndex].quantity -= amount;
    }

    // Handle 'toAsset' logic
    if (toAsset === "USDT") {
      // Add to exchangeWallet
      userWallet.exchangeWallet += toAmount;
    } else {
      // Find the 'toAsset' in the assets array
      const toAssetIndex = userWallet.exchangeHoldings.findIndex(
        (holding) => holding.asset === toAsset
      );

      if (toAssetIndex === -1) {
        // If the asset doesn't exist, add it to the assets array
        userWallet.exchangeHoldings.push({
          asset: toAsset,
          quantity: toAmount,
        });
      } else {
        // If the asset exists, increment its balance
        userWallet.exchangeHoldings[toAssetIndex].quantity += toAmount;
      }
    }

    // Save the updated wallet
    await userWallet.save();

    // Save transaction details
    const transaction = new Transaction({
      userId,
      type: "swap",
      fromAsset,
      toAsset,
      fromAmount: amount,
      toAmount,
      exchangeRate,
      status: "completed",
      transactionId: uuidv4(),
      timestamp: new Date(),
    });
    await transaction.save();

    return res.status(200).json({
      message: "Swap successful",
      fromAmount: amount,
      toAmount,
    });
  } catch (error) {
    console.error("Error in swapCrypto:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
