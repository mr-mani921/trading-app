import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
  FaSyncAlt,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import {
  fetchExchangeRate,
  getWallet,
  swapAssets,
  transferFunds,
} from "../../store/slices/assetsSlice";
import {
  Card,
  CardBody,
  Dialog,
  DialogBody,
  DialogHeader,
} from "@material-tailwind/react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import Loader from "../../components/layout/Loader";
import API from "../../utils/api";
import Assets from "../../components/wallet/Assets";

const validPairs = {
  USDT: ["ETH", "BTC", "BNB", "ADA", "SOL", "XRP", "DOT"],
  ETH: ["USDT", "BTC", "BNB", "ADA", "SOL", "XRP", "DOT"],
  BTC: ["USDT", "ETH", "BNB", "ADA", "SOL", "XRP", "DOT"],
  BNB: ["USDT", "ETH", "BTC", "ADA", "SOL", "XRP", "DOT"],
  ADA: ["USDT", "ETH", "BTC", "BNB", "SOL", "XRP", "DOT"],
  SOL: ["USDT", "ETH", "BTC", "BNB", "ADA", "XRP", "DOT"],
  XRP: ["USDT", "ETH", "BTC", "BNB", "ADA", "SOL", "DOT"],
  DOT: ["USDT", "ETH", "BTC", "BNB", "ADA", "SOL", "XRP"],
};
const Wallet = () => {
  const [open, setOpen] = useState(false);
  const [fromAsset, setFromAsset] = useState("");
  const [toAsset, setToAsset] = useState("ETH");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(1);
  const { wallet, status, error, exchangeRate } = useSelector(
    (state) => state.assets
  );

  // Handle Fund Transfer
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [showAssets, setShowAssets] = useState(false);
  const [assetsType, setAssetsType] = useState("");

  useEffect(() => {
    dispatch(getWallet());
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(getWallet());
    }, 10000);

    dispatch(fetchExchangeRate({ fromAsset, toAsset }));
    return () => clearInterval(interval);
  }, [dispatch, fromAsset, toAsset]);
  useEffect(() => {
    setShowAssets(false);
  }, []);
  useEffect(() => {
    if (fromAsset && validPairs[fromAsset]) {
      // Reset 'toAsset' to the first valid option if the current 'toAsset' is invalid
      if (!validPairs[fromAsset].includes(toAsset)) {
        setToAsset(validPairs[fromAsset][0]);
      }
    }
  }, [fromAsset, toAsset]);

  const handleSwap = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    dispatch(fetchExchangeRate({ fromAsset, toAsset }));
    try {
      dispatch(
        swapAssets({ fromAsset, toAsset, amount, exchangeRate })
      ).unwrap();
      setOpen(false);
    } catch (error) {
      setOpen(false);
    }
  };

  // Fund Transfer Handler
  const handleTransfer = async () => {
    if (!transferAmount || !fromWallet || !toWallet) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await dispatch(
        transferFunds({ fromWallet, toWallet, amount: transferAmount })
      ).unwrap();
      setTransferOpen(false);

      // Reset fields after successful transfer
      setFromWallet("");
      setToWallet("");
      setTransferAmount("");
    } catch (error) {
      setTransferOpen(false);
    }
  };

  const handleAssetsRendering = (type) => {
    setAssetsType(type);
    setShowAssets(true);
  };
  return (
    <div className="min-h-[100vh] mx-auto md:px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="hidden md:block">
          <h1 className="text-4xl font-bold text-white mb-6">My Wallet</h1>

          {/* Total Balance Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-[#242424] p-6 rounded-lg mb-6">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Exchange Balance
              </h2>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-white">
                    ${wallet?.exchangeWallet?.toFixed(2) || "0.00"}{" "}
                    <span className="text-gray-400 text-sm">USDT</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#242424] p-6 rounded-lg mb-6">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Spot Asset
              </h2>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-white">
                    ${wallet?.spotWallet?.toFixed(2) || "0.00"}{" "}
                    <span className="text-gray-400 text-sm">USDT</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#242424] p-6 rounded-lg mb-6">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Futures Asset
              </h2>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-white">
                    ${wallet?.futuresWallet?.toFixed(2) || "0.00"}{" "}
                    <span className="text-gray-400 text-sm">USDT</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#242424] p-6 rounded-lg mb-6">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Perpetual Asset
              </h2>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-white">
                    ${wallet?.perpetualsWallet?.toFixed(2) || "0.00"}{" "}
                    <span className="text-gray-400 text-sm">USDT</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => navigate("/wallet/deposit")}
              className="btn bg-[#1E90FF] px-4 py-2 text-white rounded-md hover:bg-[#1C86EE] transition duration-300"
            >
              Deposit
            </button>
            <button
              onClick={() => navigate("/wallet/withdraw")}
              className="btn bg-[#D32F2F] px-4 py-2 text-white rounded-md hover:bg-[#C62828] transition duration-300"
            >
              Withdraw
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setOpen(true)}
            >
              Swap
            </button>
            <button
              className="bg-[#f78667] text-white px-4 py-2 rounded hover:bg-[#EA6A47] transition"
              onClick={() => setTransferOpen(true)}
            >
              Transfer
            </button>
          </div>

          {/* Holdings Section */}
          <Card className="bg-[#242424] p-6 rounded-lg mb-6">
            <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
              Your Holdings
            </h2>
            <CardBody>
              {wallet?.holdings?.length > 0 ? (
                <table className="w-full text-left text-white">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="py-2">Asset</th>
                      <th className="py-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.holdings.map((holding, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-gray-800 transition duration-300"
                      >
                        <td className="py-2">{holding.asset}</td>
                        <td className="py-2">{holding.quantity}</td>
                        {/* <td className="py-2">${holding.value.toFixed(2)}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No assets found in your wallet.</p>
              )}
            </CardBody>
          </Card>

          {/* Deposit & Withdrawal History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deposit History */}
            <Card className="bg-[#242424] p-6 rounded-lg">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Deposit History
              </h2>
              <CardBody>
                {wallet?.depositHistory?.length > 0 ? (
                  <ul className="text-white">
                    {wallet.depositHistory.map((tx, index) => (
                      <li
                        key={index}
                        className="flex justify-between py-2 border-b border-gray-700 hover:bg-gray-800 transition duration-300"
                      >
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                        <span>{tx.currency}</span>
                        <span className="text-green-500">
                          <AiOutlineArrowDown className="inline-block" /> $
                          {tx.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No deposits yet.</p>
                )}
              </CardBody>
            </Card>

            {/* Withdrawal History */}
            <Card className="bg-[#242424] p-6 rounded-lg">
              <h2 className="bg-transparent text-lg font-semibold text-[#00FF7F]">
                Withdrawal History
              </h2>
              <CardBody>
                {wallet?.withdrawalHistory?.length > 0 ? (
                  <ul className="text-white">
                    {wallet.withdrawalHistory.map((tx, index) => (
                      <li
                        key={index}
                        className="flex justify-between py-2 border-b border-gray-700 hover:bg-gray-800 transition duration-300"
                      >
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                        <span className="text-red-500">
                          <AiOutlineArrowUp className="inline-block" /> $
                          {tx.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No withdrawals yet.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
        {/* for mobile screens */}
        <div className="md:hidden bg-darkGray min-h-screen p-4 text-lightGray">
          {/* My Assets */}
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-2">My assets</h2>
            <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-md">
              <p className="text-lg">
                {showAssets ? "Total Assets" : " Exchange Balance"}
              </p>
              <p className="text-3xl font-bold">
                ${wallet?.exchangeWallet?.toFixed(2) || "0.00"}{" "}
                <span className="text-sm">USDT</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between my-4">
              <button
                className="flex flex-col items-center p-2 hover:text-electricBlue transition"
                onClick={() => navigate("/wallet/withdraw")}
              >
                <FaArrowUp size={20} />
                Withdraw
              </button>
              <button
                className="flex flex-col items-center p-2 hover:text-electricBlue transition"
                onClick={() => navigate("/wallet/deposit")}
              >
                <FaArrowDown size={20} />
                Deposit
              </button>

              <button
                className="flex flex-col items-center p-2 hover:text-electricBlue transition"
                onClick={() => setOpen(true)}
              >
                <FaSyncAlt size={20} />
                Swap
              </button>
              <button
                className="flex flex-col items-center p-2 hover:text-electricBlue transition"
                onClick={() => setTransferOpen(true)}
              >
                <FaExchangeAlt size={20} />
                Transfer
              </button>
            </div>
          </div>

          {/* My wallets Section */}
          {showAssets ? (
            <Assets type={assetsType} />
          ) : (
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-semibold mb-2">My account</h2>
              <div className="space-y-2">
                <div
                  className="bg-transparent border-[.1px] border-[#393939] p-4 rounded-2xl shadow-md hover:bg-gray-700 transition cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    handleAssetsRendering("spot");
                  }}
                >
                  <div>
                    <p className="text-lg"> Spot Asset</p>
                    <p className="text-2xl font-bold">
                      ${wallet?.spotWallet?.toFixed(2) || "0.00"}{" "}
                      <span className="text-sm">USDT</span>
                    </p>
                  </div>
                  <div className="text-3xl">
                    <IoIosArrowForward />
                  </div>
                </div>
                <div
                  className="bg-transparent border-[.1px] border-[#393939] p-4 rounded-2xl shadow-md hover:bg-gray-700 transition cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    handleAssetsRendering("futures");
                  }}
                >
                  <div>
                    <p className="text-lg"> Futures Asset</p>
                    <p className="text-2xl font-bold">
                      ${wallet?.futuresWallet?.toFixed(2) || "0.00"}{" "}
                      <span className="text-sm">USDT</span>
                    </p>
                  </div>
                  <div className="text-3xl">
                    <IoIosArrowForward />
                  </div>
                </div>
                <div
                  className="bg-transparent border-[.1px] border-[#393939] p-4 rounded-2xl shadow-md hover:bg-gray-700 transition cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    handleAssetsRendering("perpetuals");
                  }}
                >
                  <div>
                    <p className="text-lg"> Perpetual Asset</p>
                    <p className="text-2xl font-bold">
                      ${wallet?.perpetualsWallet?.toFixed(2) || "0.00"}{" "}
                      <span className="text-sm">USDT</span>
                    </p>
                  </div>
                  <div className="text-3xl">
                    <IoIosArrowForward />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Swap Funds */}
        <Dialog open={open} handler={() => setOpen(false)} size="sm">
          <DialogHeader className="text-white bg-gray-900 flex justify-between">
            <span>Swap</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </DialogHeader>
          <DialogBody className="bg-gray-900 text-white p-6">
            {/* From Currency */}
            <div className="mb-4">
              <label className="block mb-1">From</label>
              <select
                className="w-full bg-gray-800 p-2 rounded"
                value={fromAsset}
                onChange={(e) => setFromAsset(e.target.value)}
              >
                <option value="" disabled>
                  Select a Currency
                </option>
                {Object.keys(validPairs).map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </div>

            {/* To Currency */}
            <div className="mb-4">
              <label className="block mb-1">To</label>
              <select
                className="w-full bg-gray-800 p-2 rounded"
                value={toAsset}
                onChange={(e) => setToAsset(e.target.value)}
                disabled={!fromAsset} // Disable if 'fromAsset' is not selected
              >
                <option value="" disabled>
                  Select a Currency
                </option>
                {validPairs[fromAsset]?.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block mb-1">Exchange Amount</label>
              <input
                type="number"
                className="w-full bg-gray-800 p-2 rounded"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Exchange Rate Display */}
            <p className="text-sm mb-4">
              Current Exchange Rate: {amount} {fromAsset} ={" "}
              {amount * exchangeRate} {toAsset}
            </p>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="bg-blue-500 w-full py-2 rounded"
            >
              Exchange
            </button>
          </DialogBody>
        </Dialog>
        {/* Transfer Funds */}
        <Dialog
          open={transferOpen}
          handler={() => setTransferOpen(false)}
          size="sm"
        >
          <DialogHeader className="text-white bg-gray-900 flex justify-between">
            <span>Transfer Funds</span>
            <button onClick={() => setTransferOpen(false)}>✖</button>
          </DialogHeader>
          <DialogBody className="bg-gray-900 text-white p-6">
            {/* From Wallet (Dropdown) */}
            <div className="mb-4">
              <label className="block mb-1">From Wallet</label>
              <select
                className="w-full bg-gray-800 p-2 rounded"
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
              >
                <option value="" disabled>
                  Select Wallet
                </option>
                {/* Default empty option */}
                <option value="exchangeWallet">Exchange Wallet</option>
                <option value="spotWallet">Spot Wallet</option>
                <option value="futuresWallet">Futures Wallet</option>
                <option value="perpetualsWallet">Perpetual Wallet</option>
              </select>
            </div>

            {/* To Wallet (Dropdown) */}
            <div className="mb-4">
              <label className="block mb-1">To Wallet</label>
              <select
                className="w-full bg-gray-800 p-2 rounded"
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
              >
                <option value="" disabled>
                  Select Wallet
                </option>{" "}
                {/* Default empty option */}
                <option value="exchangeWallet">Exchange Wallet</option>
                <option value="spotWallet">Spot Wallet</option>
                <option value="futuresWallet">Futures Wallet</option>
                <option value="perpetualsWallet">Perpetual Wallet</option>
              </select>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block mb-1">Amount</label>
              <input
                type="number"
                className="w-full bg-gray-800 p-2 rounded"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              className="bg-blue-500 w-full py-2 rounded"
            >
              Transfer Funds
            </button>
          </DialogBody>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Wallet;
