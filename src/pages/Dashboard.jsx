import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  Truck,
  Scale,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import supabase from "../SupabaseClient";

const Dashboard = () => {
  const { user } = useAuthStore();

  // State for dashboard data
  const [totalSauda, setTotalSauda] = useState(0);
  const [saudaQuantity, setSaudaQuantity] = useState(0);
  const [gateInCount, setGateInCount] = useState(0);
  const [pendingSum, setPendingSum] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [delayedData, setDelayedData] = useState([]);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [logisticsStatusData, setLogisticsStatusData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [logisticsFilter, setLogisticsFilter] = useState({
    month: "",
    year: "",
  });

  // Fetch all data from Supabase
  const fetchSupabaseData = async () => {
    try {
      setLoading(true);

      // Run all queries in parallel for better performance
      const [
        countResult, 
        sumResult, 
        gateInResult, 
        pendingResult, 
        deliveredResult, 
        statusResult,
        recentTransactionsResult,
        delayedDataResult,
        orderInvoiceResult
      ] = await Promise.all([
        supabase.from("saudaform").select('*', { count: 'exact', head: true }),
        supabase.from("saudaform").select('order_quantity_ton'),
        supabase.from("order_invoice")
          .select('*', { count: 'exact', head: true })
          .not('planned1', 'is', null)
          .is('actual1', null),
        supabase.from("saudaform").select('order_cancel_qty'),
        supabase.from("saudaform")
          .select('total_dispatch_qty', { count: 'exact', head: true })
          .not('total_dispatch_qty', 'is', null),
        supabase.from("saudaform").select('order_status'),
        supabase.from("saudaform")
          .select('date_of_sauda, broker_name, rate, pending_qty')
          .order('date_of_sauda', { ascending: false })
          .limit(10),
        supabase.from("vehicle_report")
          .select('order_no, vehicle_no, brand_name, tyre_weight_update, get_loading_first, get_loading_second, update_the_final_weight, make_invoice')
          .not('order_no', 'is', null)
          .order('timestamp', { ascending: false }),
        supabase.from("order_invoice")
          .select('timestamp, planned1, actual3')
          .order('timestamp', { ascending: false })
      ]);

      // Process all the results
      setTotalSauda(countResult.count || 0);
      
      const totalQuantity = sumResult.data ? 
        sumResult.data.reduce((sum, row) => sum + (parseFloat(row.order_quantity_ton) || 0), 0) : 0;
      setSaudaQuantity(totalQuantity);
      
      setGateInCount(gateInResult.count || 0);
      
      const totalPending = pendingResult.data ? 
        pendingResult.data.reduce((sum, row) => sum + (parseFloat(row.order_cancel_qty) || 0), 0) : 0;
      setPendingSum(totalPending);
      
      setTotalDelivered(deliveredResult.count || 0);

      // Process order status data
      if (statusResult.data && !statusResult.error) {
        const statusData = statusResult.data.filter(
          (row) => row && row.order_status && row.order_status !== "" && row.order_status !== null
        );
        
        const completeCount = statusData.filter(
          (row) => row.order_status.toString().toLowerCase() === "complete"
        ).length;
        
        const pendingCount = statusData.filter(
          (row) => row.order_status.toString().toLowerCase() === "pending"
        ).length;

        const totalStatus = completeCount + pendingCount;

        const orderStatusData = [
          {
            name: "Pending",
            value: totalStatus > 0 ? Math.round((pendingCount / totalStatus) * 100) : 0,
            color: "#F59E0B",
          },
          {
            name: "Completed",
            value: totalStatus > 0 ? Math.round((completeCount / totalStatus) * 100) : 0,
            color: "#10B981",
          },
        ];
        
        setOrderStatusData(orderStatusData);
      }

      // Process recent transactions data
      if (recentTransactionsResult.data && !recentTransactionsResult.error) {
        const formattedTransactions = recentTransactionsResult.data
          .filter((row) => row && (
            row.date_of_sauda || 
            row.broker_name || 
            row.rate || 
            row.pending_qty
          ))
          .map((row) => {
            let dateStr = "";
            if (row.date_of_sauda) {
              const rawDate = new Date(row.date_of_sauda);
              if (!isNaN(rawDate.getTime())) {
                const day = String(rawDate.getDate()).padStart(2, "0");
                const month = String(rawDate.getMonth() + 1).padStart(2, "0");
                const year = rawDate.getFullYear();
                dateStr = `${day}/${month}/${year}`;
              } else {
                dateStr = row.date_of_sauda.toString();
              }
            }

            return {
              dateOfSauda: dateStr || "",
              brokerName: row.broker_name || "",
              rate: row.rate || "",
              pendingQty: row.pending_qty || "",
            };
          });

        setRecentTransactions(formattedTransactions);
      }

      // Process delayed data from vehicle_report
      if (delayedDataResult.data && !delayedDataResult.error) {
        const formattedDelayedData = delayedDataResult.data
          .filter((row) => row && (
            row.order_no || 
            row.vehicle_no || 
            row.brand_name
          ))
          .map((row) => {
            // Build stage string based on completed stages
            const stages = [];
            
            if (row.tyre_weight_update && row.tyre_weight_update !== "" && row.tyre_weight_update !== null) {
              stages.push("Tyre Weight Update");
            }
            
            if (row.get_loading_first && row.get_loading_first !== "" && row.get_loading_first !== null) {
              stages.push("Get Loading First");
            }
            
            if (row.get_loading_second && row.get_loading_second !== "" && row.get_loading_second !== null) {
              stages.push("Get Loading Second");
            }
            
            if (row.update_the_final_weight && row.update_the_final_weight !== "" && row.update_the_final_weight !== null) {
              stages.push("Update The Final Weight");
            }
            
            if (row.make_invoice && row.make_invoice !== "" && row.make_invoice !== null) {
              stages.push("Make Invoice");
            }

            // Join stages with comma, or show "No Stage Completed" if empty
            const stage = stages.length > 0 ? stages.join(", ") : "No Stage Completed";

            return {
              orderNo: row.order_no || "",
              vehicleNo: row.vehicle_no || "",
              brand: row.brand_name || "",
              stage: stage,
            };
          });

        setDelayedData(formattedDelayedData);
      } else {
        console.log("Delayed data query error:", delayedDataResult.error);
        setDelayedData([]);
      }

      // Process logistics status data from order_invoice
      if (orderInvoiceResult.data && !orderInvoiceResult.error) {
        const processedLogisticsData = processLogisticsStatusData(orderInvoiceResult.data);
        setLogisticsStatusData(processedLogisticsData);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setTotalSauda(0);
      setSaudaQuantity(0);
      setGateInCount(0);
      setPendingSum(0);
      setTotalDelivered(0);
      setRecentTransactions([]);
      setDelayedData([]);
      setOrderStatusData([
        { name: "Pending", value: 0, color: "#F59E0B" },
        { name: "Completed", value: 0, color: "#10B981" }
      ]);
      setLogisticsStatusData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process logistics status data for the graph - FIXED VERSION
  const processLogisticsStatusData = (orderInvoiceData) => {
    if (!orderInvoiceData || orderInvoiceData.length === 0) {
      console.log("No order invoice data to process for logistics");
      return [];
    }

    const statusByDate = {};

    orderInvoiceData.forEach((row) => {
      if (!row) return;

      try {
        // Use timestamp field for grouping by day
        const timestamp = row.timestamp;
        if (!timestamp) return;

        const planned1 = row.planned1;
        const actual3 = row.actual3;

        // Skip records without planned1 or actual3
        if (!planned1 || !actual3) return;

        // Parse the date from timestamp for grouping
        const dateObj = new Date(timestamp);
        if (isNaN(dateObj.getTime())) return;

        // Format date for display (e.g., "Jan 1")
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        // Create date key for grouping (YYYY-MM-DD format)
        const dateKey = dateObj.toISOString().split('T')[0];

        if (!statusByDate[dateKey]) {
          statusByDate[dateKey] = {
            date: formattedDate,
            fullDate: dateKey, // For filtering by month/year
            onTime: 0,
            delay: 0,
          };
        }

        // Convert to timestamps for comparison
        const plannedTime = new Date(planned1).getTime();
        const actualTime = new Date(actual3).getTime();

        // Categorize based on your logic
        if (actualTime <= plannedTime) {
          statusByDate[dateKey].onTime++;
        } else {
          statusByDate[dateKey].delay++;
        }
      } catch (e) {
        console.error("Error processing logistics row:", e, row);
      }
    });

    // Convert to array and sort by date
    const result = Object.values(statusByDate)
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(-30); // Show last 30 days for better visualization

    console.log("Processed logistics data:", result);
    return result.length > 0 ? result : [];
  };

  // Get available years from logistics data
  const getAvailableYears = () => {
    if (!logisticsStatusData || logisticsStatusData.length === 0) return [];

    const years = new Set();

    logisticsStatusData.forEach(item => {
      try {
        if (item.fullDate) {
          const year = item.fullDate.split('-')[0];
          years.add(year);
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  };

  // Get available months from logistics data
  const getAvailableMonths = () => {
    const months = [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];

    return months;
  };

  // Filter logistics data based on selected month and year
  const getFilteredLogisticsData = () => {
    if (!logisticsStatusData || logisticsStatusData.length === 0) return [];

    return logisticsStatusData.filter(item => {
      try {
        if (!item.fullDate) return false;

        const [year, month] = item.fullDate.split('-');

        if (logisticsFilter.month && month !== logisticsFilter.month) return false;
        if (logisticsFilter.year && year !== logisticsFilter.year) return false;

        return true;
      } catch (e) {
        return false;
      }
    });
  };

  // Custom tooltip for logistics chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-green-600">On Time: {payload[0]?.value || 0}</p>
          <p className="text-red-600">Delay: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  const handleLogisticsFilterChange = (filterType, value) => {
    setLogisticsFilter(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Transaction Card Component for Mobile
  const TransactionCard = ({ transaction, index }) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium text-gray-500">Date:</span>
          <p className="text-gray-800">{transaction.dateOfSauda}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Broker:</span>
          <p className="text-gray-800">{transaction.brokerName}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Rate:</span>
          <p className="text-gray-800">{transaction.rate}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Pending Qty:</span>
          <p className="text-gray-800">{transaction.pendingQty}</p>
        </div>
      </div>
    </div>
  );

  // Delayed Card Component for Mobile
  const DelayedCard = ({ delayedItem, index }) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium text-gray-500">Order No:</span>
          <p className="text-gray-800">{delayedItem.orderNo}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Vehicle No:</span>
          <p className="text-gray-800">{delayedItem.vehicleNo}</p>
        </div>
        <div>
          <span className="font-medium text-gray-500">Brand:</span>
          <p className="text-gray-800">{delayedItem.brand}</p>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-500">Stage:</span>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {delayedItem.stage || "No Stage Info"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard {user?.role !== "admin" && "(My Data)"}
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow p-4 md:p-6 flex items-start">
          <div className="p-2 md:p-3 rounded-full bg-blue-100 mr-3 md:mr-4">
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Sauda Quantity</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : Math.floor(saudaQuantity).toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 md:p-6 flex items-start">
          <div className="p-2 md:p-3 rounded-full bg-green-100 mr-3 md:mr-4">
            <Truck size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">DO Generated</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : totalSauda}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 md:p-6 flex items-start">
          <div className="p-2 md:p-3 rounded-full bg-purple-100 mr-3 md:mr-4">
            <Scale size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Gate In</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : gateInCount}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 md:p-6 flex items-start">
          <div className="p-2 md:p-3 rounded-full bg-amber-100 mr-3 md:mr-4">
            <Receipt size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Pending</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : Math.floor(pendingSum).toFixed(2)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 md:p-6 flex items-start">
          <div className="p-2 md:p-3 rounded-full bg-amber-100 mr-3 md:mr-4">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Total Delivered</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? "..." : totalDelivered}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
            <Package size={20} className="mr-2 text-indigo-600" />
            Order Status Tracking
          </h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Truck size={20} className="mr-2 text-indigo-600" />
              Logistics Status Overview
            </h2>
            <div className="flex items-center space-x-2">
              <select
                value={logisticsFilter.month}
                onChange={(e) => handleLogisticsFilterChange("month", e.target.value)}
                className="px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Months</option>
                {getAvailableMonths().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={logisticsFilter.year}
                onChange={(e) => handleLogisticsFilterChange("year", e.target.value)}
                className="px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Years</option>
                {getAvailableYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-64 md:h-80">
            {getFilteredLogisticsData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getFilteredLogisticsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar 
                    dataKey="onTime" 
                    name="On Time" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar 
                    dataKey="delay" 
                    name="Delay" 
                    fill="#EF4444" 
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm md:text-base">
                No logistics data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions - Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={20} className="mr-2 text-indigo-600" />
            Recent Transactions
          </h2>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Sauda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broker Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.dateOfSauda}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.brokerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.pendingQty}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <TransactionCard key={index} transaction={transaction} index={index} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No data available</div>
          )}
        </div>
      </div>

      {/* Delayed Table - Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <AlertTriangle size={20} className="mr-2 text-red-600" />
            Delayed
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : delayedData.length > 0 ? (
                delayedData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.orderNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.vehicleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.stage || "No Stage Info"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No delayed data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : delayedData.length > 0 ? (
            delayedData.map((delayedItem, index) => (
              <DelayedCard key={index} delayedItem={delayedItem} index={index} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No delayed data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;