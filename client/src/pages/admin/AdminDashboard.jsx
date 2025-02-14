import { useState, useEffect } from "react";
import { Card} from "@material-tailwind/react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/transactions"
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-8 text-white">
      
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-lg bg-[#2A2A2A] text-gray-500 p-6 hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold mb-2 text-white">
            User Management
          </h2>
          <p>View, Analyze, Block any user seamlesy and effectively</p>
          <Link to={"/admin/users/manage"}>
            <p className="text-blue-500 hover:underline cursor-pointer">
              Manage User Here
            </p>
          </Link>
        </Card>
        <Card className="rounded-lg bg-[#2A2A2A] text-gray-500 p-6 hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold mb-2 text-white">
            Transaction Approval
          </h2>
          <p>Approve or Deny any Deposit or Withdraw Transaction seamlesy and effectively</p>
          <Link to={"/admin/transaction/manage"}>
            <p className="text-blue-500 hover:underline cursor-pointer">
              Transaction Management
            </p>
          </Link>
        </Card>
        <Card className="rounded-lg bg-[#2A2A2A] text-gray-500 p-6 hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold mb-2 text-white">
            System Logs
          </h2>
          <p>View, Analyze, Block any user seamlesy and effectively</p>
          <Link to={"/admin/users/manage"}>
            <p className="text-blue-500 hover:underline cursor-pointer">
              Manage User Here
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
