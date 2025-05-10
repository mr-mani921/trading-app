import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const OrderBook = ({ selectedPair }) => {
  const { t } = useTranslation();
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const wsRef = useRef(null);

  const extractBase = (pair) => {
    if (pair === "MATICUSDT") {
      return "MATIC";
    } else if (pair === "DOGEUSDT") {
      return "DOGE";
    }
    if (pair.length <= 3) return pair; // Handle edge cases
    const base = pair.slice(0, 3);
    return `${base}`;
  };

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `wss://stream.binance.us:9443/ws/${selectedPair.toLowerCase()}@depth`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBids(data.b.slice(0, 7)); // Top 7 bid orders
      setAsks(data.a.slice(0, 7)); // Top 7 ask orders
    };

    ws.onclose = () => console.log("Order book WebSocket closed");
    return () => ws.close();
  }, [selectedPair]);

  const maxBidAmount = Math.max(
    ...bids.map(([, amount]) => parseFloat(amount)),
    1
  );
  const maxAskAmount = Math.max(
    ...asks.map(([, amount]) => parseFloat(amount)),
    1
  );

  return (
    <div className="w-full p-4">
      <span className="text-[.85rem] text-gray-500 flex justify-between md:hidden">
        <p>{t("price_usdt")}</p>
        <p>{`${t("amount")} (${extractBase(selectedPair)})`}</p>
      </span>

      {/* Large Screen View */}
      <table className="hidden sm:table w-full text-[.7rem]">
        <thead>
          <tr className="border-b border-gray-600 text-gray-500 w-full">
            <th className="text-left p-2 w-1/3">{t("price_usdt")}</th>
            <th className="text-left p-2 w-1/3">{`${t("amount")} (${extractBase(
              selectedPair
            )})`}</th>
            <th className="text-left p-2 w-1/3">{t("total_usdt")}</th>
          </tr>
        </thead>
        <tbody className="text-gray-500">
          {asks.map(([price, amount], index) => (
            <tr key={index} className="text-crimsonRed text-left">
              <td className="pb-2 pr-3 w-1/3 text-secondary">
                {parseFloat(price).toFixed(2)}
              </td>
              <td className="pb-2 pr-3 w-1/3">
                {parseFloat(amount).toFixed(2)}
              </td>
              <td className="pb-2 pr-3 w-1/3">
                {(parseFloat(price) * parseFloat(amount)).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="text-sm text-red-500 font-bold pb-1">
            <td colSpan="3" className="text-center">
              {asks.length > 0 ? parseFloat(asks[0][0]).toFixed(2) : "N/A"}
            </td>
          </tr>
          {bids.map(([price, amount], index) => (
            <tr key={index} className="text-neonGreen text-left">
              <td className="pb-2 pr-3 w-1/3 text-tertiary1">
                {parseFloat(price).toFixed(2)}
              </td>
              <td className="pb-2 pr-3 w-1/3">
                {parseFloat(amount).toFixed(2)}
              </td>
              <td className="pb-2 pr-3 w-1/3">
                {(parseFloat(price) * parseFloat(amount)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Small Screen View */}
      <div className="sm:hidden flex flex-col gap-1 text-[1rem]">
        {[...asks].reverse().map(([price, amount], index) => {
          const amountValue = parseFloat(amount);
          const bgWidth = (amountValue / maxAskAmount) * 100;
          return (
            <div key={index} className="relative">
              <div
                className="absolute left-0 top-0 h-full bg-[#0e231e]"
                style={{ width: `${bgWidth + 39}%` }}
              ></div>
              <div className="flex justify-between text-crimsonRed relative">
                <span className="text-[#117554]">
                  {parseFloat(price).toFixed(2)}
                </span>
                <span className="text-gray-400">{amountValue.toFixed(2)}</span>
              </div>
            </div>
          );
        })}

        <div className="text-center font-bold text-[#410a08] py-1">
          {asks.length > 0 ? parseFloat(asks[0][0]).toFixed(2) : "N/A"}
        </div>

        {bids.map(([price, amount], index) => {
          const amountValue = parseFloat(amount);
          const bgWidth = (amountValue / maxBidAmount) * 100;
          return (
            <div key={index} className="relative">
              <div
                className="absolute left-0 top-0 h-full bg-[#ff5e5a] opacity-20"
                style={{ width: `${bgWidth + 39}%` }}
              ></div>
              <div className="flex justify-between  relative">
                <span className="text-[#863936]">
                  {parseFloat(price).toFixed(2)}
                </span>
                <span className="text-gray-400">{amountValue.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OrderBook.propTypes = {
  selectedPair: PropTypes.string.isRequired,
};

export default OrderBook;
