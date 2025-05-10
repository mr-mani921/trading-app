import React, { useState, useEffect } from "react";
import TradingChart from "../components/trade/TradingChart";
import OrderBook from "../components/trade/OrderBook";
import PerpetualOrderForm from "../components/trade/PerpetualOrderForm";
import API from "../utils/api";
import { fetchMarketData } from "../store/slices/marketSlice";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import io from "socket.io-client";
import AnimatedHeading from "../components/animation/AnimateHeading";
import OpenPerpetualPositions from "../components/trade/OpenPerpetualPositions";
import OrdersRecord from "../components/trade/OrdersRecord";
const socket = io(import.meta.env.VITE_API_URL);

const PerpetualTrade = () => {
  const [marketData, setMarketData] = useState([]);
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1h");
  const { openPositions } = useSelector((state) => state.futures);
  const showChart = useSelector((state) => state.global.showChart);
  const dispatch = useDispatch();
  const tradingPairs = [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "MATICUSDT",
    "DOTUSDT",
    "LTCUSDT",
  ];
  const formatTradingPair = (pair) => {
    if (pair.length <= 4) return pair; // Handle edge cases (e.g., "USDT")

    const index = pair.length - 4; // Find the index where "/" should be inserted

    return `${pair.slice(0, index)}/${pair.slice(index)}`; // Insert "/" before "USDT"
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.us/api/v3/klines?symbol=${selectedPair}&interval=${selectedInterval}`
        );
        const data = await response.json();

        const formattedData = data.map((candle) => ({
          time: Math.floor(candle[0] / 1000),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }));

        setMarketData(formattedData);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);

    return () => clearInterval(interval);
  }, [selectedPair, selectedInterval]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.us:9443/ws/${selectedPair.toLowerCase()}@kline_${selectedInterval}`
    );

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const kline = response.k;
      const newCandle = {
        time: Math.floor(kline.t / 1000),
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
      };

      setMarketData((prevData) => [...prevData, newCandle]);
    };

    return () => ws.close();
  }, [selectedPair, selectedInterval]);

  const currentMarketPrice =
    marketData.length > 0 ? marketData[marketData.length - 1].close : 0;

  return (
    <div className="min-h-screen max-w-7xl mx-auto md:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between md:px-0 px-4">
          <AnimatedHeading>
            <h3 className="text-2xl font-semibold text-white">
              Perpetual Trading
            </h3>
          </AnimatedHeading>
          <div className="md:hidden">
            <select
              id="tradingPair"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-black text-tertiary3 p-2 focus:outline-none"
            >
              {tradingPairs.map((pair, index) => (
                <option key={index} value={pair}>
                  {formatTradingPair(pair)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div
            className={`w-full lg:w-3/5 bg-transparent border-y border-[#2f2f2f] lg:border-r md:p-4 ${
              !showChart ? "hidden md:block" : ""
            }`}
          >
            <div>
              <TradingChart
                marketData={marketData}
                onPairChange={setSelectedPair}
                indicators={["volume", "macd", "rsi"]}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                setSelectedPair={setSelectedPair}
                selectedPair={selectedPair}
                tradingPairs={tradingPairs}
              />
            </div>
          </div>
          <div className="flex flex-row-reverse  lg:flex-row w-full lg:w-2/5 bg-[#0f0f0f] md:bg-transparent">
            <div className="w-1/2 bg-transparent md:border border-[#2f2f2f] p-4">
              <OrderBook selectedPair={selectedPair} />
            </div>
            <div className="w-1/2 bg-transparent md:border border-[#2f2f2f] md:p-4">
              <PerpetualOrderForm
                selectedPair={selectedPair}
                marketPrice={currentMarketPrice}
              />
            </div>
          </div>
        </div>
        <div className="bg-[#0f0f0f] md:bg-transparent h-full mb-4">
          <OrdersRecord type={"perpetual"} marketData={marketData} />
        </div>
      </motion.div>
    </div>
  );
};

export default PerpetualTrade;
