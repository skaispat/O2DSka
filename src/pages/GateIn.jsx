

import React, { useState, useEffect, useRef } from "react";
import { Filter, Search, Clock, CheckCircle, RefreshCw, X } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const GateIn = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [gateInTimes, setGateInTimes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [uniqueParties, setUniqueParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    'serialNumber',
    'partyName',
    'erpDoNo',
    'transporterName',
    'lrNumber',
    'vehicleNumber',
    'deliveryTerm',
    'brandName',
    'dispatchQty'
  ]);

  const columnOptions = [
    { value: 'serialNumber', label: 'Serial Number' },
    { value: 'partyName', label: 'Party Name' },
    { value: 'erpDoNo', label: 'ERP DO No.' },
    { value: 'transporterName', label: 'Transporter Name' },
    { value: 'lrNumber', label: 'LR Number' },
    { value: 'vehicleNumber', label: 'Vehicle Number' },
    { value: 'deliveryTerm', label: 'Delivery Term' },
    { value: 'brandName', label: 'Brand Name' },
    { value: 'dispatchQty', label: 'Dispatch Qty' }
  ];

  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  const fetchData = async () => {
    setLoading(true); // start loading
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE`
      );
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        // Process the data to match your requirements
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          serialNumber: row[1], // Column A (assuming this is serial number)
          partyName: row[2], // Column C
          erpDoNo: row[3], // Column D
          transporterName: row[4], // Column E
          lrNumber: row[5], // Column F
          vehicleNumber: row[6], // Column G
          deliveryTerm: row[7], // Column H
          brandName: row[8], // Column I
          dispatchQty: row[9], // Column J
          planned1: row[10], // Column K
          actual1: row[11], // Column L
        }));

        // Filter data based on your conditions
        const pending = allData.filter(
          (item) => item.planned1 && !item.actual1
        );
        const history = allData.filter((item) => item.planned1 && item.actual1);

        setPendingData(pending);
        setHistoryData(history);
        setUniqueParties([...new Set(allData.map((item) => item.partyName))]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGateInTimeChange = (id, dateTime) => {
    setGateInTimes((prev) => ({
      ...prev,
      [id]: dateTime,
    }));
  };

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  function getFormattedDateTime() {
    const now = new Date();

    const pad = (num) => num.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // Months are 0-based
    const year = now.getFullYear();

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    // Return with space that might get encoded as +
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const handleSubmitGateIn = async (id) => {
    const gateInDateTime = gateInTimes[id];
    if (!gateInDateTime) {
      toast.error("Please select gate in date and time");
      return;
    }

    setIsSubmitting(true); // Start loading

    const currentDateTime = getFormattedDateTime();
    console.log("currentDateTime", currentDateTime);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
            sheetName: "ORDER-INVOICE",
            action: "update",
            rowIndex: (id + 6).toString(),
            columnData: JSON.stringify({
              L: currentDateTime,
              N: gateInDateTime,
            }),
          }).toString(),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      toast.success("Gate in updated successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating gate in:", error);
      toast.error("Failed to update gate in");
    } finally {
      setIsSubmitting(false); // Stop loading regardless of success/failure
    }
  };

const filteredPendingData = pendingData
  .filter((item) => {
    const partyName = item?.partyName ? String(item.partyName).toLowerCase() : "";
    const erpDoNo = item?.erpDoNo ? String(item.erpDoNo).toLowerCase() : "";
    const matchesSearch =
      partyName.includes(searchTerm.toLowerCase()) ||
      erpDoNo.includes(searchTerm.toLowerCase());
    const matchesParty =
      filterParty === "all" || item.partyName === filterParty;
    return matchesSearch && matchesParty;
  })
  .reverse();

const filteredHistoryData = historyData
  .filter((item) => {
    const partyName = item?.partyName ? String(item.partyName).toLowerCase() : "";
    const erpDoNo = item?.erpDoNo ? String(item.erpDoNo).toLowerCase() : "";
    const matchesSearch =
      partyName.includes(searchTerm.toLowerCase()) ||
      erpDoNo.includes(searchTerm.toLowerCase());
    const matchesParty =
      filterParty === "all" || item.partyName === filterParty;
    return matchesSearch && matchesParty;
  })
  .reverse();

  // Helper function to render table headers conditionally
  const renderTableHeader = (isPending = true) => {
    const headers = [
      { key: 'action', label: 'Action', show: isPending },
      { key: 'serialNumber', label: 'Serial Number' },
      { key: 'partyName', label: 'Party Name' },
      { key: 'erpDoNo', label: 'ERP DO No.' },
      { key: 'transporterName', label: 'Transporter Name' },
      { key: 'lrNumber', label: 'LR Number' },
      { key: 'vehicleNumber', label: 'Vehicle Number' },
      { key: 'deliveryTerm', label: 'Delivery Term' },
      { key: 'brandName', label: 'Brand Name' },
      { key: 'dispatchQty', label: 'Dispatch Qty' }
    ];

    if (!isPending) {
      headers.splice(0, 1); // Remove action column for history
      headers.splice(1, 0, { key: 'actual1', label: 'Gate In Date&Time' }); // Add date column for history
    }

    return headers
      .filter(header => visibleColumns.includes(header.key) || header.show)
      .map(header => (
        <th key={header.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {header.label}
        </th>
      ));
  };

  // Helper function to render table cells conditionally
  const renderTableCell = (item, isPending = true) => {
    const cells = [
      { key: 'action', content: (
        <button
          onClick={() => handleOpenModal(item)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          Gate In
        </button>
      ), show: isPending },
      { key: 'serialNumber', content: item.serialNumber },
      { key: 'partyName', content: item.partyName },
      { key: 'erpDoNo', content: item.erpDoNo },
      { key: 'transporterName', content: item.transporterName },
      { key: 'lrNumber', content: item.lrNumber },
      { key: 'vehicleNumber', content: item.vehicleNumber },
      { key: 'deliveryTerm', content: item.deliveryTerm },
      { key: 'brandName', content: item.brandName },
      { key: 'dispatchQty', content: item.dispatchQty }
    ];

    if (!isPending) {
      cells.splice(0, 1); // Remove action column for history
      cells.splice(1, 0, { 
        key: 'actual1', 
        content: item.actual1 ? new Date(item.actual1).toLocaleString() : "-"
      }); // Add date column for history
    }

    return cells
      .filter(cell => visibleColumns.includes(cell.key) || cell.show)
      .map(cell => (
        <td key={cell.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {cell.content}
        </td>
      ));
  };

  // Add a ref for the dropdown and state for dropdown visibility
  const dropdownRef = useRef(null);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ... (keep all other existing functions)

  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">Gate In Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.serialNumber}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Name
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.partyName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.transporterName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Term
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.deliveryTerm}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.brandName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispatch Qty
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.dispatchQty}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gate In Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={gateInTimes[currentItem.id] || ""}
                  onChange={(e) =>
                    handleGateInTimeChange(currentItem.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitGateIn(currentItem.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting
                  </>
                ) : (
                  "Submit Gate In"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gate IN</h1>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by party name or DO number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
          >
            <option value="all">All Parties</option>
            {uniqueParties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>

          {/* Updated Column Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
            >
              <span>Columns</span>
              <svg
                className={`ml-2 h-4 w-4 transition-transform ${isColumnDropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-2">
                  {columnOptions.map((column) => (
                    <div
                      key={column.value}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => toggleColumnVisibility(column.value)}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.value)}
                        readOnly
                        className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{column.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <CheckCircle size={16} className="inline mr-2" />
              History ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600 ml-3">Loading data...</span>
            </div>
          ) : (
            <>
              {activeTab === "pending" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {renderTableHeader(true)}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {renderTableCell(item, true)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPendingData.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No pending gate in records found.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {renderTableHeader(false)}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {renderTableCell(item, false)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistoryData.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No historical gate in records found.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GateIn;