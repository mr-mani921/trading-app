import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOpenPositions,
  closeFuturesTrade,
} from "../../store/slices/futuresTradeSlice";
import io from "socket.io-client";
import { Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const socket = io(import.meta.env.VITE_API_URL);

function FuturesOpenPosition({ showBtn = false }) {
  const [pnlData, setPnlData] = useState({});
  const [marketPrice, setMarketPrice] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const { openPositions, status } = useSelector((state) => state.futures);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOpenPositions());
  }, [dispatch]);

  useEffect(() => {
    // Listen for various socket events that should trigger a refresh
    socket.on("liquidationUpdate", () => dispatch(fetchOpenPositions()));
    socket.on("tradeExpired", () => dispatch(fetchOpenPositions()));
    socket.on("newPosition", () => {
      // When a new position is created, immediately update positions
      dispatch(fetchOpenPositions());
    });

    return () => {
      socket.off("liquidationUpdate");
      socket.off("tradeExpired");
      socket.off("newPosition");
    };
  }, [dispatch]);

  useEffect(() => {
    // Fetch market price directly from Binance WebSocket
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarketPrice(parseFloat(data.p));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!marketPrice || openPositions.length === 0) return;

    const newPnlData = {};

    openPositions.forEach((trade) => {
      const { entryPrice, quantity, type, leverage } = trade;

      // Calculate PNL based on market price
      let pnl;
      if (type === "long") {
        pnl = (marketPrice - entryPrice) * quantity * leverage;
      } else if (type === "short") {
        pnl = (entryPrice - marketPrice) * quantity * leverage;
      } else {
        pnl = 0;
      }

      newPnlData[trade._id] = pnl;
    });

    setPnlData(newPnlData);
  }, [marketPrice, openPositions]);

  // Update countdowns every second
  useEffect(() => {
    if (openPositions.length === 0) return;

    // Initialize countdown values
    const initialCountdowns = {};
    openPositions.forEach((trade) => {
      if (trade.expiryTime) {
        initialCountdowns[trade._id] = getTimeRemaining(
          new Date(trade.expiryTime)
        );
      }
    });
    setCountdowns(initialCountdowns);

    // Update countdowns every second
    const interval = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const newCountdowns = { ...prevCountdowns };

        openPositions.forEach((trade) => {
          if (trade.expiryTime) {
            newCountdowns[trade._id] = getTimeRemaining(
              new Date(trade.expiryTime)
            );
          }
        });

        return newCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [openPositions]);

  // Calculate remaining time
  const getTimeRemaining = (expiryTime) => {
    const total = expiryTime - new Date();

    if (total <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
  };

  // Format countdown display
  const formatCountdown = (countdown, trade) => {
    // If the trade is marked as expired by the system
    if (trade.isExpired) {
      return "0s";
    }

    // If countdown is invalid or time is up
    if (!countdown || countdown.total <= 0) {
      return "0s";
    }

    if (countdown.days > 0) {
      return `${countdown.days}d ${countdown.hours}h`;
    } else if (countdown.hours > 0) {
      return `${countdown.hours}h ${countdown.minutes}m`;
    } else if (countdown.minutes > 0) {
      return `${countdown.minutes}m ${countdown.seconds}s`;
    } else {
      return `${countdown.seconds}s`;
    }
  };

  // Handle closing a trade
  const handleCloseTrade = (tradeId) => {
    if (!tradeId) {
      toast.error("Please select a trade to close!");
      return;
    }

    if (!marketPrice) {
      toast.error("Market price not available. Try again.");
      return;
    }

    dispatch(closeFuturesTrade({ tradeId, closePrice: marketPrice }));
    dispatch(fetchOpenPositions());
  };

  return (
    <div className="mt-6">
      <div className="hidden md:block bg-transparent mb-4">
        {openPositions.length > 0 ? (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Pair</th>
                <th className="py-2">Type</th>
                <th className="py-2">Leverage</th>
                <th className="py-2">Entry Price</th>
                <th className="py-2 hidden md:table-cell">Liquidation Price</th>
                <th className="py-2">PNL (USDT)</th>
                <th className="py-2">Time Remaining</th>
                {showBtn && <th className="py-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              {openPositions.map((trade) => (
                <tr
                  key={trade._id}
                  className="border-b border-gray-700 text-center"
                >
                  <td className="py-2">{trade.pair}</td>
                  <td className="py-2 capitalize">{trade.type}</td>
                  <td className="py-2">{trade.leverage}x</td>
                  <td className="py-2">${trade?.entryPrice?.toFixed(2)}</td>
                  <td className="py-2 text-red-400 hidden md:table-cell">
                    ${trade?.liquidationPrice?.toFixed(2)}
                  </td>
                  <td
                    className={`py-2 font-semibold ${
                      pnlData[trade._id] > 0 ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {pnlData[trade._id] ? pnlData[trade._id]?.toFixed(2) : "--"}{" "}
                  </td>
                  <td className="py-2 text-yellow-400">
                    {formatCountdown(countdowns[trade._id], trade)}
                  </td>
                  {showBtn && (
                    <td className="py-2">
                      <Button
                        onClick={() => handleCloseTrade(trade._id)}
                        className="px-4 py-2 rounded-md bg-[#ff5e5a]"
                        disabled={status === "loading"}
                      >
                        {status === "loading" ? "Closing..." : "Close Trade"}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">No open positions</p>
        )}
      </div>

      {/* for mobile screens */}
      <div className="md:hidden">
        {openPositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPositions.map((trade) => (
              <div
                key={trade._id}
                className=" border-b border-[.1px]-[#2f2f2f] p-4 shadow-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-semibold">
                    {trade.pair} Futures
                  </span>
                  <span className="text-[#e9b43b] bg-[#37321e] text-sm p-1 rounded-md">
                    {trade.leverage}x
                  </span>
                </div>

                <div className="mt-2 text-white text-sm">
                  <div className="flex justify-between">
                    <span>PNL (USDT)</span>
                    <span
                      className={`font-semibold ${
                        pnlData[trade._id] > 0
                          ? "text-green-400"
                          : "text-[#ff5e5a]"
                      }`}
                    >
                      {pnlData[trade._id]
                        ? pnlData[trade._id].toFixed(2)
                        : "--"}
                    </span>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span>Size ({trade?.pair?.split("/")[0]})</span>
                    <span>{trade?.quantity?.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span>Entry Price</span>
                    <span>{trade.entryPrice?.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-red-400">Liquidation Price</span>
                    <span className="border border-red-400 px-2 py-1 rounded-md">
                      {trade.liquidationPrice?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-yellow-400">Time Remaining</span>
                    <span className="border border-yellow-400 px-2 py-1 rounded-md">
                      {formatCountdown(countdowns[trade._id], trade)}
                    </span>
                  </div>

                  {showBtn && (
                    <div className="w-full flex justify-center mt-3">
                      <Button
                        onClick={() => handleCloseTrade(trade._id)}
                        className="px-4 py-2 rounded-md bg-[#ff5e5a]"
                        disabled={status === "loading"}
                      >
                        {status === "loading" ? "Closing..." : "Close Trade"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No open positions</p>
        )}
      </div>
    </div>
  );
}

FuturesOpenPosition.propTypes = {
  showBtn: PropTypes.bool,
};

export default FuturesOpenPosition;
