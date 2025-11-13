import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  Upload,
  Columns,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import supabase from "../SupabaseClient";

const FinalWeight = () => {
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
  const [weighmentCopy, setWeighmentCopy] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "serialNumber",
    "partyName",
    "erpDoNo",
    "transporterName",
    "vehicleNumber",
    "brandName",
    "dispatchQty",
  ]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const columnOptions = [
    { value: "serialNumber", label: "Serial Number" },
    { value: "partyName", label: "Party Name" },
    { value: "erpDoNo", label: "ERP DO No." },
    { value: "transporterName", label: "Transporter Name" },
    { value: "vehicleNumber", label: "Vehicle Number" },
    { value: "brandName", label: "Brand Name" },
    { value: "dispatchQty", label: "Dispatch Qty" },
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

  // Fixed function to get proper Google Drive viewer URL
  const getDriveViewerUrl = (url) => {
    try {
      if (!url || url.trim() === "") {
        console.warn("Empty or null URL provided");
        return null;
      }

      console.log("Original URL:", url);

      // If it's already a proper drive viewer link, return as-is
      if (
        url.includes("drive.google.com/file/d/") &&
        (url.includes("/view") || url.includes("/preview"))
      ) {
        console.log("Already proper drive URL:", url);
        return url;
      }

      // Extract file ID from various Google Drive URL formats
      let fileId = "";

      // Standard share link format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        fileId = fileIdMatch[1];
        console.log("Extracted file ID from standard format:", fileId);
      }
      // Open URL format: https://drive.google.com/open?id=FILE_ID
      else if (url.includes("open?id=")) {
        try {
          const urlObj = new URL(url);
          fileId = urlObj.searchParams.get("id");
          console.log("Extracted file ID from open format:", fileId);
        } catch (urlError) {
          console.error("Error parsing open URL:", urlError);
        }
      }
      // Direct ID format (just the ID)
      else if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
        fileId = url;
        console.log("URL appears to be direct file ID:", fileId);
      }

      if (!fileId) {
        console.warn("Could not extract file ID from URL:", url);
        // Try to use the original URL as fallback
        return url;
      }

      // Return proper viewer URL that opens in new tab
      const viewerUrl = `https://drive.google.com/file/d/${fileId}/view`;
      console.log("Generated viewer URL:", viewerUrl);
      return viewerUrl;
    } catch (e) {
      console.error("Error parsing Drive URL:", e);
      return url; // Fallback to original URL if parsing fails
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

      console.log("Fetched data from Supabase:", data);

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
          planned5: row.planned5 || row.planned_date_5,
           actual3: row.actual3,
          actual5: row.actual5 || row.actual_date_5,
          finalWeight: row.final_weight || row.finalWeight,
          weighmentCopy: row.weighment_copy || row.weighmentCopy,
          remarks: row.remarks || row.notes,
        }));

        // Filter data based on conditions
        const pending = allData.filter(
          (item) => item.planned5 && !item.actual5
        );
        const history = allData.filter((item) => item.planned5 && item.actual5);

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

  const toggleColumnDropdown = () => {
    setShowColumnDropdown(!showColumnDropdown);
  };

  const handleColumnChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setVisibleColumns((prev) => [...prev, value]);
    } else {
      setVisibleColumns((prev) => prev.filter((col) => col !== value));
    }
  };

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setPartyName(item.partyName);
    setFinalWeight(item.finalWeight || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setWeighmentCopy(null);
    setPartyName("");
    setFinalWeight("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setWeighmentCopy(file);
    } else {
      toast.error("Please upload an image or PDF file");
    }
  };

  const handleSubmitFinalWeight = async () => {
    setIsSubmitting(true);
    const currentDateTime =new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', '');

    try {
      let weighmentCopyUrl = currentItem.weighmentCopy || "";

      // Validate file upload for pending items
      if (activeTab === "pending" && !weighmentCopy) {
        toast.error("Please upload a weighment copy file.");
        return;
      }

      // Upload file to Supabase storage if provided
      if (activeTab === "pending" && weighmentCopy) {
        // Generate unique file name
        const fileExt = weighmentCopy.name.split('.').pop();
        const fileName = `${currentItem.id}_${Date.now()}.${fileExt}`;
        const filePath = `weight-copies/${fileName}`;

        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('weight_copy')
          .upload(filePath, weighmentCopy);

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase
          .storage
          .from('weight_copy')
          .getPublicUrl(filePath);

        weighmentCopyUrl = urlData.publicUrl;
      }

      // Update the record in Supabase
      const { error: updateError } = await supabase
        .from('order_invoice')
        .update({
          party_name: partyName,
          actual5: currentDateTime,
          final_weight: finalWeight,
          weighment_copy: weighmentCopyUrl,
          // planned6: currentDateTime
        })
        .eq('id', currentItem.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      toast.success("Final weight updated successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating final weight:", error);
      toast.error(error.message || "Failed to update final weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle PDF viewing with better error handling
  const handleViewPDF = (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if url exists and is a string
    if (!url || typeof url !== "string") {
      toast.error("No valid weighment copy available");
      return;
    }

    try {
      const viewerUrl = getDriveViewerUrl(url.trim());
      if (viewerUrl) {
        window.open(viewerUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Invalid PDF URL format");
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Failed to open PDF. Please try again.");
    }
  };

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  // Mobile Card Component for Pending Items
  const MobilePendingCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          {visibleColumns.includes("serialNumber") && (
            <p className="text-sm font-medium text-gray-900">
              Serial: {item.serialNumber}
            </p>
          )}
          {visibleColumns.includes("partyName") && (
            <p className="text-sm text-gray-600 mt-1">
              Party: {item.partyName}
            </p>
          )}
        </div>
        <button
          onClick={() => handleOpenModal(item)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          Final Weight
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {visibleColumns.includes("erpDoNo") && item.erpDoNo && (
          <div>
            <span className="text-gray-500">ERP DO:</span>
            <p className="font-medium">{item.erpDoNo}</p>
          </div>
        )}
        {visibleColumns.includes("transporterName") && item.transporterName && (
          <div>
            <span className="text-gray-500">Transporter:</span>
            <p className="font-medium">{item.transporterName}</p>
          </div>
        )}
        {visibleColumns.includes("vehicleNumber") && item.vehicleNumber && (
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="font-medium">{item.vehicleNumber}</p>
          </div>
        )}
        {visibleColumns.includes("brandName") && item.brandName && (
          <div>
            <span className="text-gray-500">Brand:</span>
            <p className="font-medium">{item.brandName}</p>
          </div>
        )}
        {visibleColumns.includes("dispatchQty") && item.dispatchQty && (
          <div>
            <span className="text-gray-500">Qty:</span>
            <p className="font-medium">{item.dispatchQty}</p>
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
          {visibleColumns.includes("serialNumber") && (
            <p className="text-sm font-medium text-gray-900">
              Serial: {item.serialNumber}
            </p>
          )}
          {visibleColumns.includes("partyName") && (
            <p className="text-sm text-gray-600 mt-1">
              Party: {item.partyName}
            </p>
          )}
        </div>
        <button
          onClick={() => handleOpenModal(item)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          Edit
        </button>
      </div>
      
      <div className="mb-2">
        <span className="text-sm text-gray-500">Weighment Date:</span>
        <p className="text-sm font-medium">
          {item.actual5 ? new Date(item.actual5).toLocaleString() : "-"}
        </p>
      </div>

      <div className="mb-2">
        <span className="text-sm text-gray-500">Final Weight:</span>
        <p className="text-sm font-medium">{item.finalWeight || "-"}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {visibleColumns.includes("erpDoNo") && item.erpDoNo && (
          <div>
            <span className="text-gray-500">ERP DO:</span>
            <p className="font-medium">{item.erpDoNo}</p>
          </div>
        )}
        {visibleColumns.includes("vehicleNumber") && item.vehicleNumber && (
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="font-medium">{item.vehicleNumber}</p>
          </div>
        )}
        {visibleColumns.includes("brandName") && item.brandName && (
          <div>
            <span className="text-gray-500">Brand:</span>
            <p className="font-medium">{item.brandName}</p>
          </div>
        )}
        {visibleColumns.includes("dispatchQty") && item.dispatchQty && (
          <div>
            <span className="text-gray-500">Qty:</span>
            <p className="font-medium">{item.dispatchQty}</p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-sm text-gray-500">Weighment Copy:</span>
        {item.weighmentCopy ? (
          <button
            onClick={(e) => handleViewPDF(item.weighmentCopy, e)}
            className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium text-sm ml-2"
            type="button"
          >
            View PDF
          </button>
        ) : (
          <span className="text-gray-400 text-sm ml-2">No file</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 p-4 text-white sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {activeTab === "pending"
                    ? "Final Weight Details"
                    : "Edit Final Weight"}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  />
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
                    Vehicle Number
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.vehicleNumber}
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

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Weight
                </label>
                <input
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter final weight"
                />
              </div>

              {activeTab === "pending" && (
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weighment Copy
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      id="weighment-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="absolute w-0 h-0 opacity-0"
                      tabIndex={0}
                    />
                    <label
                      htmlFor="weighment-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload File
                    </label>
                    {weighmentCopy && (
                      <span className="text-sm text-gray-600 ml-3">
                        {weighmentCopy.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 md:px-6 py-4 flex justify-end space-x-3 sticky bottom-0">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm md:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFinalWeight}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm md:text-base"
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
                    {activeTab === "pending" ? "Submitting..." : "Updating..."}
                  </>
                ) : activeTab === "pending" ? (
                  "Submit Final Weight"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Final Weight</h1>
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
                onClick={toggleColumnDropdown}
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
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                    <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                      {columnOptions.map((column) => (
                        <label
                          key={column.value}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={column.value}
                            checked={visibleColumns.includes(column.value)}
                            onChange={handleColumnChange}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">
                            {column.label}
                          </span>
                        </label>
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
                            No pending final weight records found.
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
                              Action
                            </th>
                            {visibleColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial Number
                              </th>
                            )}
                            {visibleColumns.includes("partyName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Party Name
                              </th>
                            )}
                            {visibleColumns.includes("erpDoNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ERP DO No.
                              </th>
                            )}
                            {visibleColumns.includes("transporterName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transporter Name
                              </th>
                            )}
                            {visibleColumns.includes("vehicleNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle Number
                              </th>
                            )}
                            {visibleColumns.includes("brandName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand Name
                              </th>
                            )}
                            {visibleColumns.includes("dispatchQty") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dispatch Qty
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPendingData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                >
                                  Final Weight
                                </button>
                              </td>
                              {visibleColumns.includes("serialNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.serialNumber}
                                </td>
                              )}
                              {visibleColumns.includes("partyName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.partyName}
                                </td>
                              )}
                              {visibleColumns.includes("erpDoNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.erpDoNo}
                                </td>
                              )}
                              {visibleColumns.includes("transporterName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.transporterName}
                                </td>
                              )}
                              {visibleColumns.includes("vehicleNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.vehicleNumber}
                                </td>
                              )}
                              {visibleColumns.includes("brandName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.brandName}
                                </td>
                              )}
                              {visibleColumns.includes("dispatchQty") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.dispatchQty}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredPendingData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No pending final weight records found.
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
                            No historical final weight records found.
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
                              Action
                            </th>
                            {visibleColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial Number
                              </th>
                            )}
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Weighment Date
                            </th>
                            {visibleColumns.includes("partyName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Party Name
                              </th>
                            )}
                            {visibleColumns.includes("erpDoNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ERP DO No.
                              </th>
                            )}
                            {visibleColumns.includes("vehicleNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle Number
                              </th>
                            )}
                            {visibleColumns.includes("brandName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand Name
                              </th>
                            )}
                            {visibleColumns.includes("dispatchQty") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dispatch Qty
                              </th>
                            )}
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Final Weight
                            </th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Weighment Copy
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredHistoryData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                >
                                  Edit
                                </button>
                              </td>
                              {visibleColumns.includes("serialNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.serialNumber}
                                </td>
                              )}
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.actual5
                                  ? new Date(item.actual5).toLocaleString()
                                  : "-"}
                              </td>
                              {visibleColumns.includes("partyName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.partyName}
                                </td>
                              )}
                              {visibleColumns.includes("erpDoNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.erpDoNo}
                                </td>
                              )}
                              {visibleColumns.includes("vehicleNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.vehicleNumber}
                                </td>
                              )}
                              {visibleColumns.includes("brandName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.brandName}
                                </td>
                              )}
                              {visibleColumns.includes("dispatchQty") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.dispatchQty}
                                </td>
                              )}
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.finalWeight || "-"}
                              </td>
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.weighmentCopy ? (
                                  <button
                                    onClick={(e) =>
                                      handleViewPDF(item.weighmentCopy, e)
                                    }
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium px-2 py-1 rounded transition-colors"
                                    type="button"
                                  >
                                    View PDF
                                  </button>
                                ) : (
                                  <span className="text-gray-400">No file</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredHistoryData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No historical final weight records found.
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

export default FinalWeight;