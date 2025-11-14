import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Filter, Search, RefreshCw, Eye, ChevronDown, ChevronUp } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { Select } from "antd";
import supabase from "../SupabaseClient";

const DoGenerate = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [brandOptions, setBrandOptions] = useState([]);
  const [deliveryTermOptions, setDeliveryTermOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doData, setDoData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changeVehicalNo, setChangeVehicalNo] = useState(false);
  const { Option } = Select;
  const [partyNames, setPartyNames] = useState([]);
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [isAddingTransporter, setIsAddingTransporter] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

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

  // Check mobile view
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

  // Add this function to reset the form data
  const resetFormData = () => {
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
  };

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

  // Fetch DO data from Supabase
  const fetchDOData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_invoice')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedData = data.map((item, index) => ({
          id: item.id,
          serialNumber: item.order_no || `DO-${item.id}`,
          partyName: item.party_name,
          erpDoNo: item.erp_do_no,
          transporterName: item.transporter_name,
          lrNumber: item.lr_number,
          vehicleNumber: item.vehicle_number,
          deliveryTerm: item.delivery_term,
          brandName: item.brand_name,
          dispatchQty: item.dispatch_qty,
          timestamp: item.timestamp,
          completed: false,
        }));

        setDoData(transformedData);
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

  // Fetch dropdown options from Supabase
  const fetchDropdownOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('dropdown')
        .select('*');

      if (error) throw error;

      if (data) {
        // Extract unique values for each dropdown
        const brands = [...new Set(data.map(item => item.brand_name).filter(Boolean))].sort();
        const parties = [...new Set(data.map(item => item.party_name).filter(Boolean))].sort();
        const transporters = [...new Set(data.map(item => item.transporter_name).filter(Boolean))].sort();
        const deliveryTerms = [...new Set(data.map(item => item.delivery_terms).filter(Boolean))].sort();
        
        setBrandOptions(brands);
        setPartyNames(parties);
        setTransporterName(transporters);
        setDeliveryTermOptions(deliveryTerms);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load dropdown options");
    }
  };

  useEffect(() => {
    fetchDOData();
    fetchDropdownOptions();
  }, [refreshData]);

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

  // Add new option to dropdown table
  const addNewDropdownOption = async (fieldName, value) => {
    try {
      const newOption = {
        [fieldName]: value.trim(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('dropdown')
        .insert([newOption])
        .select();

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error adding ${fieldName}:`, error);
      throw new Error(`Failed to add ${fieldName}`);
    }
  };

  const handleAddNewParty = async () => {
    if (formData.partyName && formData.partyName.trim() !== "") {
      setIsAddingParty(true);
      try {
        await addNewDropdownOption('party_name', formData.partyName);
        await fetchDropdownOptions();
        toast.success(`Party "${formData.partyName.trim()}" added successfully!`);
      } catch (error) {
        toast.error(`Failed to add party: ${error.message}`);
      } finally {
        setIsAddingParty(false);
      }
    }
  };

  const handleAddNewTransporter = async () => {
    if (selectedTransporter && selectedTransporter.trim() !== "") {
      setIsAddingTransporter(true);
      try {
        await addNewDropdownOption('transporter_name', selectedTransporter);
        await fetchDropdownOptions();
        toast.success(`Transporter "${selectedTransporter.trim()}" added successfully!`);
      } catch (error) {
        toast.error(`Failed to add transporter: ${error.message}`);
      } finally {
        setIsAddingTransporter(false);
      }
    }
  };

  const handleAddNewBrand = async () => {
    if (formData.brandName && formData.brandName.trim() !== "") {
      setIsAddingBrand(true);
      try {
        await addNewDropdownOption('brand_name', formData.brandName);
        await fetchDropdownOptions();
        toast.success(`Brand "${formData.brandName.trim()}" added successfully!`);
      } catch (error) {
        toast.error(`Failed to add brand: ${error.message}`);
      } finally {
        setIsAddingBrand(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const indianTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    const formatToMySQLDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };


    try {
      // Prepare data for Supabase insertion
      const orderData = {
        timestamp:formatToMySQLDateTime(indianTime),
        // order_no: `DO-${Date.now()}`,
        erp_do_no: formData.erpDoNo,
        party_name: formData.partyName,
        transporter_name: selectedTransporter,
        lr_number: formData.lrNumber,
        vehicle_number: formData.vehicleNumber,
        delivery_term: formData.deliveryTerm,
        brand_name: formData.brandName,
        dispatch_qty: formData.dispatchQty,
        // planned1: new Date().toLocaleString("en-IN", { 
        //   timeZone: "Asia/Kolkata", 
        //   hour12: false 
        // }),
      };

      // Insert into Supabase order_invoice table
      const { data, error } = await supabase
        .from('order_invoice')
        .insert([orderData])
        .select();

      if (error) {
        throw new Error(`Supabase Error: ${error.message}`);
      }

      toast.success("DO generated and saved successfully!");
      
      // Reset form
      resetFormData();
      setShowModal(false);
      fetchDOData(); // Refresh the data
      
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save DO. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update vehicle number in Supabase
 const handleSubmitVehicleNumber = async (id, orderNo) => {
  try {
    const vehicleNumber = editedVehicleNumbers[id];
    setChangeVehicalNo(true);

    // Execute both updates in parallel
    const [orderInvoiceUpdate, invoiceDeliveryUpdate] = await Promise.allSettled([
      // Always update order_invoice
      supabase
        .from('order_invoice')
        .update({ 
          vehicle_number: vehicleNumber,
        })
        .eq('order_no', orderNo),

      // Update invoice_delivery only if it exists (this will fail silently if order doesn't exist)
      supabase
        .from('invoice_delivery')
        .update({ 
          vehicle_number: vehicleNumber,
        })
        .eq('order_no', orderNo)
    ]);

    // Check if order_invoice update was successful
    if (orderInvoiceUpdate.status === 'rejected') {
      throw new Error(`Order invoice update failed: ${orderInvoiceUpdate.reason.message}`);
    }

    // Log invoice_delivery update result (success or failure is acceptable)
    if (invoiceDeliveryUpdate.status === 'rejected') {
      console.warn("Invoice delivery update failed (order might not exist):", invoiceDeliveryUpdate.reason.message);
    }

    toast.success("Vehicle number updated successfully!");

    // Update local state
    setDoData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? { ...item, vehicleNumber: vehicleNumber }
          : item
      )
    );

    setEditingId(null);
  } catch (error) {
    console.error("Error updating vehicle number:", error);
    toast.error("Failed to update vehicle number");
    setEditingId(null);
  } finally {
    setChangeVehicalNo(false);
  }
};

  // Case-insensitive search for all fields
  const filteredData = doData.filter((item) => {
    const partyName = String(item.partyName || "").toLowerCase();
    const serialNumber = String(item.serialNumber || "").toLowerCase();
    const erpDoNo = String(item.erpDoNo || "").toLowerCase();
    const transporterName = String(item.transporterName || "").toLowerCase();
    const vehicleNumber = String(item.vehicleNumber || "").toLowerCase();
    const lrNumber = String(item.lrNumber || "").toLowerCase();
    const deliveryTerm = String(item.deliveryTerm || "").toLowerCase();
    const brandName = String(item.brandName || "").toLowerCase();
    const dispatchQty = String(item.dispatchQty || "").toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      partyName.includes(searchLower) ||
      serialNumber.includes(searchLower) ||
      erpDoNo.includes(searchLower) ||
      transporterName.includes(searchLower) ||
      vehicleNumber.includes(searchLower) ||
      lrNumber.includes(searchLower) ||
      deliveryTerm.includes(searchLower) ||
      brandName.includes(searchLower) ||
      dispatchQty.includes(searchLower);

    const matchesParty = filterParty === "all" || item.partyName === filterParty;

    return matchesSearch && matchesParty;
  });

  const uniqueParties = [...new Set(doData.map((item) => item.partyName))];

  const toggleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Render table for desktop view with fixed header and scroll
  const renderTable = () => (
    <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columnVisibility.serialNumber && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Serial Number
              </th>
            )}
            {columnVisibility.partyName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Party Name
              </th>
            )}
            {columnVisibility.erpDoNo && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                ERP DO No.
              </th>
            )}
            {columnVisibility.transporterName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Transporter Name
              </th>
            )}
            {columnVisibility.lrNumber && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                LR Number
              </th>
            )}
            {columnVisibility.vehicleNumber && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Vehicle Number
              </th>
            )}
            {columnVisibility.deliveryTerm && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Delivery Term
              </th>
            )}
            {columnVisibility.brandName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Brand Name
              </th>
            )}
            {columnVisibility.dispatchQty && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Dispatch Qty
              </th>
            )}
            {columnVisibility.editVehicleNumber && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Edit Vehicle Number
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columnVisibility.serialNumber && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.serialNumber}
                </td>
              )}
              {columnVisibility.partyName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.partyName}
                </td>
              )}
              {columnVisibility.erpDoNo && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.erpDoNo}
                </td>
              )}
              {columnVisibility.transporterName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.transporterName}
                </td>
              )}
              {columnVisibility.lrNumber && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.lrNumber}
                </td>
              )}
              {columnVisibility.vehicleNumber && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    />
                  ) : (
                    item.vehicleNumber
                  )}
                </td>
              )}
              {columnVisibility.deliveryTerm && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.deliveryTerm}
                </td>
              )}
              {columnVisibility.brandName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.brandName}
                </td>
              )}
              {columnVisibility.dispatchQty && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.dispatchQty}
                </td>
              )}
              {columnVisibility.editVehicleNumber && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === item.id ? (
                    <button
                      onClick={() =>
                        handleSubmitVehicleNumber(
                          item.id,
                          item.serialNumber
                        )
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                    >
                      {changeVehicalNo ? "Submitting..." : "Submit"}
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
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
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
  );

  // Render cards for mobile view with scroll
  const renderCards = () => (
    <div className="space-y-3 p-3" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      {filteredData.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div 
            className="p-4 cursor-pointer"
            onClick={() => toggleCardExpand(item.id)}
          >
            {/* Header with Serial Number and Expand Button */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                {columnVisibility.serialNumber && (
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {item.serialNumber}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardExpand(item.id);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {expandedCard === item.id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
            </div>

            {/* Essential Info */}
            <div className="space-y-2">
              {columnVisibility.partyName && item.partyName && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Party:</span>
                  <span className="font-medium text-sm">{item.partyName}</span>
                </div>
              )}
              
              {columnVisibility.erpDoNo && item.erpDoNo && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">ERP DO No:</span>
                  <span className="font-medium text-sm">{item.erpDoNo}</span>
                </div>
              )}

              {columnVisibility.vehicleNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Vehicle No:</span>
                  <span className="font-medium text-sm">
                    {item.vehicleNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Button for Mobile - Only show when NOT editing and card is collapsed */}
            {columnVisibility.editVehicleNumber && !editingId && expandedCard !== item.id && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(item.id);
                    setEditedVehicleNumbers({
                      ...editedVehicleNumbers,
                      [item.id]: item.vehicleNumber,
                    });
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  Edit Vehicle Number
                </button>
              </div>
            )}
          </div>

          {/* Expanded Details */}
          {expandedCard === item.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2 text-sm">
                {columnVisibility.transporterName && item.transporterName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transporter:</span>
                    <span className="font-medium">{item.transporterName}</span>
                  </div>
                )}
                
                {columnVisibility.lrNumber && item.lrNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">LR Number:</span>
                    <span className="font-medium">{item.lrNumber}</span>
                  </div>
                )}
                
                {columnVisibility.deliveryTerm && item.deliveryTerm && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Term:</span>
                    <span className="font-medium">{item.deliveryTerm}</span>
                  </div>
                )}
                
                {columnVisibility.brandName && item.brandName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium">{item.brandName}</span>
                  </div>
                )}
                
                {columnVisibility.dispatchQty && item.dispatchQty && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dispatch Qty:</span>
                    <span className="font-medium">{item.dispatchQty}</span>
                  </div>
                )}

                {/* Vehicle Number Input in Expanded View */}
                {columnVisibility.vehicleNumber && editingId === item.id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Vehicle No:</span>
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
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>

              {/* Edit/Submit Button at Bottom of Expanded Card */}
              {columnVisibility.editVehicleNumber && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  {editingId === item.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitVehicleNumber(item.id, item.serialNumber);
                      }}
                      className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                    >
                      {changeVehicalNo ? "Submitting..." : "Submit Vehicle Number"}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(item.id);
                        setEditedVehicleNumbers({
                          ...editedVehicleNumbers,
                          [item.id]: item.vehicleNumber,
                        });
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                    >
                      Edit Vehicle Number
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 p-2 md:p-6" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Fixed at top */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">DO Generate</h1>
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
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              resetFormData();
              setShowModal(true);
            }}
            className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            <span className="hidden md:inline">Generate DO</span>
            <span className="md:hidden">New DO</span>
          </button>
        </div>
      </div>

      {/* Filter and Search - Mobile Optimized */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow">
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-full md:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by party, DO number, vehicle, transporter, LR number, delivery term, brand, dispatch qty..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Filters - Side by side on mobile */}
          <div className="flex items-center space-x-2">
            {/* Party Filter - Takes available space */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-300">
                <Filter size={16} className="text-gray-500 flex-shrink-0" />
                <select
                  className="border-0 bg-transparent focus:outline-none focus:ring-0 text-sm w-full truncate"
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
            </div>

            {/* Column visibility dropdown - Fixed width */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-12 sm:w-auto"
              >
                <Eye size={16} />
                <span className="hidden sm:inline ml-1">Columns</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {columnOptions.map((column) => (
                      <div key={column.id} className="px-3 py-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={columnVisibility[column.id]}
                            onChange={() => toggleColumnVisibility(column.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">{column.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table/Cards Container - Fixed height with internal scroll */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 ml-2">Loading data...</span>
          </div>
        ) : (
          <>
            <div className="flex-1">
              {isMobile ? renderCards() : renderTable()}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg font-medium">Generate DO</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Party Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name *
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or add party name"
                    value={formData.partyName || undefined}
                    onSearch={(value) => {
                      setFormData((prev) => ({ ...prev, partyName: value }));
                    }}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, partyName: value }));
                    }}
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={null}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        {formData.partyName &&
                          formData.partyName.trim() !== "" &&
                          !partyNames.includes(formData.partyName.trim()) && (
                            <div
                              onClick={handleAddNewParty}
                              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200 flex items-center"
                            >
                              {isAddingParty ? (
                                <>
                                  <svg
                                    className="animate-spin mr-2 h-4 w-4 text-blue-600"
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
                    options={partyNames.map((party) => ({
                      value: party,
                      label: party,
                    }))}
                    disabled={isSubmitting}
                    className="w-full"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    required
                  />
                </div>

                {/* Transporter Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transporter Name
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or add transporter name"
                    value={selectedTransporter || undefined}
                    onSearch={(value) => setSelectedTransporter(value)}
                    onChange={(value) => setSelectedTransporter(value)}
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={null}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        {selectedTransporter &&
                          selectedTransporter.trim() !== "" &&
                          !transporterName.includes(
                            selectedTransporter.trim()
                          ) && (
                            <div
                              onClick={handleAddNewTransporter}
                              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200 flex items-center"
                            >
                              {isAddingTransporter ? (
                                <>
                                  <svg
                                    className="animate-spin mr-2 h-4 w-4 text-blue-600"
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
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus size={14} className="mr-2" />
                                  Add "{selectedTransporter.trim()}" as new
                                  transporter
                                </>
                              )}
                            </div>
                          )}
                      </>
                    )}
                    options={transporterName.map((transporter) => ({
                      value: transporter,
                      label: transporter,
                    }))}
                    disabled={isSubmitting}
                    className="w-full"
                  />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Term *
                  </label>
                  <Select
                    showSearch
                    placeholder="Select Delivery Term"
                    name="deliveryTerm"
                    value={formData.deliveryTerm || undefined}
                    onChange={(value) =>
                      handleInputChange({
                        target: { name: "deliveryTerm", value },
                      })
                    }
                    className="w-full"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    required
                  >
                    {deliveryTermOptions.map((term, index) => (
                      <Option key={index} value={term}>
                        {term}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Brand Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or add brand name"
                    value={formData.brandName || undefined}
                    onSearch={(value) => {
                      setFormData((prev) => ({ ...prev, brandName: value }));
                    }}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, brandName: value }));
                    }}
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={null}
                    popupRender={(menu) => (
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
                                  <svg
                                    className="animate-spin mr-2 h-4 w-4 text-blue-600"
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
                    options={brandOptions.map((brand) => ({
                      value: brand,
                      label: brand,
                    }))}
                    disabled={isSubmitting}
                    className="w-full"
                    required
                  />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px] text-sm md:text-base"
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