import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useDataStore from "../store/dataStore";
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
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  Truck,
  Scale,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {

  const { user } = useAuthStore();
  const { getFilteredData } = useDataStore();

  // State for Google Sheets data
  const [sheetsData, setSheetsData] = useState({
    saudaQuantity: 0,
    doGenerated: 0,
    gateIn: 0,
    pending: 0,
    totalDelivered: 0,
    orderStatusData: [],
    logisticsData: [],
    recentTransactions: [],
    delayedData: [],
  });

  // console.log("sheetDAta",sheetsData);

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [logisticsFilter, setLogisticsFilter] = useState({
    month: "",
    year: "",
  });

  // Web app URL
  const WEBAPP_URL =
    "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec";

  // Helper function to ensure data is in array format
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.values && Array.isArray(data.values)) return data.values;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.saudaData && Array.isArray(data.saudaData)) return data.saudaData;
    if (data.orderInvoiceData && Array.isArray(data.orderInvoiceData))
      return data.orderInvoiceData;
    if (data.invoiceDeliveryData && Array.isArray(data.invoiceDeliveryData))
      return data.invoiceDeliveryData;
    if (data.delayData && Array.isArray(data.delayData)) return data.delayData;
    return [];
  };

  // Fetch data from Google Sheets
  const fetchSheetsData = async () => {
    try {
      setLoading(true);

      // Fetch data for each sheet separately including the new Delay sheet
      const [
        saudaResponse,
        orderInvoiceResponse,
        invoiceDeliveryResponse,
        delayResponse,
      ] = await Promise.all([
        fetch(`${WEBAPP_URL}?sheet=SaudaForm`),
        fetch(`${WEBAPP_URL}?sheet=ORDER-INVOICE`),
        fetch(`${WEBAPP_URL}?sheet=INVOICE-DELIVERY`),
        fetch(`${WEBAPP_URL}?sheet=Delay`),
      ]);

      const saudaData = (await saudaResponse.json()).data || [];
      const orderInvoiceData = (await orderInvoiceResponse.json()).data || [];
      const invoiceDeliveryData =
        (await invoiceDeliveryResponse.json()).data || [];
      const delayData = (await delayResponse.json()).data || [];

      console.log("saudaData",saudaData);
      // console.log("orderInvoiceData",orderInvoiceData);
      // console.log("invoiceDeliveryData",invoiceDeliveryData);
      // console.log("delayData",delayData);

      // Process the data
      processSheetData(
        saudaData,
        orderInvoiceData,
        invoiceDeliveryData,
        delayData
      );
    } catch (error) {
      console.error("Error fetching sheets data:", error);
      // Set default empty data
      setSheetsData({
        saudaQuantity: 0,
        doGenerated: 0,
        gateIn: 0,
        pending: 0,
        totalDelivered: 0,
        orderStatusData: [
          { name: "Pending", value: 0, color: "#F59E0B" },
          { name: "In Progress", value: 0, color: "#3B82F6" },
          { name: "Completed", value: 0, color: "#10B981" },
          { name: "Cancelled", value: 0, color: "#EF4444" },
        ],
        logisticsData: [],
        recentTransactions: [],
        delayedData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const processSheetData = (
    saudaData,
    orderInvoiceData,
    invoiceDeliveryData,
    delayData
  ) => {
    // (1) Sauda Quantity - Count non-empty rows in column G (index 6)
    const saudaQuantity = saudaData.reduce((total, row) => {
      const value = parseFloat(row[7]);
      console.log("value", value);

      return total + (isNaN(value) ? 0 : value);
    }, 0);

    // (2) DO Generated - Count non-empty rows in column B (index 1)
    const doGenerated = saudaData
      .slice(1)
      .filter((row) => row && row[1] && row[1].toString().trim() !== "").length;

    // (3) Gate In - Count rows where Column K (index 10) is NOT NULL and Column L (index 11) is NULL
    const gateIn = orderInvoiceData.filter(
      (row) =>
        row &&
        row[10] &&
        row[10] !== "" &&
        row[10] !== null &&
        (!row[11] || row[11] === "" || row[11] === null)
    ).length;

    // (4) Pending - Count non-empty rows in column M (index 12)
    const pending = saudaData.slice(1).reduce((total, row) => {
      const value = parseFloat(row[12]);

      return total + (isNaN(value) ? 0 : value);
    }, 0);

    
    // (5) Total Delivered - Count non-empty rows in column K (index 10)
    const totalDelivered = saudaData.filter(
      (row) => row && row[10] && row[10] !== "" && row[10] !== null
    ).length;
    
    // (6) Order Status Tracking - Column W (index 22) from INVOICE-DELIVERY
    const statusData = saudaData
  .slice(1) // Skip header row
  .filter((row) => row && row[13] && row[13] !== "" && row[13] !== null);
    
    const completeCount = statusData.filter(
      (row) => row[13].toString().toLowerCase() === "complete"
    ).length;
    
    
    console.log("completeCount",completeCount);
    
    const pendingCount = statusData.filter(
      (row) => row[13].toString().toLowerCase() === "pending"
    ).length;

    console.log("pendingCount",pendingCount);

    const totalStatus = completeCount + pendingCount;

    const orderStatusData = [
      {
        name: "Pending",
        value:
          totalStatus > 0 ? Math.round((pendingCount / totalStatus) * 100) : 0,
        color: "#F59E0B",
      },
      {
        name: "Completed",
        value:
          totalStatus > 0 ? Math.round((completeCount / totalStatus) * 100) : 0,
        color: "#10B981",
      },
    ];

    // (7) Logistics Overview - Monthly data from ORDER-INVOICE
    const logisticsData = processLogisticsData(orderInvoiceData);

    // (8) Recent Transactions - Columns C, D, E, M from Sauda
    let recentTransactions = saudaData
      .slice(6)
      .filter((row) => row && row.length > 0)
      .map((row) => {
        // Format dateOfSauda from row[2]
        let dateStr = "";
        if (row[2]) {
          const rawDate = new Date(row[2]);
          if (!isNaN(rawDate.getTime())) {
            const day = String(rawDate.getDate()).padStart(2, "0");
            const month = String(rawDate.getMonth() + 1).padStart(2, "0");
            const year = rawDate.getFullYear();
            dateStr = `${day}/${month}/${year}`;
          } else {
            dateStr = row[2].toString();
          }
        }

        return {
          dateOfSauda: dateStr || "",
          brokerName: row[3] || "",
          rate: row[4] || "",
          pendingQty: row[12] || "",
        };
      })
      .filter(
        (item) =>
          item.dateOfSauda || item.brokerName || item.rate || item.pendingQty
      );

    // (9) Delayed Data - Process delay sheet data
    const delayedData = delayData
      .slice(1) // Skip header row
      .filter((row) => row && row.length > 0)
      .map((row) => ({
        orderNo: row[0] || "", // Assuming Order No is in first column (A)
        vehicleNo: row[1] || "", // Assuming Vehicle No is in second column (B)
        brand: row[2] || "", // Assuming Brand is in third column (C)
        stage: row[3] || "", // Assuming Stage is in fourth column (D)
      }))
      .filter(
        (item) => item.orderNo || item.vehicleNo || item.brand || item.stage
      );

    // Filter by date range if provided
    if (dateRange.startDate && dateRange.endDate) {
      recentTransactions = recentTransactions.filter((item) => {
        if (item.dateOfSauda) {
          try {
            // Convert the item date to a comparable format
            const [day, month, year] = item.dateOfSauda.split("/");
            const itemDate = new Date(`${year}-${month}-${day}`);

            // Convert filter dates to Date objects
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            // Check if the item date is within the range
            return itemDate >= startDate && itemDate <= endDate;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    }

    setSheetsData({
      saudaQuantity,
      doGenerated,
      gateIn,
      pending,
      totalDelivered,
      orderStatusData,
      logisticsData,
      recentTransactions: recentTransactions.slice(0, 10),
      delayedData: delayedData.slice(0, 10),
    });
  };

  const processLogisticsData = (orderInvoiceData) => {
    const monthlyData = {};

    orderInvoiceData.forEach((row) => {
      if (!row) return;

      let month = "June";
      if (row[0]) {
        try {
          const date = new Date(row[0]);
          if (!isNaN(date.getTime())) {
            month = date.toLocaleDateString("en-US", { month: "short" });
          }
        } catch (e) {
          const dateStr = row[0].toString();
          if (dateStr.includes("/") || dateStr.includes("-")) {
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length >= 2) {
              const monthNum = parseInt(parts[1]) || parseInt(parts[0]);
              if (monthNum >= 1 && monthNum <= 12) {
                const monthNames = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];
                month = monthNames[monthNum - 1];
              }
            }
          }
        }
      }

      if (!monthlyData[month]) {
        monthlyData[month] = { month, gateIn: 0, gateOut: 0, delays: 0 };
      }

      // Gate In - Column K (index 10) is NOT NULL
      if (row[10] && row[10] !== "" && row[10] !== null) {
        monthlyData[month].gateIn++;
      }

      // Gate Out - Column T (index 19) & U (index 20) must both be NOT NULL
      if (
        row[19] &&
        row[19] !== "" &&
        row[19] !== null &&
        row[20] &&
        row[20] !== "" &&
        row[20] !== null
      ) {
        monthlyData[month].gateOut++;
      }

      // Delays - Count rows in Column U (index 20)
      if (row[20] !== undefined && row[20] !== null) {
        monthlyData[month].delays++;
      }
    });

    const result = Object.values(monthlyData).slice(0, 6);

    if (result.length === 0) {
      return [
        { month: "Jan", gateIn: 0, gateOut: 0, delays: 0 },
        { month: "Feb", gateIn: 0, gateOut: 0, delays: 0 },
        { month: "Mar", gateIn: 0, gateOut: 0, delays: 0 },
        { month: "Apr", gateIn: 0, gateOut: 0, delays: 0 },
        { month: "May", gateIn: 0, gateOut: 0, delays: 0 },
        { month: "Jun", gateIn: 0, gateOut: 0, delays: 0 },
      ];
    }

    return result;
  };

  useEffect(() => {
    fetchSheetsData();
  }, []);

  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      fetchSheetsData();
    }
  }, [dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
  };

  // Get filtered data based on user role (keeping original logic)
  const saudaData = getFilteredData("saudaData", user);
  const doData = getFilteredData("doData", user);
  const gateInData = getFilteredData("gateInData", user);
  const invoiceData = getFilteredData("invoiceData", user);



  const performanceData = [
    { name: "Staff Productivity", value: 85 },
    { name: "Delivery Times", value: 92 },
    { name: "Quality Score", value: 88 },
    { name: "Customer Satisfaction", value: 94 },
  ];

  const [vehicalReportsheetsData, setVehicalReportSheetsData] = useState({
    delayedData: [],
  });
  const [vehicalReportLoading, setVehicalLoading] = useState(true);

  // console.log("vehicalReportsheetsData", vehicalReportsheetsData);

  useEffect(() => {
    const fetchVehicleReport = async () => {
      setVehicalLoading(true);
      try {
        // First fetch formatted data (your existing backend endpoint)
        const formattedResponse = await fetch(
          `${WEBAPP_URL}?sheet=Vehicle%20Report`
        );
        const formattedData = await formattedResponse.json();

        // Then fetch all raw data
        const rawResponse = await fetch(
          `${WEBAPP_URL}?sheet=Vehicle%20Report&raw=true`
        );
        const rawData = await rawResponse.json();

        if (formattedData.success && rawData.success) {
          setVehicalReportSheetsData((prev) => ({
            ...prev,
            delayedData: formattedData.delayedData || formattedData.data, // Formatted data
            rawData: rawData.data, // All raw data
          }));
        } else {
          console.error("Failed to load vehicle report data");
        }
      } catch (error) {
        console.error("Error fetching vehicle report data:", error);
      } finally {
        setVehicalLoading(false);
      }
    };

    fetchVehicleReport();
  }, []);

  

  const processLogisticsStatusData = (
    rawData,
    filter = { month: "", year: "" }
  ) => {
    if (!rawData || rawData.length < 2) return [];

    const statusByDate = {};

    rawData.slice(1).forEach((row) => {
      if (!row || row.length < 14 || !row[0] || !row[13]) return;

      const timestamp = row[0];
      const status = row[13];

      if (!timestamp || !status) return;

      try {
        const dateParts = timestamp.split("T")[0].split("-");
        if (dateParts.length !== 3) return;

        const [year, month, day] = dateParts;

        // Apply filters
        if (filter.year && year !== filter.year) return;
        if (filter.month && month !== filter.month) return;

        const dateObj = new Date(year, month - 1, day);
        if (isNaN(dateObj.getTime())) return;

        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!statusByDate[formattedDate]) {
          statusByDate[formattedDate] = {
            date: formattedDate,
            onTime: 0,
            delay: 0,
          };
        }

        if (status.toLowerCase() === "on time") {
          statusByDate[formattedDate].onTime++;
        } else if (status.toLowerCase() === "delay") {
          statusByDate[formattedDate].delay++;
        }
      } catch (e) {
        console.error("Error processing row:", e);
      }
    });

    const result = Object.values(statusByDate).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    return result.length > 0
      ? result
      : [{ date: "No Data", onTime: 0, delay: 0 }];
  };

  const getAvailableYears = (rawData) => {
    if (!rawData || rawData.length < 2) return [];

    const years = new Set();

    rawData.slice(1).forEach((row) => {
      if (!row || !row[0]) return;

      try {
        const dateParts = row[0].split("T")[0].split("-");
        if (dateParts.length === 3) {
          years.add(dateParts[0]); // Add the year part
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  };

  const getAvailableMonths = (rawData) => {
    if (!rawData || rawData.length < 2) return [];

    const months = new Set();
    const monthNames = [
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

    rawData.slice(1).forEach((row) => {
      if (!row || !row[0]) return;

      try {
        const dateParts = row[0].split("T")[0].split("-");
        if (dateParts.length === 3) {
          months.add(dateParts[1]); // Add the month part (01-12)
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    return monthNames.filter((month) => months.has(month.value));
  };

  console.log("sheetsData.orderStatusData",sheetsData.orderStatusData)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard {user?.role !== "admin" && "(My Data)"}
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sauda Quantity</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : (Math.floor(sheetsData.saudaQuantity)).toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <Truck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">DO Generated</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : sheetsData.doGenerated}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <Scale size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Gate In</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : sheetsData.gateIn}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <Receipt size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : (Math.floor(sheetsData.pending)).toFixed(2)}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Deliverd</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : sheetsData.totalDelivered}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Package size={20} className="mr-2 text-indigo-600" />
            Order Status Tracking
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sheetsData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sheetsData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Truck size={20} className="mr-2 text-indigo-600" />
              Logistics Status Overview
            </h2>
            <div className="flex items-center space-x-2">
              <select
                value={logisticsFilter.month}
                onChange={(e) =>
                  setLogisticsFilter({
                    ...logisticsFilter,
                    month: e.target.value,
                  })
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Months</option>
                {getAvailableMonths(vehicalReportsheetsData.rawData).map(
                  (month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  )
                )}
              </select>
              <select
                value={logisticsFilter.year}
                onChange={(e) =>
                  setLogisticsFilter({
                    ...logisticsFilter,
                    year: e.target.value,
                  })
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Years</option>
                {getAvailableYears(vehicalReportsheetsData.rawData).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processLogisticsStatusData(
                  vehicalReportsheetsData.rawData,
                  logisticsFilter
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTime" name="On Time" fill="#10B981" />
                <Bar dataKey="delay" name="Delay" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      



      

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={20} className="mr-2 text-indigo-600" />
            Recent Transactions
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="startDate" className="text-sm text-gray-600">
                From:
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="endDate" className="text-sm text-gray-600">
                To:
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={clearDateRange}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
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
                  Pending Of Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sheetsData.recentTransactions.length > 0 ? (
                sheetsData.recentTransactions.map((item, index) => (
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
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delayed Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <AlertTriangle size={20} className="mr-2 text-red-600" />
            Delayed
          </h2>
        </div>
        <div className="overflow-x-auto">
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
            {/* <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : sheetsData.delayedData.length > 0 ? (
                sheetsData.delayedData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.orderNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.vehicleNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.stage}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No delayed data available</td>
                </tr>
                )}
            </tbody> */}

            <tbody className="bg-white divide-y divide-gray-100">
              {vehicalReportLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : vehicalReportsheetsData?.delayedData?.length > 0 ? (
                vehicalReportsheetsData?.delayedData?.map((item, index) => (
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
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No delayed data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;