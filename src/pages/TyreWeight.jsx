import React, { useState, useEffect, useRef } from "react";
import { Filter, Search, Clock, CheckCircle, RefreshCw, X, Columns, Truck, Package, Calendar, Scale } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import supabase from "../SupabaseClient";

const TyreWeight = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [remarks, setRemarks] = useState({});
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
    'vehicleNumber',
    'brandName',
    'dispatchQty'
  ]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Column options for both tabs
  const columnOptions = [
    { value: 'serialNumber', label: 'Serial Number' },
    { value: 'partyName', label: 'Party Name' },
    { value: 'erpDoNo', label: 'ERP DO No.' },
    { value: 'transporterName', label: 'Transporter Name' },
    { value: 'vehicleNumber', label: 'Vehicle Number' },
    { value: 'brandName', label: 'Brand Name' },
    { value: 'dispatchQty', label: 'Dispatch Qty' }
  ];

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

  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_invoice')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data) {
        const allData = data.map((row, index) => ({
          id: row.id || index + 1,
          serialNumber: row.order_no || row.serialNumber,
          partyName: row.party_name || row.partyName,
          erpDoNo: row.erp_do_no || row.erpDoNo,
          transporterName: row.transporter_name || row.transporterName,
          lrNumber: row.lr_number || row.lrNumber,
          vehicleNumber: row.vehicle_number || row.vehicleNumber,
          deliveryTerm: row.delivery_term || row.deliveryTerm,
          brandName: row.brand_name || row.brandName,
          dispatchQty: row.dispatch_qty || row.dispatchQty,
          planned2: row.planned2 || row.planned_date_2,
          actual2: row.actual2 || row.actual_date_2,
          remarks: row.remarks || row.notes,
        }));

        const pending = allData.filter(
          (item) => item.planned2 && !item.actual2
        );
        const history = allData.filter((item) => item.planned2 && item.actual2);

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

  const handleRemarksChange = (id, value) => {
    setRemarks((prev) => ({
      ...prev,
      [id]: value,
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

  const handleSubmitTyreWeight = async (id) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('order_invoice')
        .update({
          actual2:new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', ''),
          remarks: remarks[id] || "",
//           planned3:new Date().toLocaleString("en-CA", { 
//   timeZone: "Asia/Kolkata", 
//   hour12: false 
// }).replace(',', ''),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Tyre weight recorded successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating tyre weight:", error);
      toast.error("Failed to update tyre weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    }).reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    }).reverse();

  // Helper function to render table headers conditionally
  const renderTableHeader = (isPending = true) => {
    const headers = [
      { key: 'action', label: 'Action', show: isPending },
      { key: 'serialNumber', label: 'Serial No.' },
      { key: 'partyName', label: 'Party Name' },
      { key: 'erpDoNo', label: 'ERP DO No.' },
      { key: 'transporterName', label: 'Transporter' },
      { key: 'vehicleNumber', label: 'Vehicle No.' },
      { key: 'brandName', label: 'Brand' },
      { key: 'dispatchQty', label: 'Dispatch Qty' }
    ];

    if (!isPending) {
      headers.splice(0, 1);
      headers.splice(1, 0, { key: 'actual2', label: 'Weight Time' });
      headers.push({ key: 'remarks', label: 'Remarks', show: true });
    }

    return headers
      .filter(header => visibleColumns.includes(header.key) || header.show)
      .map(header => (
        <th key={header.key} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          {header.label}
        </th>
      ));
  };

  // Helper function to render table cells conditionally
  const renderTableCell = (item, isPending = true) => {
    const cells = [
      { 
        key: 'action', 
        content: (
          <button
            onClick={() => handleOpenModal(item)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm whitespace-nowrap w-full sm:w-auto"
          >
            Record Weight
          </button>
        ), 
        show: isPending 
      },
      { key: 'serialNumber', content: item.serialNumber },
      { key: 'partyName', content: item.partyName },
      { key: 'erpDoNo', content: item.erpDoNo },
      { key: 'transporterName', content: item.transporterName },
      { key: 'vehicleNumber', content: item.vehicleNumber },
      { key: 'brandName', content: item.brandName },
      { key: 'dispatchQty', content: item.dispatchQty }
    ];

    if (!isPending) {
      cells.splice(0, 1);
      cells.splice(1, 0, { 
        key: 'actual2', 
        content: item.actual2 ? new Date(item.actual2).toLocaleString() : "-"
      });
      cells.push({ 
        key: 'remarks', 
        content: item.remarks || "-",
        show: true 
      });
    }

    return cells
      .filter(cell => visibleColumns.includes(cell.key) || cell.show)
      .map(cell => (
        <td key={cell.key} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          <div className="truncate max-w-[120px] sm:max-w-none">
            {cell.content}
          </div>
        </td>
      ));
  };

  // Improved mobile card rendering function
  const renderMobileCard = (item, isPending = true) => {
    const visibleFields = [
      { key: 'serialNumber', label: 'Serial No', value: item.serialNumber },
      { key: 'erpDoNo', label: 'ERP DO No', value: item.erpDoNo },
      { key: 'transporterName', label: 'Transporter', value: item.transporterName, icon: Truck },
      { key: 'vehicleNumber', label: 'Vehicle No', value: item.vehicleNumber },
      { key: 'brandName', label: 'Brand', value: item.brandName, icon: Package },
      { key: 'dispatchQty', label: 'Dispatch Qty', value: item.dispatchQty }
    ].filter(field => visibleColumns.includes(field.key));

    if (!isPending) {
      visibleFields.splice(1, 0, {
        key: 'actual2',
        label: 'Weight Time',
        value: item.actual2 ? new Date(item.actual2).toLocaleString() : "-",
        icon: Calendar
      });
    }

    return (
      <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-3">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{item.serialNumber}
              </span>
              {!isPending && item.actual2 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Completed
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">{item.partyName}</h3>
            <p className="text-sm text-gray-600">ERP: {item.erpDoNo}</p>
          </div>
          {isPending && (
            <button
              onClick={() => handleOpenModal(item)}
              className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium whitespace-nowrap flex-shrink-0 shadow-sm"
            >
              Record Weight
            </button>
          )}
        </div>

        {/* Details Grid - Improved layout with proper label-value arrangement */}
        <div className="space-y-3">
          {visibleFields.map((field) => {
            const IconComponent = field.icon;
            return (
              <div key={field.key} className="flex items-start">
                <div className="flex items-center space-x-2 text-gray-600 min-w-[120px] flex-shrink-0">
                  {IconComponent && <IconComponent size={16} className="text-gray-400 flex-shrink-0" />}
                  <span className="text-sm font-medium">{field.label}:</span>
                </div>
                <span className="text-gray-900 text-sm ml-2 break-words flex-1">
                  {field.value || '-'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Remarks for history items */}
        {!isPending && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center space-x-2 text-gray-600 min-w-[120px] flex-shrink-0">
                <Scale size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Remarks:</span>
              </div>
              <span className="text-gray-900 text-sm ml-2 break-words flex-1">
                {item.remarks || "-"}
              </span>
            </div>
          </div>
        )}

        {/* Weight time for history items */}
        {!isPending && item.actual2 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 text-gray-600 min-w-[120px] flex-shrink-0">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Weight Time:</span>
              </div>
              <span className="text-gray-900 text-sm ml-2 break-words flex-1">
                {item.actual2 ? new Date(item.actual2).toLocaleString() : "-"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Tyre Weight Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No
                  </label>
                  <p className="mt-1 text-sm font-medium truncate">
                    {currentItem.serialNumber}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Name
                  </label>
                  <p className="mt-1 text-sm font-medium truncate">
                    {currentItem.partyName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </label>
                  <p className="mt-1 text-sm font-medium truncate">
                    {currentItem.transporterName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </label>
                  <p className="mt-1 text-sm font-medium truncate">
                    {currentItem.vehicleNumber}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </label>
                  <p className="mt-1 text-sm font-medium truncate">
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

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks[currentItem.id] || ""}
                  onChange={(e) =>
                    handleRemarksChange(currentItem.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter any remarks..."
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitTyreWeight(currentItem.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] w-full sm:w-auto"
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
                  "Submit Weight"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Tyre Weight</h1>
        <button
          onClick={fetchData}
          className="hidden sm:inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Search Input */}
        <div className="relative">
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

        {/* Filter Controls - Improved side-by-side layout */}
        <div className="flex flex-row gap-2">
          {/* Party Filter */}
          <div className="flex-1 relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
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
          </div>

          {/* Column Filter Dropdown */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center justify-center w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <Columns size={16} className="mr-2" />
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
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200 max-h-60 overflow-y-auto">
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

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max">
            <button
              className={`py-4 px-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
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
              className={`py-4 px-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
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
        <div className="p-3 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600 ml-3">Loading data...</span>
            </div>
          ) : (
            <>
              {activeTab === "pending" && (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
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
                          No pending tyre weight records found.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {filteredPendingData.map((item) => renderMobileCard(item, true))}
                    {filteredPendingData.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No pending tyre weight records found.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "history" && (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
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
                          No historical tyre weight records found.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {filteredHistoryData.map((item) => renderMobileCard(item, false))}
                    {filteredHistoryData.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No historical tyre weight records found.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TyreWeight;