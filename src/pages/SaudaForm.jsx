import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Filter,
  Search,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { Select } from "antd";
import CustomSelect from "../utils/CustomSelect";

const SaudaForm = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saudaData, setSaudaData] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const brandDropdownRef = useRef(null);
  const { Option } = Select;
  const [partyOptions, setPartyOptions] = useState([]);
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const partyDropdownRef = useRef(null);
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    pending: {
      saudaNumber: true,
      dateOfSauda: true,
      brokerName: true,
      partyName: true,
      dealerName: true,
      rate: true,
      orderQuantity: true,
      partyWhatsApp: true,
      contactPersonName: true,
      status: true,
      action: true,
    },
    history: {
      saudaNumber: true,
      dateOfSauda: true,
      brokerName: true,
      partyName: true,
      dealerName: true,
      rate: true,
      orderQuantity: true,
      partyWhatsApp: true,
      contactPersonName: true,
      status: true,
      action: true,
    },
  });

  // Dropdown state and ref
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState({
    show: false,
    sauda: null,
  });

  const [cancelForm, setCancelForm] = useState({
    saudaNumber: "",
    quantity: "",
    remarks: "",
  });

  const [formData, setFormData] = useState({
    dateOfSauda: "",
    brokerName: "",
    partyName: "",
    dealerName: "",
    rate: "",
    orderQuantity: "",
    partyWhatsApp: "",
    contactPersonName: "",
    pendingQty: "Pending",
    brandName: "", // Add this line
  });

  // Column options for the dropdown
  const columnOptions = [
    { id: "saudaNumber", label: "Sauda No." },
    { id: "dateOfSauda", label: "Date Of Sauda" },
    { id: "brokerName", label: "Broker Name" },
    { id: "partyName", label: "Party Name" },
    { id: "dealerName", label: "Dealer Name" },
    { id: "rate", label: "Rate" },
    { id: "orderQuantity", label: "Order Quantity (Ton)" },
    { id: "partyWhatsApp", label: "Party WhatsApp" },
    { id: "contactPersonName", label: "Contact Person" },
    { id: "status", label: "Status" },
    { id: "action", label: "Action" },
  ];

  // reset form data
  const resetFormData = () => {
    setFormData({
      dateOfSauda: "",
      brokerName: "",
      partyName: "",
      dealerName: "",
      rate: "",
      orderQuantity: "",
      partyWhatsApp: "",
      contactPersonName: "",
      pendingQty: "Pending",
      brandName: "",
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
      if (
        partyDropdownRef.current &&
        !partyDropdownRef.current.contains(event.target)
      ) {
        setShowPartyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleColumnVisibility = (tab, columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [columnId]: !prev[tab][columnId],
      },
    }));
  };

  // Fetch brand options from Main Master sheet column G
  const fetchBrandOptions = async () => {
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheetId=13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY&sheetName=Main Master`
      );
      const result = await response.json();

      if (result.success && result.data) {
        // Extract brands from column A (index 0) instead of column G (index 6)
        const brands = result.data
          .slice(1) // Skip header row
          .map((row) => row[0]) // Column A
          .filter((brand) => brand && brand.trim() !== "")
          .map((brand) => brand.trim());

        // Remove duplicates and sort
        const uniqueBrands = [...new Set(brands)].sort();
        setBrandOptions(uniqueBrands);
      }
    } catch (error) {
      console.error("Error fetching brand options:", error);
      toast.error("Failed to load brand options");
    }
  };

  const fetchPartyOptions = async () => {
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheetId=13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY&sheetName=Main Master`
      );
      const result = await response.json();

      if (result.success && result.data) {
        // Extract party names from column G (index 6)
        const parties = result.data
          .slice(1) // Skip header row
          .map((row) => row[6]) // Column G
          .filter((party) => party && party.trim() !== "")
          .map((party) => party.trim());

        // Remove duplicates and sort
        const uniqueParties = [...new Set(parties)].sort();
        setPartyOptions(uniqueParties);
      }
    } catch (error) {
      console.error("Error fetching party options:", error);
      toast.error("Failed to load party options");
    }
  };

  const addNewPartyToMaster = async (partyName) => {
    try {
      const rowData = ["", "", "", "", "", "", partyName.trim()]; // Party name in column G (index 6)

      const encodedSheetName = encodeURIComponent("Main Master");

      const payload = new URLSearchParams();
      payload.append("action", "insert");
      payload.append("sheetName", encodedSheetName);
      payload.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload.toString(),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to add party");
      }

      await fetchPartyOptions();
      toast.success(`Party "${partyName}" added successfully!`);
      return true;
    } catch (error) {
      console.error("Error adding party:", error);
      toast.error(`Failed to add party: ${error.message}`);
      return false;
    }
  };

  // Add new brand to Main Master sheet
  const addNewBrandToMaster = async (brandName) => {
    try {
      const rowData = [brandName.trim()]; // Only column A data

      // Encode sheet name properly
      const encodedSheetName = encodeURIComponent("Main Master");

      const payload = new URLSearchParams();
      payload.append("action", "insertBrandOnly");
      payload.append("sheetName", encodedSheetName);
      payload.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload.toString(),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to add brand");
      }

      await fetchBrandOptions();
      toast.success(`Brand "${brandName}" added successfully!`);
      return true;
    } catch (error) {
      console.error("Error adding brand:", error);
      toast.error(`Failed to add brand: ${error.message}`);
      return false;
    }
  };

  const fetchSaudaData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheetId=13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY&sheetName=SaudaForm`
      );

      const result = await response.json();

      if (result.success && result.data) {
        const dataRows = result.data.slice(5).filter((row) => row.length > 0);

        const transformedData = dataRows.map((row, index) => {
          // Fixed: Column L is index 11 (0-based), Column N is index 13
          const pendingQty = row[11] ? String(row[11]).trim() : ""; // Column L
          const completed = row[13] ? String(row[13]).trim() : "Pending"; // Column N

          return {
            id: index + 1,
            timestamp: row[0] || "",
            saudaNumber: row[1] || "",
            dateOfSauda: row[2] || "",
            brokerName: row[3] || "",
            partyName: row[4] || "",
            dealerName: row[5] || "",
            rate: row[6] || "",
            orderQuantity: row[7] || "",
            partyWhatsApp: row[8] || "",
            contactPersonName: row[9] || "",
            pendingQty: pendingQty, // Data from Column L
            completed: completed, // Data from Column N
          };
        });

        // Fetch all data, not filtering by pending/complete
        setSaudaData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching sauda data:", error);
      toast.error("Failed to load sauda data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaudaData();
    fetchBrandOptions();
    fetchPartyOptions(); // Add this line
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchSaudaData();
      await fetchBrandOptions();
      await fetchPartyOptions(); // Add this line
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  function getFormattedDateTime() {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const postToGoogleSheet = async (data) => {
    try {

      console.log("Data to submit:", data);
      const currentDateTime = getFormattedDateTime();

      // Prepare rowData - the SN will be auto-generated by the server
      const rowData = [
        currentDateTime, // Timestamp (column A)
        "", // Sauda Number (column B) - will be auto-generated
        data.dateOfSauda,
        data.brokerName,
        data.partyName,
        data.dealerName,
        data.rate,
        data.orderQuantity,
        data.partyWhatsApp,
        data.contactPersonName,
        "", // Empty (column K)
        "", // PendingQty (column L) - initially empty
        "", // Empty (column M)
        "",
        "", // Empty (column O)
        data.brandName || "", // Brand Name (column P)
      ];

      // Use the new insertWithSN action for atomic SN generation
      const params = new URLSearchParams();
      params.append("action", "insertWithSN");
      params.append("sheetName", "SaudaForm");
      params.append("rowData", JSON.stringify(rowData));

      // Convert to string and replace + with %20 (proper space encoding)
      const bodyString = params.toString().replace(/\+/g, "%20");

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyString,
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Google Sheets API returned failure");
      }

      return {
        success: true,
        saudaNumber: result.generatedSN, // Server returns the generated SN
        message: result.message,
      };
    } catch (error) {
      console.error("Google Sheets Error:", error);
      throw new Error(`Failed to save to Google Sheets: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await postToGoogleSheet(formData);

      toast.success(`Sauda added successfully!`);
      setFormData({
        dateOfSauda: "",
        brokerName: "",
        partyName: "",
        dealerName: "",
        rate: "",
        orderQuantity: "",
        partyWhatsApp: "",
        contactPersonName: "",
        pendingQty: "Pending",
        brandName: "", // Add this line
      });
      setShowModal(false);
      fetchSaudaData();
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.message || "Failed to add sauda");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated filtering logic to use correct column data
  const filteredPendingData = saudaData.filter(
    (item) => item.completed === "Pending"
  );
  const filteredHistoryData = saudaData.filter(
    (item) => item.completed === "Complete"
  );

  const currentTabData =
    activeTab === "pending" ? filteredPendingData : filteredHistoryData;

  const filteredData = currentTabData
    .filter((item) => {
      const matchesSearch =
        item.brokerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dealerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand =
        filterBrand === "all" || item.dealerName === filterBrand;
      return matchesSearch && matchesBrand;
    })
    .reverse();

  const uniqueBrands = [
    ...new Set(saudaData.map((item) => item.dealerName).filter(Boolean)),
  ];

  const handleSubmitClose = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentDateTime = getFormattedDateTime();
      const rowData = [
        currentDateTime, // Column A - Timestamp
        cancelForm.saudaNumber, // Column B - Sauda Number
        cancelForm.quantity, // Column C - Quantity
        cancelForm.remarks, // Column D - Remarks
      ];

      const formData = new URLSearchParams();
      formData.append("action", "insert");
      formData.append("sheetName", "Cancel");
      formData.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to save cancellation to Google Sheets"
        );
      }

      toast.success(
        `Sauda ${cancelForm.saudaNumber} cancellation submitted successfully!`
      );
      setShowCancelModal({ show: false, sauda: null });
      setCancelForm({ saudaNumber: "", quantity: "", remarks: "" });
      fetchSaudaData();
    } catch (error) {
      console.error("Cancellation Error:", error);
      toast.error(error.message || "Failed to submit cancellation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter brand options based on search
  const filteredBrandOptions =
    formData.brandName && formData.brandName.trim() !== ""
      ? brandOptions.filter((brand) =>
        brand.toLowerCase().includes(formData.brandName.toLowerCase())
      )
      : brandOptions;

  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brandName: brand }));
    setShowBrandDropdown(false);
  };

  const filteredPartyOptions =
    formData.partyName && formData.partyName.trim() !== ""
      ? partyOptions.filter((party) =>
        party.toLowerCase().includes(formData.partyName.toLowerCase())
      )
      : partyOptions;

  const handlePartySelect = (party) => {
    setFormData((prev) => ({ ...prev, partyName: party }));
    setShowPartyDropdown(false);
  };

  const handleAddNewParty = async () => {
    if (
      formData.partyName &&
      formData.partyName.trim() !== "" &&
      !partyOptions.includes(formData.partyName.trim())
    ) {
      setIsAddingParty(true);
      const success = await addNewPartyToMaster(formData.partyName.trim());
      if (success) {
        // Refresh party options and keep the selected value
        await fetchPartyOptions();
        setFormData(prev => ({ ...prev, partyName: formData.partyName.trim() }));
        toast.success(`Party "${formData.partyName.trim()}" added successfully!`);
      }
      setIsAddingParty(false);
    }
  };

  const handleAddNewBrand = async () => {
    if (
      formData.brandName &&
      formData.brandName.trim() &&
      !brandOptions.includes(formData.brandName.trim())
    ) {
      setIsAddingBrand(true);
      const success = await addNewBrandToMaster(formData.brandName.trim());
      if (success) {
        await fetchBrandOptions();
        setFormData(prev => ({ ...prev, brandName: formData.brandName.trim() }));
        toast.success(`Brand "${formData.brandName.trim()}" added successfully!`);
      }
      setIsAddingBrand(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">SaudaForm</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              resetFormData();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Plus size={16} className="mr-2" />
            New Sauda
          </button>

          {/* // Also modify the close button in the modal to reset the form */}
          <button
            onClick={() => {
              resetFormData();
              setShowModal(false);
            }}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by broker, party or dealer name..."
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
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="all">All Dealers</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          {/* Column visibility dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye size={16} className="mr-2" />
              Columns
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {columnOptions.map((column) => (
                    <div key={column.id} className="px-4 py-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={columnVisibility[activeTab][column.id]}
                          onChange={() =>
                            toggleColumnVisibility(activeTab, column.id)
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{column.label}</span>
                      </label>
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
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === "pending"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === "history"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("history")}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Complete ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 ml-2">Loading data...</span>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columnVisibility[activeTab].saudaNumber && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sauda No.
                    </th>
                  )}
                  {columnVisibility[activeTab].dateOfSauda && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Of Sauda
                    </th>
                  )}
                  {columnVisibility[activeTab].brokerName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker Name
                    </th>
                  )}
                  {columnVisibility[activeTab].partyName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party Name
                    </th>
                  )}
                  {columnVisibility[activeTab].dealerName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer Name
                    </th>
                  )}
                  {columnVisibility[activeTab].rate && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                  )}
                  {columnVisibility[activeTab].orderQuantity && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Quantity (Ton)
                    </th>
                  )}
                  {columnVisibility[activeTab].partyWhatsApp && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party WhatsApp
                    </th>
                  )}
                  {columnVisibility[activeTab].contactPersonName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                  )}
                  {columnVisibility[activeTab].status && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending Qty
                    </th>
                  )}
                  {activeTab === "pending" &&
                    columnVisibility[activeTab].action && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {columnVisibility[activeTab].saudaNumber && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.saudaNumber || "-"}
                      </td>
                    )}
                    {columnVisibility[activeTab].dateOfSauda && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.dateOfSauda
                          ? new Date(item.dateOfSauda).toLocaleDateString()
                          : "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].brokerName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.brokerName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].partyName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.partyName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].dealerName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.dealerName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].rate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.rate || "0"}
                      </td>
                    )}
                    {columnVisibility[activeTab].orderQuantity && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.orderQuantity || "0"}
                      </td>
                    )}
                    {columnVisibility[activeTab].partyWhatsApp && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.partyWhatsApp || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].contactPersonName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.contactPersonName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].status && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${item.completed === "Complete"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                            }`}
                        >
                          {item.pendingQty || "N/A"}
                        </span>
                      </td>
                    )}
                    {activeTab === "pending" &&
                      columnVisibility[activeTab].action && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setShowCancelModal({ show: true, sauda: item });
                              setCancelForm({
                                saudaNumber: item.saudaNumber,
                                quantity: "",
                                remarks: "",
                              });
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
                          >
                            Short Close
                          </button>
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-medium">Short Close Sauda</h3>
                <button
                  onClick={() => {
                    setShowCancelModal({ show: false, sauda: null });
                    setCancelForm({
                      saudaNumber: "",
                      quantity: "",
                      remarks: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitClose} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sauda No.
                  </label>
                  <input
                    type="text"
                    value={showCancelModal.sauda?.saudaNumber || ""}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={cancelForm.quantity}
                    onChange={(e) =>
                      setCancelForm({ ...cancelForm, quantity: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={cancelForm.remarks}
                    onChange={(e) =>
                      setCancelForm({ ...cancelForm, remarks: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Enter any remarks or notes..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal({ show: false, sauda: null });
                      setCancelForm({
                        saudaNumber: "",
                        quantity: "",
                        remarks: "",
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
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
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isLoading && filteredData.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No sauda records found.</p>
          </div>
        )}
      </div>

      {/* Main Modal for New Sauda */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">New Sauda</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Of Sauda
                  </label>
                  <input
                    type="date"
                    name="dateOfSauda"
                    value={formData.dateOfSauda}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Broker Name - Simple text input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broker Name
                  </label>
                  <input
                    type="text"
                    name="brokerName"
                    value={formData.brokerName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                    placeholder="Enter broker name..."
                  />
                </div>

                {/* Party Name Field */}
                <div className="relative" ref={partyDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or add party name"
                    value={formData.partyName || undefined}
                    onSearch={(value) => {
                      setFormData(prev => ({ ...prev, partyName: value }));
                    }}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, partyName: value }));
                    }}
                    filterOption={false}
                    notFoundContent={null}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        {formData.partyName &&
                          formData.partyName.trim() !== "" &&
                          !partyOptions.includes(formData.partyName.trim()) && (
                            <div
                              onClick={handleAddNewParty}
                              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200 flex items-center"
                            >
                              {isAddingParty ? (
                                <>
                                  <svg className="animate-spin mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus size={14} className="mr-2" />
                                  Add "{formData.partyName.trim()}" as new party
                                </>
                              )}
                            </div>
                          )}
                      </>
                    )}
                    options={partyOptions.map(party => ({
                      value: party,
                      label: party,
                    }))}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                {/* Dealer Name - Simple text input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dealer Name
                  </label>
                  <input
                    type="text"
                    name="dealerName"
                    value={formData.dealerName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                    placeholder="Enter dealer name..."
                  />
                </div>

                <div className="relative" ref={brandDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or add brand name"
                    value={formData.brandName || undefined}
                    onSearch={(value) => {
                      setFormData(prev => ({ ...prev, brandName: value }));
                    }}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, brandName: value }));
                    }}
                    filterOption={false}
                    notFoundContent={null}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        {formData.brandName &&
                          formData.brandName.trim() !== "" &&
                          !brandOptions.includes(formData.brandName.trim()) && (
                            <div
                              onClick={handleAddNewBrand}
                              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200 flex items-center"
                            >
                              {isAddingBrand ? (
                                <>
                                  <svg className="animate-spin mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus size={14} className="mr-2" />
                                  Add "{formData.brandName.trim()}" as new brand
                                </>
                              )}
                            </div>
                          )}
                      </>
                    )}
                    options={brandOptions.map(brand => ({
                      value: brand,
                      label: brand,
                    }))}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate
                  </label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Quantity (Ton)
                  </label>
                  <input
                    type="number"
                    name="orderQuantity"
                    value={formData.orderQuantity}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="partyWhatsApp"
                    value={formData.partyWhatsApp}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
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
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaudaForm;
