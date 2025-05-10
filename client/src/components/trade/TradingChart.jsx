import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";

const TradingChart = ({
  selectedPair,
  selectedInterval,
  setSelectedPair,
  setSelectedInterval,
  tradingPairs,
}) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null); // WebSocket reference
  const [marketData, setMarketData] = useState([]);
  const [ohlc, setOhlc] = useState(null);
  const [savedRange, setSavedRange] = useState(null); // Define savedRange state

  const timeIntervals = ["1m", "5m", "15m", "1h", "1d"];

  const formatTradingPair = (pair) => {
    if (pair.length <= 4) return pair; // Handle edge cases (e.g., "USDT")

    const index = pair.length - 4; // Find the index where "/" should be inserted

    return `${pair.slice(0, index)}/${pair.slice(index)}`; // Insert "/" before "USDT"
  };

  // Function to fetch historical market data (initial chart load)
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
      candleSeriesRef.current.setData(formattedData);
    } catch (error) {
      console.error("Error fetching historical market data:", error);
    }
  };

  // Initialize chart on first render
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartInstance.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: "transparent" }, textColor: "#EAEAEA" },
      grid: {
        vertLines: { color: "#333333" },
        horzLines: { color: "#333333" },
      },
    });

    candleSeriesRef.current = chartInstance.current.addSeries(
      CandlestickSeries,
      {
        upColor: "#00C853",
        downColor: "#D32F2F",
        borderUpColor: "#00C853",
        borderDownColor: "#D32F2F",
        wickUpColor: "#00C853",
        wickDownColor: "#D32F2F",
      }
    );

    fetchMarketData(); // Fetch historical data on mount
    // Subscribe to visible range changes to save the current zoom level
    chartInstance.current
      .timeScale()
      .subscribeVisibleLogicalRangeChange((range) => {
        setSavedRange(range);
      });

    // Track mouse move on chart to update OHLC values
    chartInstance.current.subscribeCrosshairMove((param) => {
      if (!param || !param.seriesData || !candleSeriesRef.current) return;
      const data = param.seriesData.get(candleSeriesRef.current);
      if (data) {
        setOhlc(data);
      }
    });

    // Handle chart resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      chartInstance.current.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch new market data when pair or interval changes
  useEffect(() => {
    if (!chartInstance.current) return;

    fetchMarketData();
  }, [selectedPair, selectedInterval]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (wsRef.current) wsRef.current.close(); // Close previous WebSocket connection

    const ws = new WebSocket(
      `wss://stream.binance.us:9443/ws/${selectedPair.toLowerCase()}@kline_${selectedInterval}`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const kline = response.k;

      if (!kline) return;

      const newCandle = {
        time: Math.floor(kline.t / 1000),
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
      };

      candleSeriesRef.current.update(newCandle); // Real-time update
    };

    ws.onclose = () => console.log("WebSocket closed");
    return () => ws.close(); // Cleanup WebSocket on unmount
  }, [selectedPair, selectedInterval]);

  return (
    <div>
      <div className="md:flex justify-between items-center border-b-[.3px] border-[#00c853] hidden md:block">
        <div className=" flex gap-4 w-fit">
          <div>
            <select
              id="tradingPair"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-black text-tertiary3 p-2 border-r-[.3px] border-[#00c853] focus:outline-none"
            >
              {tradingPairs?.map((pair, index) => (
                <option key={index} value={pair}>
                  {formatTradingPair(pair)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {ohlc && (
          <div className="w-full py-1 flex justify-evenly">
            <p className="flex flex-col text-[.8rem] ">
              {" "}
              <span className="text-gray-600 text-[.7rem]">24H Open</span>{" "}
              {ohlc.open}
            </p>
            <p className="flex flex-col text-[.8rem] ">
              {" "}
              <span className="text-gray-600 text-[.7rem]">24H High</span>{" "}
              {ohlc.high}
            </p>
            <p className="flex flex-col text-[.8rem] ">
              <span className="text-gray-600 text-[.7rem]">24H Low</span>
              {ohlc.low}
            </p>
            <p className="flex flex-col text-[.8rem] ">
              <span className="text-gray-600 text-[.7rem]">24H Close</span>
              {ohlc.close}
            </p>
          </div>
        )}
      </div>
      <div className="w-full text-gray-400 border-b-[.3px] border-gray-600 ">
        <h3>Chart</h3>
      </div>
      <div className="flex justify-evenly border-b-[.3px] border-gray-600 ">
        {timeIntervals.map((timeInterval, index) => (
          <p
            key={index}
            onClick={() => setSelectedInterval(timeInterval)}
            className={`btn cursor-pointer ${
              selectedInterval === timeInterval
                ? "text-primary"
                : "text-gray-600"
            }`}
          >
            {timeInterval}
          </p>
        ))}
      </div>
      {ohlc && (
        <div className="w-full py-1 flex justify-evenly">
          <p className="text-secondary font-semibold text-[.8rem] ">
            <span className="text-gray-600 text-[.7rem]">O: </span> {ohlc.open}
          </p>
          <p className="text-secondary font-semibold text-[.8rem] ">
            <span className="text-gray-600 text-[.7rem]">H: </span> {ohlc.high}
          </p>
          <p className="text-secondary font-semibold text-[.8rem] ">
            <span className="text-gray-600 text-[.7rem]">L: </span>
            {ohlc.low}
          </p>
          <p className="text-secondary font-semibold text-[.8rem] ">
            <span className="text-gray-600 text-[.7rem]">C: </span>
            {ohlc.close}
          </p>
        </div>
      )}

      <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
    </div>
  );
};

export default TradingChart;
