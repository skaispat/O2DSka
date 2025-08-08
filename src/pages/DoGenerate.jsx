import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Filter, Search, RefreshCw, Eye } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const DoGenerate = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandOptions, setBrandOptions] = useState([]);
  const [deliveryTermOptions, setDeliveryTermOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doData, setDoData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changeVehicalNo, setChangeVehicalNo] = useState(false);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    serialNumber: true,
    partyName: true,
    erpDoNo: true,
    transporterName: true,
    lrNumber: true,
    vehicleNumber: true,
    deliveryTerm: true,
    brandName: true,
    dispatchQty: true,
    editVehicleNumber: true,
  });

  // Dropdown state and ref
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editedVehicleNumbers, setEditedVehicleNumbers] = useState({});

  const [transporterName, setTransporterName] = useState([]);
  const [selectedTransporter, setSelectedTransporter] = useState("");

  const [formData, setFormData] = useState({
    partyName: "",
    erpDoNo: "",
    transporterName: "",
    lrNumber: "",
    vehicleNumber: "",
    deliveryTerm: "",
    brandName: "",
    dispatchQty: "",
  });

  // Column options for the dropdown
  const columnOptions = [
    { id: "serialNumber", label: "Serial Number" },
    { id: "partyName", label: "Party Name" },
    { id: "erpDoNo", label: "ERP DO No." },
    { id: "transporterName", label: "Transporter Name" },
    { id: "lrNumber", label: "LR Number" },
    { id: "vehicleNumber", label: "Vehicle Number" },
    { id: "deliveryTerm", label: "Delivery Term" },
    { id: "brandName", label: "Brand Name" },
    { id: "dispatchQty", label: "Dispatch Qty" },
    { id: "editVehicleNumber", label: "Edit Vehicle Number" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleColumnVisibility = (columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  useEffect(() => {
    const fetchDOData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const parsed = json.data.slice(6).map((row, index) => ({
            id: index + 1,
            serialNumber: row[1],
            partyName: row[2],
            erpDoNo: row[3],
            transporterName: row[4],
            lrNumber: row[5],
            vehicleNumber: row[6],
            deliveryTerm: row[7],
            brandName: row[8],
            dispatchQty: row[9],
            timestamp: row[0],
            completed: false,
          }));

          const sortedData = parsed.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            const aNum = parseInt(a.serialNumber?.split("-")[1]) || 0;
            const bNum = parseInt(b.serialNumber?.split("-")[1]) || 0;
            return bNum - aNum;
          });

          setDoData(sortedData);
        } else {
          setDoData([]);
        }
      } catch (err) {
        console.error("Failed to fetch DO Data:", err);
        toast.error("Failed to load DO data");
      } finally {
        setLoading(false);
      }
    };

    fetchDOData();
  }, [refreshData]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master"
        );
        const data = await response.json();
        if (data.success && data.data && data.data.length > 1) {
          const brands = data.data
            .slice(1)
            .map((row) => (row[0] ? row[0].toString().trim() : ""))
            .filter((brand) => brand !== "");

          const deliveryTerms = data.data
            .slice(1)
            .map((row) => (row[1] ? row[1].toString().trim() : ""))
            .filter((term) => term !== "");

          setBrandOptions([...new Set(brands.filter((b) => b))]);
          setDeliveryTermOptions([...new Set(deliveryTerms.filter((t) => t))]);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
        setBrandOptions([]);
        setDeliveryTermOptions([]);
      }
    };

    fetchMasterData();
  }, []);

  const getTransporterNames = (sheetData) => {
    return sheetData
      .slice(1)
      .map((row) => row[5])
      .filter((name) => name && name.trim() !== "");
  };

  const fetchMainMasterData = async () => {
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheetId=13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY&sheetName=Main%20Master"
      );

      const data = await res.json();

      if (data.success) {
        const transporterNames = getTransporterNames(data.data);
        setTransporterName(transporterNames);
      } else {
        console.error("Error fetching data:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMainMasterData();
  }, []);

  const handleRefresh = () => {
    setRefreshData((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const timeStemp = getFormattedDateTime();
      console.log("timeStemp", timeStemp);

      const existingSaudaNumbers = doData
        .map((item) => item.serialNumber)
        .filter(Boolean)
        .map((sn) => parseInt(sn?.split("-")[1]))
        .filter((num) => !isNaN(num));

      const lastNumber =
        existingSaudaNumbers.length > 0 ? Math.max(...existingSaudaNumbers) : 0;
      const odNumber = `ORD-${String(lastNumber + 1).padStart(3, "0")}`;
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
            action: "insert",
            rowData: JSON.stringify([
              timeStemp,
              odNumber,
              data.partyName,
              data.erpDoNo,
              selectedTransporter,
              data.lrNumber,
              data.vehicleNumber,
              data.deliveryTerm,
              data.brandName,
              data.dispatchQty,
            ]),
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save to Google Sheet");
      }
      return result;
    } catch (error) {
      console.error("Error posting to Google Sheet:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await postToGoogleSheet(formData);
      toast.success("DO generated and saved successfully!");
      setFormData({
        partyName: "",
        erpDoNo: "",
        transporterName: "",
        lrNumber: "",
        vehicleNumber: "",
        deliveryTerm: "",
        brandName: "",
        dispatchQty: "",
      });
      setSelectedTransporter("");
      setShowModal(false);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save DO. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = doData
    .filter((item) => {
      const matchesSearch = item.partyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !item.completed) ||
        (statusFilter === "complete" && item.completed);
      return matchesSearch && matchesParty && matchesStatus;
    });
    

  const uniqueParties = [...new Set(doData.map((item) => item.partyName))];

  const handleSubmitVehicleNumber = async (id, orderNo) => {
    try {
      const vehicleNumber = editedVehicleNumbers[id];
      setChangeVehicalNo(true);
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
            sheetName: "INVOICE-DELIVERY",
            action: "updateVehicleByOrderNo",
            orderNo: orderNo,
            vehicleNumber: vehicleNumber,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Vehicle number updated successfully!");
        setEditingId(null);
      } else {
        setEditingId(null);
        throw new Error(result.error || "Failed to update vehicle number");
      }
    } catch (error) {
      console.error("Error updating vehicle number:", error);
      toast.error("Failed to update vehicle number");
    } finally {
      setChangeVehicalNo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">DO Generate</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Generate DO
          </button>
        </div>
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
                          checked={columnVisibility[column.id]}
                          onChange={() => toggleColumnVisibility(column.id)}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 ml-2">Loading data...</span>
          </div>
        ) : (
          <>
            <div className="h-96 overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto h-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columnVisibility.serialNumber && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                    )}
                    {columnVisibility.partyName && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Party Name
                      </th>
                    )}
                    {columnVisibility.erpDoNo && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ERP DO No.
                      </th>
                    )}
                    {columnVisibility.transporterName && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transporter Name
                      </th>
                    )}
                    {columnVisibility.lrNumber && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LR Number
                      </th>
                    )}
                    {columnVisibility.vehicleNumber && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Number
                      </th>
                    )}
                    {columnVisibility.deliveryTerm && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Term
                      </th>
                    )}
                    {columnVisibility.brandName && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand Name
                      </th>
                    )}
                    {columnVisibility.dispatchQty && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispatch Qty
                      </th>
                    )}
                    {columnVisibility.editVehicleNumber && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edit Vehicle Number
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {columnVisibility.serialNumber && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.serialNumber}
                        </td>
                      )}
                      {columnVisibility.partyName && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.partyName}
                        </td>
                      )}
                      {columnVisibility.erpDoNo && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.erpDoNo}
                        </td>
                      )}
                      {columnVisibility.transporterName && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.transporterName}
                        </td>
                      )}
                      {columnVisibility.lrNumber && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.lrNumber}
                        </td>
                      )}
                      {columnVisibility.vehicleNumber && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              value={
                                editedVehicleNumbers[item.id] ||
                                item.vehicleNumber
                              }
                              onChange={(e) =>
                                setEditedVehicleNumbers({
                                  ...editedVehicleNumbers,
                                  [item.id]: e.target.value,
                                })
                              }
                              className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            />
                          ) : (
                            item.vehicleNumber
                          )}
                        </td>
                      )}
                      {columnVisibility.deliveryTerm && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.deliveryTerm}
                        </td>
                      )}
                      {columnVisibility.brandName && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.brandName}
                        </td>
                      )}
                      {columnVisibility.dispatchQty && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.dispatchQty}
                        </td>
                      )}
                      {columnVisibility.editVehicleNumber && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingId === item.id ? (
                            <button
                              onClick={() =>
                                handleSubmitVehicleNumber(
                                  item.id,
                                  item.serialNumber
                                )
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              {changeVehicalNo ? "Submiting..." : "Submit"}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditedVehicleNumbers({
                                  ...editedVehicleNumbers,
                                  [item.id]: item.vehicleNumber,
                                });
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            {filteredData.length === 0 && !loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No DO records found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Generate DO</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ERP DO No. *
                  </label>
                  <input
                    type="text"
                    name="erpDoNo"
                    value={formData.erpDoNo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transporter Name
                  </label>
                  <select
                    value={selectedTransporter}
                    onChange={(e) => setSelectedTransporter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Transporter</option>
                    {transporterName.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LR Number
                  </label>
                  <input
                    type="text"
                    name="lrNumber"
                    value={formData.lrNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Term *
                  </label>
                  <select
                    name="deliveryTerm"
                    value={formData.deliveryTerm}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Delivery Term</option>
                    {deliveryTermOptions.map((term, index) => (
                      <option key={index} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <select
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Brand Name</option>
                    {brandOptions.map((brand, index) => (
                      <option key={index} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dispatch Qty *
                  </label>
                  <input
                    type="number"
                    name="dispatchQty"
                    value={formData.dispatchQty}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
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

export default DoGenerate;