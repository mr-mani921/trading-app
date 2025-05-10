import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closePerpetualTrade,
  fetchOpenPerpetualTrades,
} from "../../store/slices/perpetualSlice";
import { Button, Card } from "@material-tailwind/react";
import { toast } from "react-toastify";

const OpenPerpetualPositions = ({ marketPrice, showBtn }) => {
  const dispatch = useDispatch();
  const { openTrades, loading } = useSelector((state) => state.perpetual);
  const { coins } = useSelector((state) => state.market);
  const [pnlData, setPnlData] = useState({});
  const [socketMarketPrice, setSocketMarketPrice] = useState();

  const getCoinData = (symbol) => {
    return coins.find(
      (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase()
    );
  };

  useEffect(() => {
    // Fetch market price directly from Binance WebSocket
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSocketMarketPrice(parseFloat(data.p));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!socketMarketPrice || openTrades.length === 0) return;

    const newPnlData = {};

    openTrades.forEach((trade) => {
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
  }, [socketMarketPrice, openTrades]);

  const handleCloseTrade = (tradeId) => {
    if (!tradeId) {
      toast.error("Please select a trade to close!");
      return;
    }
    console.log(marketPrice);
    dispatch(closePerpetualTrade({ tradeId, closePrice: marketPrice }));
    dispatch(fetchOpenPerpetualTrades());
  };

  return (
    <div>
      <div>
        <Card className=" bg-transparent text-white min-w-[100%] hidden md:flex">
          <table className="text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase ">
              <tr>
                <th className="py-2">Pair</th>
                <th className="py-2">Type</th>
                <th className="py-2">Leverage</th>
                <th className="py-2">Entry Price</th>
                <th className="py-2 hidden md:table-cell">Liquidation Price</th>
                <th className="py-2">PNL (USDT)</th>
                {showBtn && (
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="min-w-full">
              {openTrades?.length > 0 ? (
                openTrades?.map((trade) => {
                  const coinData = getCoinData(trade.pair.split("USDT")[0]);

                  return (
                    <tr
                      key={trade._id}
                      className=" border-t bg-transparent border-gray-700"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={coinData?.image}
                          alt={coinData?.name}
                          className="w-6 h-6"
                        />
                        <span>{coinData?.name}</span>
                      </td>
                      <td className="py-2 capitalize">{trade.type}</td>
                      <td className="py-2">{trade.leverage}x</td>
                      <td className="py-2">${trade?.entryPrice?.toFixed(2)}</td>
                      <td className="py-2 text-red-400 hidden md:table-cell">
                        ${trade?.liquidationPrice?.toFixed(2)}
                      </td>
                      <td
                        className={`py-2 font-semibold ${
                          pnlData[trade._id] > 0
                            ? "text-green-500"
                            : "text-red-400"
                        }`}
                      >
                        {pnlData[trade._id]
                          ? pnlData[trade._id].toFixed(2)
                          : "--"}{" "}
                      </td>
                      {showBtn && (
                        <td className="px-6 py-4">
                          <Button
                            onClick={() => handleCloseTrade(trade._id)}
                            className={`px-4 py-2 rounded-md bg-[#ff5e5a]`}
                            disabled={loading}
                          >
                            {loading ? "Closing..." : "Close Trade"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr className="border-y  border-gray-700">
                  <td colSpan={8} className="px-6 py-4 text-center">
                    No open trades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* for mobile screens */}
      <div className="md:hidden">
        {openTrades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openTrades.map((trade) => (
              <div
                key={trade._id}
                className="border-b border-[#2f2f2f] p-4 shadow-md"
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
                  {showBtn && (
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
                  )}
                  <div className="flex justify-between mt-1">
                    <span>Size ({trade.pair.split("/")[0]})</span>
                    <span>{trade.quantity.toFixed(2)}</span>
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
};

export default OpenPerpetualPositions;
