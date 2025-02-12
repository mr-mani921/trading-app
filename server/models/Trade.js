import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  asset: { type: String, required: true }, // e.g., BTC/USDT
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, enum: ["executed", "canceled"], default: "executed" },
  executedAt: { type: Date, default: Date.now },
});

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
