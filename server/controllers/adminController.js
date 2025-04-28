import axios from "axios";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import FuturesTrade from "../models/FuturesTrade.js";
import PerpetualTrade from "../models/PerpetualTrade.js";
import Trade from "../models/Trade.js";
import Transaction from "../models/Transaction.js"; // Ensure you import the Transaction model
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { io } from "../server.js";

export const fetchUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const approveOrder = catchAsyncErrors(async (req, res) => {
  try {
    const { orderId } = req.params;

    const trade = await Trade.findById(orderId);
    if (!trade) return res.status(404).json({ message: "Order not found" });

    const wallet = await Wallet.findOne({ userId: trade.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    let totalCost = trade.quantity * trade.price;

    if (trade.type === "buy") {
      if (wallet.spotWallet < totalCost) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in spot wallet" });
      }
      wallet.spotWallet -= totalCost;
      const holding = wallet.holdings.find((h) => h.asset === trade.asset);
      if (holding) {
        holding.quantity += trade.quantity;
      } else {
        wallet.holdings.push({ asset: trade.asset, quantity: trade.quantity });
      }
    } else {
      const holding = wallet.holdings.find((h) => h.asset === trade.asset);
      if (!holding) {
        return res.status(400).json({ message: "Holding not found" });
      }
      holding.quantity -= trade.quantity;
      if (holding.quantity === 0) {
        wallet.holdings = wallet.holdings.filter(
          (h) => h.asset !== trade.asset
        );
      }
      wallet.spotWallet += totalCost;
    }

    await wallet.save();
    trade.status = "approved";
    await trade.save();

    io.emit("orderApproved", trade);

    res.status(200).json({ message: "Order approved successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Error approving order", error });
  }
});

export const rejectOrder = catchAsyncErrors(async (req, res) => {
  try {
    const { orderId } = req.params;
    const trade = await Trade.findById(orderId);
    if (!trade) return res.status(404).json({ message: "Order not found" });

    trade.status = "rejected";
    await trade.save();

    io.emit("orderRejected", trade);

    res.status(200).json({ message: "Order rejected successfully", trade });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting order", error });
  }
});

export const fetchOpenTrades = async (req, res) => {
  try {
    // Fetch open futures trades and add category field
    const futuresTrades = await FuturesTrade.find({ status: "open" })
      .populate("userId", "firstName") // Fetch user firstName
      .lean(); // Converts Mongoose documents to plain objects

    futuresTrades.forEach((trade) => (trade.category = "Futures"));

    // Fetch open perpetual trades and add category field
    const perpetualTrades = await PerpetualTrade.find({ status: "open" })
      .populate("userId", "firstName")
      .lean();

    perpetualTrades.forEach((trade) => (trade.category = "Perpetual"));

    // Combine both trade lists
    const openTrades = [...futuresTrades, ...perpetualTrades];

    res.status(200).json({
      message: "Successfully found the open trades",
      trades: openTrades,
    });
  } catch (error) {
    console.error("Error fetching open trades:", error);
    res.status(500).json({ message: "Error fetching open trades" });
  }
};

export const liquidateTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { marketPrice, amount, type } = req.body; // Receive market price from frontend
    console.log("the request is for liquidation");

    if (!marketPrice) {
      return res.status(400).json({ message: "Market price is required" });
    }

    let trade = await FuturesTrade.findById(tradeId);
    let category = "futures";
    if (!trade) {
      trade = await PerpetualTrade.findById(tradeId);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      category = "perpetual";
    }

    if (trade.status !== "open") {
      return res.status(400).json({ message: "Trade is already closed" });
    }

    // Use the market price received from the frontend
    const closePrice = parseFloat(marketPrice);

    // Find the user and wallet
    const user = await User.findById(trade.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // **Calculate Profit/Loss**
    let profitLoss;
    if (type === "profit") {
      profitLoss = amount * trade.leverage;
    } else {
      profitLoss = -amount * trade.leverage;
    }

    // **Update User Wallet Balance**
    if (category === "futures") {
      const updatedBalance =
        wallet.futuresWallet + trade.marginUsed + profitLoss;
      wallet.futuresWallet = Math.max(0, updatedBalance);
    } else if (category === "perpetual") {
      const updatedBalance =
        wallet.perpetualsWallet + trade.marginUsed + profitLoss;
      wallet.perpetualsWallet = Math.max(0, updatedBalance);
    }
    await wallet.save();

    // **Update trade with status, closePrice, and PNL**
    trade.status = "closed";
    trade.closedAt = new Date();
    trade.profitLoss = profitLoss;
    trade.closePrice = closePrice;
    await trade.save();

    // Emit event for real-time updates
    io.emit("tradeClose", { tradeId: trade._id, profitLoss });

    res.status(200).json({
      message: "Trade closed successfully",
      profitLoss,
      closePrice,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error closing trade", error: error.message });
  }
};
