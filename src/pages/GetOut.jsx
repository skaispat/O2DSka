import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  RefreshCw,
  Columns,
  CheckCircle2,
  LoaderIcon,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import supabase from "../SupabaseClient";

const GetOut = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [uniqueParties, setUniqueParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    "serialNumber",
    "partyName",
    "erpDoNo",
    "transporterName",
    "lrNumber",
    "vehicleNumber",
    "deliveryTerm",
    "billingDate",
    "billNo",
    "billStatus",
    "cashDiscount",
  ]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const columnOptions = [
    { id: "serialNumber", label: "Serial Number" },
    { id: "partyName", label: "Party Name" },
    { id: "erpDoNo", label: "ERP DO No." },
    { id: "transporterName", label: "Transporter Name" },
    { id: "lrNumber", label: "LR Number" },
    { id: "vehicleNumber", label: "Vehicle Number" },
    { id: "deliveryTerm", label: "Delivery Term" },
    { id: "billingDate", label: "Billing Date" },
    { id: "billNo", label: "Bill No" },
    { id: "billStatus", label: "Bill Status" },
    { id: "cashDiscount", label: "Cash Discount" },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleColumn = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_delivery')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data) {
        const allData = data.map((row, index) => ({
          id: row.id || index + 1,
          serialNumber: row.order_number || row.serialNumber,
          partyName: row.party_name || row.partyName,
          erpDoNo: row.do_no || row.erpDoNo,
          transporterName: row.transporter_name || row.transporterName,
          lrNumber: row.lt_number || row.lrNumber,
          vehicleNumber: row.vehicle_no || row.vehicleNumber,
          deliveryTerm: row.delivery_term || row.deliveryTerm,
          billingDate: row.bill_date || row.billingDate,
          billNo: row.bill_no || row.billNo,
          billStatus: row.bill_status || row.billStatus,
          cashDiscount: row.customer_discount || row.cashDiscount,
          planned1: row.planned1,
          actual1: row.actual1,
          status: row.status,
          invoice_no: row.invoice_no,
          sauda_no: row.sauda_no,
          bill_image: row.bill_image,
          size: row.size,
          section: row.section,
          qty: row.qty,
          rate: row.rate,
          udam_vidian: row.udam_vidian,
        }));

        const pending = allData.filter(
          (item) => item.planned1 && (!item.actual1 || item.actual1 === "")
        );

        const history = allData.filter(
          (item) => item.actual1 && item.actual1 !== ""
        );

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

  const handleBulkSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setIsSubmitting(true);
    const currentDateTime = new Date().toLocaleString("en-CA", { 
      timeZone: "Asia/Kolkata", 
      hour12: false 
    }).replace(',', '');

    try {
      const itemIds = selectedItems.map((itemId) => {
        const item = pendingData.find((item) => item.id === itemId);
        return item?.id;
      }).filter(id => id !== undefined);

      const { data, error } = await supabase
        .from('invoice_delivery')
        .update({
          status: "Complete",
          actual1: currentDateTime,
        })
        .in('id', itemIds);

      if (error) throw error;

      toast.success(`${selectedItems.length} items updated successfully!`);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update items");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch = item.partyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch = item.partyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredPendingData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredPendingData.map((item) => item.id));
    }
  };

  // Mobile Card Component for Pending Items
  const MobilePendingCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => handleSelectItem(item.id)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div>
            {selectedColumns.includes("serialNumber") && (
              <p className="text-sm font-medium text-gray-900">
                Invoice: {item.serialNumber}
              </p>
            )}
            {selectedColumns.includes("partyName") && (
              <p className="text-sm text-gray-600 mt-1">
                Party: {item.partyName}
              </p>
            )}
          </div>
        </div>
        {selectedColumns.includes("billStatus") && (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              item.billStatus === "Paid"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {item.billStatus}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {selectedColumns.includes("erpDoNo") && item.erpDoNo && (
          <div>
            <span className="text-gray-500">ERP DO:</span>
            <p className="font-medium">{item.erpDoNo}</p>
          </div>
        )}
        {selectedColumns.includes("transporterName") && item.transporterName && (
          <div>
            <span className="text-gray-500">Transporter:</span>
            <p className="font-medium">{item.transporterName}</p>
          </div>
        )}
        {selectedColumns.includes("vehicleNumber") && item.vehicleNumber && (
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="font-medium">{item.vehicleNumber}</p>
          </div>
        )}
        {selectedColumns.includes("deliveryTerm") && item.deliveryTerm && (
          <div>
            <span className="text-gray-500">Delivery Term:</span>
            <p className="font-medium">{item.deliveryTerm}</p>
          </div>
        )}
        {selectedColumns.includes("billingDate") && item.billingDate && (
          <div>
            <span className="text-gray-500">Billing Date:</span>
            <p className="font-medium">
              {new Date(item.billingDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {selectedColumns.includes("billNo") && item.billNo && (
          <div>
            <span className="text-gray-500">Bill No:</span>
            <p className="font-medium">{item.billNo}</p>
          </div>
        )}
        {selectedColumns.includes("cashDiscount") && item.cashDiscount && (
          <div>
            <span className="text-gray-500">Cash Discount:</span>
            <p className="font-medium">{item.cashDiscount}</p>
          </div>
        )}
        {selectedColumns.includes("lrNumber") && item.lrNumber && (
          <div>
            <span className="text-gray-500">LR Number:</span>
            <p className="font-medium">{item.lrNumber}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Card Component for History Items
  const MobileHistoryCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          {selectedColumns.includes("serialNumber") && (
            <p className="text-sm font-medium text-gray-900">
              Invoice: {item.serialNumber}
            </p>
          )}
          {selectedColumns.includes("partyName") && (
            <p className="text-sm text-gray-600 mt-1">
              Party: {item.partyName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              item.status === "Complete"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {item.status}
          </span>
          {selectedColumns.includes("billStatus") && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                item.billStatus === "Paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {item.billStatus}
            </span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <span className="text-sm text-gray-500">Completion Date:</span>
        <p className="text-sm font-medium">
          {item.actual1 ? new Date(item.actual1).toLocaleString() : "-"}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {selectedColumns.includes("erpDoNo") && item.erpDoNo && (
          <div>
            <span className="text-gray-500">ERP DO:</span>
            <p className="font-medium">{item.erpDoNo}</p>
          </div>
        )}
        {selectedColumns.includes("transporterName") && item.transporterName && (
          <div>
            <span className="text-gray-500">Transporter:</span>
            <p className="font-medium">{item.transporterName}</p>
          </div>
        )}
        {selectedColumns.includes("vehicleNumber") && item.vehicleNumber && (
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="font-medium">{item.vehicleNumber}</p>
          </div>
        )}
        {selectedColumns.includes("deliveryTerm") && item.deliveryTerm && (
          <div>
            <span className="text-gray-500">Delivery Term:</span>
            <p className="font-medium">{item.deliveryTerm}</p>
          </div>
        )}
        {selectedColumns.includes("billingDate") && item.billingDate && (
          <div>
            <span className="text-gray-500">Billing Date:</span>
            <p className="font-medium">
              {new Date(item.billingDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {selectedColumns.includes("billNo") && item.billNo && (
          <div>
            <span className="text-gray-500">Bill No:</span>
            <p className="font-medium">{item.billNo}</p>
          </div>
        )}
        {selectedColumns.includes("cashDiscount") && item.cashDiscount && (
          <div>
            <span className="text-gray-500">Cash Discount:</span>
            <p className="font-medium">{item.cashDiscount}</p>
          </div>
        )}
        {selectedColumns.includes("lrNumber") && item.lrNumber && (
          <div>
            <span className="text-gray-500">LR Number:</span>
            <p className="font-medium">{item.lrNumber}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Get Out</h1>
        <div className="flex items-center space-x-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkSubmit}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderIcon className="animate-spin mr-2" size={16} />
              ) : (
                <CheckCircle2 size={16} className="mr-2" />
              )}
              Submit Selected ({selectedItems.length})
            </button>
          )}
          <button
            onClick={fetchData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto justify-center"
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by party name or DO number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Filter and Column Controls */}
          <div className="flex gap-2 md:gap-3">
            {/* Party Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-500 flex-shrink-0" />
              <select
                className="border-none focus:outline-none focus:ring-0 text-sm bg-transparent"
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

            {/* Column Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white hover:bg-gray-50"
              >
                <Columns size={16} className="text-gray-500" />
                <span className="hidden sm:inline">Columns</span>
                <svg
                  className={`h-4 w-4 transition-transform ${showColumnDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showColumnDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColumnDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 sm:w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {columnOptions.map((column) => (
                        <div
                          key={column.id}
                          className="flex items-center p-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            id={column.id}
                            checked={selectedColumns.includes(column.id)}
                            onChange={() => toggleColumn(column.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={column.id}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {column.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`flex-1 py-3 px-2 md:px-6 font-medium text-sm border-b-2 text-center ${
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
              className={`flex-1 py-3 px-2 md:px-6 font-medium text-sm border-b-2 text-center ${
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
        <div className="p-3 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600 ml-3 text-sm md:text-base">Loading data...</span>
            </div>
          ) : (
            <>
              {activeTab === "pending" && (
                <>
                  {isMobile ? (
                    <div className="space-y-3">
                      {filteredPendingData.map((item) => (
                        <MobilePendingCard key={item.id} item={item} />
                      ))}
                      {filteredPendingData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No pending get out records found.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={
                                  selectedItems.length ===
                                    filteredPendingData.length &&
                                  filteredPendingData.length > 0
                                }
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </th>
                            {selectedColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice No
                              </th>
                            )}
                            {selectedColumns.includes("partyName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Party Name
                              </th>
                            )}
                            {selectedColumns.includes("erpDoNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ERP DO No.
                              </th>
                            )}
                            {selectedColumns.includes("transporterName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transporter Name
                              </th>
                            )}
                            {selectedColumns.includes("vehicleNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle Number
                              </th>
                            )}
                            {selectedColumns.includes("deliveryTerm") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery Term
                              </th>
                            )}
                            {selectedColumns.includes("billingDate") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Billing Date
                              </th>
                            )}
                            {selectedColumns.includes("billNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bill No
                              </th>
                            )}
                            {selectedColumns.includes("billStatus") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bill Status
                              </th>
                            )}
                            {selectedColumns.includes("cashDiscount") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cash Discount
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPendingData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => handleSelectItem(item.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              {selectedColumns.includes("serialNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.serialNumber}
                                </td>
                              )}
                              {selectedColumns.includes("partyName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.partyName}
                                </td>
                              )}
                              {selectedColumns.includes("erpDoNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.erpDoNo}
                                </td>
                              )}
                              {selectedColumns.includes("transporterName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.transporterName}
                                </td>
                              )}
                              {selectedColumns.includes("vehicleNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.vehicleNumber}
                                </td>
                              )}
                              {selectedColumns.includes("deliveryTerm") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.deliveryTerm}
                                </td>
                              )}
                              {selectedColumns.includes("billingDate") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.billingDate
                                    ? new Date(
                                        item.billingDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                              )}
                              {selectedColumns.includes("billNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.billNo}
                                </td>
                              )}
                              {selectedColumns.includes("billStatus") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      item.billStatus === "Paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {item.billStatus}
                                  </span>
                                </td>
                              )}
                              {selectedColumns.includes("cashDiscount") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.cashDiscount}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredPendingData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No pending get out records found.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "history" && (
                <>
                  {isMobile ? (
                    <div className="space-y-3">
                      {filteredHistoryData.map((item) => (
                        <MobileHistoryCard key={item.id} item={item} />
                      ))}
                      {filteredHistoryData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No historical get out records found.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completion Date
                            </th>
                            {selectedColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice No
                              </th>
                            )}
                            {selectedColumns.includes("partyName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Party Name
                              </th>
                            )}
                            {selectedColumns.includes("erpDoNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ERP DO No.
                              </th>
                            )}
                            {selectedColumns.includes("transporterName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transporter Name
                              </th>
                            )}
                            {selectedColumns.includes("vehicleNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle Number
                              </th>
                            )}
                            {selectedColumns.includes("deliveryTerm") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery Term
                              </th>
                            )}
                            {selectedColumns.includes("billingDate") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Billing Date
                              </th>
                            )}
                            {selectedColumns.includes("billNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bill No
                              </th>
                            )}
                            {selectedColumns.includes("billStatus") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bill Status
                              </th>
                            )}
                            {selectedColumns.includes("cashDiscount") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cash Discount
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredHistoryData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    item.status === "Complete"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.actual1
                                  ? new Date(item.actual1).toLocaleString()
                                  : "-"}
                              </td>
                              {selectedColumns.includes("serialNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.serialNumber}
                                </td>
                              )}
                              {selectedColumns.includes("partyName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.partyName}
                                </td>
                              )}
                              {selectedColumns.includes("erpDoNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.erpDoNo}
                                </td>
                              )}
                              {selectedColumns.includes("transporterName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.transporterName}
                                </td>
                              )}
                              {selectedColumns.includes("vehicleNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.vehicleNumber}
                                </td>
                              )}
                              {selectedColumns.includes("deliveryTerm") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.deliveryTerm}
                                </td>
                              )}
                              {selectedColumns.includes("billingDate") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.billingDate
                                    ? new Date(
                                        item.billingDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                              )}
                              {selectedColumns.includes("billNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.billNo}
                                </td>
                              )}
                              {selectedColumns.includes("billStatus") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      item.billStatus === "Paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {item.billStatus}
                                  </span>
                                </td>
                              )}
                              {selectedColumns.includes("cashDiscount") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.cashDiscount}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredHistoryData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No historical get out records found.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetOut;