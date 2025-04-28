import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarketData } from "../../store/slices/marketSlice"; // Adjust the import path
import PropTypes from "prop-types";

const FuturesTradeHistory = ({ trades }) => {
  const dispatch = useDispatch();
  const { coins } = useSelector((state) => state.market);

  useEffect(() => {
    dispatch(fetchMarketData());
  }, [dispatch]);

  const getCoinImage = (symbol) => {
    let foundCoin = coins.find(
      (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase()
    );
    return foundCoin?.image;
  };

  const extractBase = (pair) => {
    if (!pair) return "";
    if (pair.length <= 3) return pair;
    const base = pair.slice(0, 3);
    return `${base}`;
  };

  const formatPnL = (pnl) => {
    // If pnl is undefined, null, or not a number
    if (pnl === undefined || pnl === null || isNaN(parseFloat(pnl))) {
      return "--";
    }

    // Convert to number if it's a string
    const numPnl = typeof pnl === "string" ? parseFloat(pnl) : pnl;

    // Format with 2 decimal places
    const formattedValue = numPnl.toFixed(2);

    // Add a plus sign for positive values
    return `${numPnl >= 0 ? "+" : ""}${formattedValue}`;
  };

  return (
    <div className="rounded-lg shadow-lg">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Pair
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Type
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Leverage
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Entry Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                Close Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                PNL (USDT)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {trades.map((trade, idx) => (
              <tr
                key={trade._id || idx}
                className="hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-2 text-sm text-gray-200 flex items-center gap-3">
                  <img
                    src={getCoinImage(extractBase(trade.pair))}
                    alt={extractBase(trade.pair)}
                    className="w-8 h-8"
                  />
                  <div>
                    <h2 className="text-lg font-bold ">
                      {extractBase(trade.pair).toUpperCase()}
                    </h2>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-200 capitalize">
                  {trade.type}
                </td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  {trade.leverage}x
                </td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trade.status === "open"
                        ? "bg-green-500 text-green-100"
                        : trade.status === "liquidated"
                        ? "bg-red-500 text-red-100"
                        : "bg-blue-500 text-blue-100"
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  ${trade.entryPrice?.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  {trade.closePrice ? `$${trade.closePrice.toFixed(2)}` : "--"}
                </td>
                <td
                  className={`px-4 py-2 text-sm font-medium ${
                    trade.profitLoss > 0
                      ? "text-green-400"
                      : trade.profitLoss < 0
                      ? "text-red-400"
                      : "text-gray-200"
                  }`}
                >
                  {formatPnL(trade.profitLoss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {trades.map((trade, idx) => (
          <div
            key={trade._id || idx}
            className="border-b border-[#2f2f2f] p-4 shadow-md"
          >
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-3">
                <img
                  src={getCoinImage(extractBase(trade.pair))}
                  alt={extractBase(trade.pair)}
                  className="w-8 h-8"
                />
                <div>
                  <h2 className="text-lg font-bold ">
                    {extractBase(trade.pair).toUpperCase()}
                  </h2>
                </div>
              </span>
              <span className="text-[#e9b43b] bg-[#37321e] text-sm p-1 rounded-md">
                {trade.leverage}x
              </span>
            </div>

            <div className="mt-2 text-white text-sm">
              <div className="flex justify-between mt-1">
                <span>Type</span>
                <span className="capitalize">{trade.type}</span>
              </div>

              <div className="flex justify-between mt-1">
                <span>Entry Price</span>
                <span>${trade.entryPrice?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mt-1">
                <span>Close Price</span>
                <span>
                  {trade.closePrice ? `$${trade.closePrice.toFixed(2)}` : "--"}
                </span>
              </div>

              <div className="flex justify-between mt-1">
                <span>PNL (USDT)</span>
                <span
                  className={`font-medium ${
                    trade.profitLoss > 0
                      ? "text-green-400"
                      : trade.profitLoss < 0
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {formatPnL(trade.profitLoss)}
                </span>
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-red-400">Status</span>
                <span
                  className={`border px-2 py-1 rounded-md ${
                    trade.status === "open"
                      ? "border-green-400 text-green-400"
                      : trade.status === "liquidated"
                      ? "border-red-400 text-red-400"
                      : "border-blue-400 text-blue-400"
                  }`}
                >
                  {trade.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

FuturesTradeHistory.propTypes = {
  trades: PropTypes.array.isRequired,
};

export default FuturesTradeHistory;
