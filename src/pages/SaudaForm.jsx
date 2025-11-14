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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { Select } from "antd";
import CustomSelect from "../utils/CustomSelect";
import supabase from "../SupabaseClient";

const SaudaForm = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDealer, setFilterDealer] = useState("all");
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
  const [expandedCard, setExpandedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
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
   const [dealerOptions, setDealerOptions] = useState([]);

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
    brandName: "",
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

  // Check mobile view on resize and initial load
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

  // Reset form data
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
        const dealers = [...new Set(data.map(item => item.dealer_name).filter(Boolean))].sort();
        
        setBrandOptions(brands);
        setPartyOptions(parties);
        // Set dealer options for filter
        // setDealerOptions(dealers);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load dropdown options");
    }
  };

  // Fetch sauda data from Supabase
  const fetchSaudaData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saudaform')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedData = data.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          saudaNumber: item.sauda_number,
          dateOfSauda: item.date_of_sauda,
          brokerName: item.broker_name,
          partyName: item.party_name,
          dealerName: item.dealer_name,
          rate: item.rate,
          orderQuantity: item.order_quantity_ton,
          partyWhatsApp: item.party_whatsapp_number,
          contactPersonName: item.contact_person_name,
          pendingQty: item.pending_qty,
          completed: item.order_status === "Complete" ? "Complete" : "Pending",
          brandName: item.brand_name,
          size: item.size,
          section: item.section,
          deliveryTerms: item.delivery_terms,
          killStatus: item.kill_status,
          transporterName: item.transporter_name,
        }));

        setSaudaData(transformedData);
        
        // Extract unique dealers from the fetched data for filter
        const uniqueDealers = [...new Set(transformedData.map(item => item.dealerName).filter(Boolean))].sort();
        setDealerOptions(uniqueDealers);
      }
    } catch (error) {
      console.error("Error fetching sauda data:", error);
      toast.error("Failed to load sauda data");
    } finally {
      setIsLoading(false);
    }
  };

  // State for dealer options in filter
 

  useEffect(() => {
    fetchSaudaData();
    fetchDropdownOptions();
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
      await fetchDropdownOptions();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
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

  // Generate sauda number (you can customize this logic)
  const generateSaudaNumber = () => {
    const timestamp = new Date().getTime();
    return `SAUDA-${timestamp}`;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Get current date in Indian timezone and format to YYYY-MM-DD HH:MM:SS
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

    // Prepare data for Supabase insertion
    const saudaData = {
      timestamp: formatToMySQLDateTime(indianTime), // YYYY-MM-DD HH:MM:SS format
      date_of_sauda: formData.dateOfSauda,
      broker_name: formData.brokerName,
      party_name: formData.partyName,
      dealer_name: formData.dealerName,
      rate: formData.rate,
      order_quantity_ton: formData.orderQuantity,
      party_whatsapp_number: formData.partyWhatsApp,
      contact_person_name: formData.contactPersonName,
      order_status: "Pending",
      db: null,
      brand_name: formData.brandName
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('saudaform')
      .insert([saudaData])
      .select();

    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }

    toast.success(`Sauda added successfully!`);
    
    // Reset form
    resetFormData();
    setShowModal(false);
    fetchSaudaData();
    
  } catch (error) {
    console.error("Submission Error:", error);
    toast.error(error.message || "Failed to add sauda");
  } finally {
    setIsSubmitting(false);
  }
};

  // Updated filtering logic to use correct column data with case-insensitive search
  const filteredPendingData = saudaData.filter(
    (item) => item.completed === "Pending"
  );
  const filteredHistoryData = saudaData.filter(
    (item) => item.completed === "Complete"
  );

  const currentTabData =
    activeTab === "pending" ? filteredPendingData : filteredHistoryData;

  // Case-insensitive search for all fields
  const filteredData = currentTabData
    .filter((item) => {
      const brokerName = String(item.brokerName || "").toLowerCase();
      const partyName = String(item.partyName || "").toLowerCase();
      const dealerName = String(item.dealerName || "").toLowerCase();
      const saudaNumber = String(item.saudaNumber || "").toLowerCase();
      const brandName = String(item.brandName || "").toLowerCase();
      const contactPersonName = String(item.contactPersonName || "").toLowerCase();
      const partyWhatsApp = String(item.partyWhatsApp || "").toLowerCase();
      
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch =
        brokerName.includes(searchLower) ||
        partyName.includes(searchLower) ||
        dealerName.includes(searchLower) ||
        saudaNumber.includes(searchLower) ||
        brandName.includes(searchLower) ||
        contactPersonName.includes(searchLower) ||
        partyWhatsApp.includes(searchLower);
      
      const matchesDealer =
        filterDealer === "all" || item.dealerName === filterDealer;
      
      return matchesSearch && matchesDealer;
    })
    .reverse();

  const handleSubmitClose = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('cancel')
        .insert([{
          sauda_number: cancelForm.saudaNumber,
          qty: cancelForm.quantity,
          remarks: cancelForm.remarks,
          timestamp:new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', ''),
        }]);

      if (error) throw error;

      // Update sauda status to cancelled
      const { error: updateError } = await supabase
        .from('saudaform')
        .update({ 
          // order_status: 'Cancelled',
          order_cancel_qty: cancelForm.quantity 
        })
        .eq('sauda_number', cancelForm.saudaNumber);

      if (updateError) throw updateError;

      toast.success(`Sauda ${cancelForm.saudaNumber} cancelled successfully!`);
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

  const toggleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Render table for desktop view with fixed height and scroll
  const renderTable = () => (
    <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columnVisibility[activeTab].saudaNumber && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Sauda No.
              </th>
            )}
            {columnVisibility[activeTab].dateOfSauda && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Date Of Sauda
              </th>
            )}
            {columnVisibility[activeTab].brokerName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Broker Name
              </th>
            )}
            {columnVisibility[activeTab].partyName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Party Name
              </th>
            )}
            {columnVisibility[activeTab].dealerName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Dealer Name
              </th>
            )}
            {columnVisibility[activeTab].rate && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Rate
              </th>
            )}
            {columnVisibility[activeTab].orderQuantity && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Order Qty (Ton)
              </th>
            )}
            {columnVisibility[activeTab].partyWhatsApp && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                WhatsApp
              </th>
            )}
            {columnVisibility[activeTab].contactPersonName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Contact Person
              </th>
            )}
            {columnVisibility[activeTab].status && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Pending Qty
              </th>
            )}
            {activeTab === "pending" &&
              columnVisibility[activeTab].action && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Action
                </th>
              )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columnVisibility[activeTab].saudaNumber && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.saudaNumber || "-"}
                </td>
              )}
              {columnVisibility[activeTab].dateOfSauda && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.dateOfSauda
                    ? new Date(item.dateOfSauda).toLocaleDateString()
                    : "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].brokerName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.brokerName || "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].partyName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.partyName || "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].dealerName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.dealerName || "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].rate && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{item.rate || "0"}
                </td>
              )}
              {columnVisibility[activeTab].orderQuantity && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.orderQuantity || "0"}
                </td>
              )}
              {columnVisibility[activeTab].partyWhatsApp && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.partyWhatsApp || "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].contactPersonName && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.contactPersonName || "N/A"}
                </td>
              )}
              {columnVisibility[activeTab].status && (
                <td className="px-4 py-4 whitespace-nowrap text-sm">
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
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
  );

  // Render cards for mobile view - FIXED VERSION
  const renderCards = () => (
    <div className="space-y-3 p-3" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      {filteredData.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Card Header - Always Visible */}
          <div 
            className="p-4 cursor-pointer"
            onClick={() => toggleCardExpand(item.id)}
          >
            {/* Top Row - Sauda Number and Status */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                {columnVisibility[activeTab].saudaNumber && (
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    #{item.saudaNumber || "-"}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${item.completed === "Complete"
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                    }`}
                >
                  {item.pendingQty || "N/A"}
                </span>
              </div>
              
              {/* Expand/Collapse Button */}
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

            {/* Party Name - PROMINENT DISPLAY */}
            {columnVisibility[activeTab].partyName && item.partyName && (
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Party:</span>
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {item.partyName}
                  </span>
                </div>
              </div>
            )}

            {/* Essential Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {columnVisibility[activeTab].dateOfSauda && (
                <div>
                  <span className="text-gray-500 block text-xs">Date</span>
                  <p className="font-medium text-gray-900">
                    {item.dateOfSauda
                      ? new Date(item.dateOfSauda).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              )}
              
              {columnVisibility[activeTab].brokerName && item.brokerName && (
                <div>
                  <span className="text-gray-500 block text-xs">Broker</span>
                  <p className="font-medium text-gray-900 truncate">{item.brokerName}</p>
                </div>
              )}
              
              {columnVisibility[activeTab].dealerName && item.dealerName && (
                <div>
                  <span className="text-gray-500 block text-xs">Dealer</span>
                  <p className="font-medium text-gray-900 truncate">{item.dealerName}</p>
                </div>
              )}
              
              {columnVisibility[activeTab].rate && (
                <div>
                  <span className="text-gray-500 block text-xs">Rate</span>
                  <p className="font-medium text-gray-900">₹{item.rate || "0"}</p>
                </div>
              )}
              
              {columnVisibility[activeTab].orderQuantity && (
                <div>
                  <span className="text-gray-500 block text-xs">Quantity</span>
                  <p className="font-medium text-gray-900">{item.orderQuantity || "0"} Ton</p>
                </div>
              )}

              {columnVisibility[activeTab].contactPersonName && item.contactPersonName && (
                <div>
                  <span className="text-gray-500 block text-xs">Contact</span>
                  <p className="font-medium text-gray-900 truncate">{item.contactPersonName}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Expanded Details - Additional Information */}
          {expandedCard === item.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Details</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {columnVisibility[activeTab].partyWhatsApp && item.partyWhatsApp && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">WhatsApp:</span>
                    <span className="font-medium text-gray-900">{item.partyWhatsApp}</span>
                  </div>
                )}
                
                {item.brandName && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium text-gray-900">{item.brandName}</span>
                  </div>
                )}
                
                {item.size && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium text-gray-900">{item.size}</span>
                  </div>
                )}
                
                {item.section && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Section:</span>
                    <span className="font-medium text-gray-900">{item.section}</span>
                  </div>
                )}

                {item.deliveryTerms && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Delivery Terms:</span>
                    <span className="font-medium text-gray-900">{item.deliveryTerms}</span>
                  </div>
                )}

                {item.killStatus && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Kill Status:</span>
                    <span className="font-medium text-gray-900">{item.killStatus}</span>
                  </div>
                )}
              </div>

              {/* Short Close Button - MOVED TO BOTTOM OF EXPANDED SECTION */}
              {activeTab === "pending" && columnVisibility[activeTab].action && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCancelModal({ show: true, sauda: item });
                      setCancelForm({
                        saudaNumber: item.saudaNumber,
                        quantity: "",
                        remarks: "",
                      });
                    }}
                    className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Short Close Sauda
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Short Close Button - FOR COLLAPSED STATE */}
          {activeTab === "pending" && columnVisibility[activeTab].action && expandedCard !== item.id && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelModal({ show: true, sauda: item });
                  setCancelForm({
                    saudaNumber: item.saudaNumber,
                    quantity: "",
                    remarks: "",
                  });
                }}
                className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Short Close Sauda
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 p-2 md:p-6" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">SaudaForm</h1>
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
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              resetFormData();
              setShowModal(true);
            }}
            className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Plus size={16} className="mr-2" />
            <span className="hidden md:inline">New Sauda</span>
            <span className="md:hidden">New</span>
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
                placeholder="Search by broker, party, dealer, sauda no, brand, contact person, WhatsApp..."
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

          {/* Filters - UPDATED: Filter and Column buttons side by side on mobile */}
          <div className="flex items-center space-x-2">
            {/* Filter Button */}
            <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-300 flex-1 min-w-0">
              <Filter size={16} className="text-gray-500 mr-2 flex-shrink-0" />
              <select
                className="border-0 bg-transparent focus:outline-none focus:ring-0 text-sm w-full"
                value={filterDealer}
                onChange={(e) => setFilterDealer(e.target.value)}
              >
                <option value="all">All Dealers</option>
                {dealerOptions.map((dealer) => (
                  <option key={dealer} value={dealer}>
                    {dealer}
                  </option>
                ))}
              </select>
            </div>

            {/* Column visibility dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto min-w-[80px]"
              >
                <Eye size={16} className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">Columns</span>
                <span className="sm:hidden">Cols</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {columnOptions.map((column) => (
                      <div key={column.id} className="px-3 py-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={columnVisibility[activeTab][column.id]}
                            onChange={() =>
                              toggleColumnVisibility(activeTab, column.id)
                            }
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

      {/* Tabs and Table Container - Fixed height with internal scroll */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1 flex flex-col">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`flex-1 py-3 px-4 font-medium text-sm border-b-2 text-center ${activeTab === "pending"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`flex-1 py-3 px-4 font-medium text-sm border-b-2 text-center ${activeTab === "history"
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
          <div className="flex items-center justify-center py-8 flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 ml-2">Loading data...</span>
          </div>
        )}

        {/* Content - This container will scroll internally */}
        {!isLoading && (
          <div className="flex-1">
            {isMobile ? renderCards() : renderTable()}
            
            {filteredData.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No sauda records found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
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
            <form onSubmit={handleSubmitClose} className="p-4 md:p-6 space-y-4">
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

      {/* Main Modal for New Sauda */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg font-medium">New Sauda</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
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
                    required
                  />
                </div>

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
                    required
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
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={null}
                    dropdownRender={(menu) => (
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
                    required
                  />
                </div>

                {/* Brand Name Field */}
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
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
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
                    required
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
                    required
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