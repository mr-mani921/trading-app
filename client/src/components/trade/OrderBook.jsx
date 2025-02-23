import { useEffect, useState, useRef } from "react";

const OrderBook = ({ selectedPair }) => {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedPair.toLowerCase()}@depth`
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
    ...bids.map(([_, amount]) => parseFloat(amount)),
    1
  );
  const maxAskAmount = Math.max(
    ...asks.map(([_, amount]) => parseFloat(amount)),
    1
  );

  return (
    <div className="w-full p-4">
      <h3 className="text-sm text-secondary font-semibold text-center">
        Order Book
      </h3>

      {/* Large Screen View */}
      <table className="hidden sm:table w-full text-[.7rem]">
        <thead>
          <tr className="border-b border-gray-600 text-gray-500 w-full">
            <th className="text-left p-2 w-1/3">Price (USDT)</th>
            <th className="text-left p-2 w-1/3">Amount (BTC)</th>
            <th className="text-left p-2 w-1/3">Total (USDT)</th>
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
      <div className="sm:hidden flex flex-col gap-1 text-lg">
        {[...asks].reverse().map(([price, amount], index) => {
          const amountValue = parseFloat(amount);
          const bgWidth = (amountValue / maxAskAmount) * 100;
          return (
            <div key={index} className="relative">
              <div
                className="absolute left-0 top-0 h-full bg-green-500 opacity-20"
                style={{ width: `${bgWidth + 39}%` }}
              ></div>
              <div className="flex justify-between text-crimsonRed relative">
                <span className="text-green-400">
                  {parseFloat(price).toFixed(2)}
                </span>
                <span className="text-gray-400">{amountValue.toFixed(2)}</span>
              </div>
            </div>
          );
        })}

        <div className="text-center font-bold text-red-500 py-1">
          {asks.length > 0 ? parseFloat(asks[0][0]).toFixed(2) : "N/A"}
        </div>

        {bids.map(([price, amount], index) => {
          const amountValue = parseFloat(amount);
          const bgWidth = (amountValue / maxBidAmount) * 100;
          return (
            <div key={index} className="relative">
              <div
                className="absolute left-0 top-0 h-full bg-red-500 opacity-20"
                style={{ width: `${bgWidth + 39}%` }}
              ></div>
              <div className="flex justify-between  relative">
                <span className="text-red-400">
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

export default OrderBook;
