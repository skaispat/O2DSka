"use client";

import { useState, useEffect, useRef } from "react";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  Upload,
  X,
  Plus,
  RefreshCw,
  Columns,
  ChevronDown,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { Select } from "antd";
import CustomSelect from "../utils/CustomSelect";
import supabase from "../SupabaseClient";

const MakeInvoice = () => {
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
  const [brokerNames, setBrokerNames] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sections, setSections] = useState([]);
  const [billStatuses, setBillStatuses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brokerRateMap, setBrokerRateMap] = useState({});
  const [globalBrokerName, setGlobalBrokerName] = useState("");
  const [globalFilteredRates, setGlobalFilteredRates] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([
    "serialNumber",
    "vehicleNumber",
    "partyName",
    "erpDoNo",
    "transporterName",
    "lrNumber",
    "deliveryTerm",
    "brandName",
    "dispatchQty",
    "planned7",
    "qcPDF",
  ]);

  // Add selected columns for history
  const [selectedHistoryColumns, setSelectedHistoryColumns] = useState([
    "invoice_no",
    "order_number", 
    "party_name",
    "sauda_no",
    "do_no",
    "bill_date",
    "bill_no",
    "bill_image",
    "delivery_term",
    "transporter_name",
    "vehicle_no",
    "lt_number",
    "bill_status",
    "size",
    "section",
    "qty",
    "rate",
    "customer_discount",
    "udam_vidian",
  ]);

  // Broker dropdown states
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const { Option } = Select;
  const [rows, setRows] = useState([
    {
      id: 1,
      size: "",
      section: "",
      qty: "",
      rate: "",
      saudaNo: "",
    },
  ]);

  const [formData, setFormData] = useState({
    billDate: "",
    billNo: "",
    billImage: "",
    cashDiscount: "",
    udaanVidhan: "",
    billStatus: "",
    partyName: "",
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs array for each option
  const optionRefs = useRef([]);

  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < filteredBrokers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredBrokers.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSelect(filteredBrokers[highlightedIndex]);
    }
  };

  const handleSelect = (broker) => {
    handleGlobalBrokerChange(broker);
    setQuery(broker);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    setQuery(globalBrokerName || "");
  }, [globalBrokerName]);

  // Column options for both tabs
  const columnOptions = {
    pending: [
      { id: "serialNumber", label: "Serial Number" },
      { id: "vehicleNumber", label: "Vehicle No" },
      { id: "partyName", label: "Party Name" },
      { id: "erpDoNo", label: "ERP DO No." },
      { id: "transporterName", label: "Transporter Name" },
      { id: "lrNumber", label: "LR Number" },
      { id: "deliveryTerm", label: "Delivery Term" },
      { id: "brandName", label: "Brand Name" },
      { id: "dispatchQty", label: "Dispatch Qty" },
      { id: "planned7", label: "Gate In" },
      { id: "qcPDF", label: "QC PDF" },
    ],
    history: [
      { id: "invoice_no", label: "Invoice No" },
      { id: "order_number", label: "Order Number" },
      { id: "party_name", label: "Party Name" },
      { id: "sauda_no", label: "Sauda No" },
      { id: "do_no", label: "Do No" },
      { id: "bill_date", label: "Bill Date" },
      { id: "bill_no", label: "Bill No" },
      { id: "bill_image", label: "Bill Image" },
      { id: "delivery_term", label: "Delivery Term" },
      { id: "transporter_name", label: "Transporter Name" },
      { id: "vehicle_no", label: "Vehicle No" },
      { id: "lt_number", label: "Bilty No" },
      { id: "bill_status", label: "Bill Status" },
      { id: "size", label: "Size" },
      { id: "section", label: "Section" },
      { id: "qty", label: "Qty" },
      { id: "rate", label: "Rate" },
      { id: "customer_discount", label: "Cash Discount" },
      { id: "udam_vidian", label: "Udaan/Vidhan" },
    ],
  };

  const toggleColumn = (columnId) => {
    if (activeTab === "pending") {
      if (selectedColumns.includes(columnId)) {
        setSelectedColumns(selectedColumns.filter((col) => col !== columnId));
      } else {
        setSelectedColumns([...selectedColumns, columnId]);
      }
    } else {
      if (selectedHistoryColumns.includes(columnId)) {
        setSelectedHistoryColumns(selectedHistoryColumns.filter((col) => col !== columnId));
      } else {
        setSelectedHistoryColumns([...selectedHistoryColumns, columnId]);
      }
    }
  };

  // Filter brokers based on search
  useEffect(() => {
    if (brokerSearch.trim() === "") {
      setFilteredBrokers(brokerNames);
    } else {
      const filtered = brokerNames.filter((broker) =>
        broker.toLowerCase().includes(brokerSearch.toLowerCase())
      );
      setFilteredBrokers(filtered.slice(0, 5));
    }
  }, [brokerSearch, brokerNames]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showBrokerDropdown &&
        !event.target.closest(".broker-dropdown-container")
      ) {
        setShowBrokerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBrokerDropdown]);

  useEffect(() => {
    fetchData();
    fetchDataforHistory();
    fetchDropdownData();
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_delivery')
        .select('invoice_no')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data) {
        const transformedData = data.map((row, index) => ({
          id: index + 1,
          invoiceNumber: row.invoice_no || "",
        }));

        setInvoiceData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      toast.error("Failed to load invoice data");
    }
  };

  const fetchDataforHistory = async () => {
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
          invoice_no: row.invoice_no,
          order_number: row.order_number,
          party_name: row.party_name,
          sauda_no: row.sauda_no,
          do_no: row.do_no,
          bill_date: row.bill_date,
          bill_no: row.bill_no,
          bill_image: row.bill_image,
          delivery_term: row.delivery_term,
          transporter_name: row.transporter_name,
          vehicle_no: row.vehicle_no,
          lt_number: row.lt_number,
          bill_status: row.bill_status,
          size: row.size,
          section: row.section,
          qty: row.qty,
          rate: row.rate,
          customer_discount: row.customer_discount,
          udam_vidian: row.udam_vidian,
        }));

        console.log("History data fetched:", allData);
        setFilteredHistoryData(allData);
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
      toast.error("Failed to load history data");
    } finally {
      setLoading(false);
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
          qcPDF: row.pdf || row.qcPDF,
          planned7: row.planned7 || row.planned_date_7,
          actual7: row.actual7 || row.actual_date_7,
          billDate: row.bill_date || row.billDate,
          billNo: row.bill_no || row.billNo,
          billImage: row.bill_image || row.billImage,
          size: row.size,
          section: row.section,
          qty: row.qty,
          rate: row.rate,
          cashDiscount: row.cash_discount || row.cashDiscount,
          saudaNo: row.sauda_no || row.saudaNo,
          brokerName: row.broker_name || row.brokerName,
          billStatus: row.bill_status || row.billStatus,
          pdf: row.pdf || row.pdf_url,
        }));

        const pending = allData.filter(
          (item) =>
            item.planned7 &&
            item.planned7.trim() !== "" &&
            (!item.actual7 || item.actual7.trim() === "")
        );

        const history = allData.filter(
          (item) =>
            item.planned7 &&
            item.planned7.trim() !== "" &&
            item.actual7 &&
            item.actual7.trim() !== ""
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

  const fetchDropdownData = async () => {
    try {
      // Fetch broker data from Supabase
      const { data: brokerData, error: brokerError } = await supabase
        .from('saudaform')
        .select('broker_name, rate, sauda_number, order_status')
        .order('timestamp', { ascending: true });

      if (brokerError) {
        console.error("Error fetching broker data:", brokerError);
        throw brokerError;
      }

      if (brokerData) {
        let brokerNames = [];
        const mapping = {};

        brokerData.forEach((row) => {
          const broker = row.broker_name?.toString().trim();
          const rate = row.rate?.toString().trim();
          const saudaNo = row.sauda_number?.toString().trim();
          const orderStatus = row.order_status?.toString().trim();

          if (broker) {
            if (orderStatus && orderStatus.toLowerCase() === "pending") {
              brokerNames.push(broker);

              if (rate) {
                if (!mapping[broker]) {
                  mapping[broker] = [];
                }
                mapping[broker].push({ rate, saudaNo: saudaNo || "" });
              }
            }
          }
        });

        const uniqueBrokers = [...new Set(brokerNames)].filter(
          (b) => b && b.trim() !== ""
        );

        setBrokerNames(uniqueBrokers);
        setBrokerRateMap(mapping);
      }

      // Fetch size and section data from Supabase
      const { data: masterData, error: masterError } = await supabase
        .from('dropdown')
        .select('size, section, bill_status')
        .order('created_at', { ascending: true });

      if (masterError) {
        console.error("Error fetching master data:", masterError);
        throw masterError;
      }

      if (masterData) {
        const uniqueSizes = [...new Set(masterData.map((row) => row.size))];
        setSizes(uniqueSizes.filter((s) => s));

        const uniqueSections = [...new Set(masterData.map((row) => row.section))];
        setSections(uniqueSections.filter((s) => s));

        const uniqueStatuses = [...new Set(masterData.map((row) => row.bill_status))];
        setBillStatuses(uniqueStatuses.filter((s) => s));
      }

    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const handleViewPDF = (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

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

  const getDriveViewerUrl = (url) => {
    try {
      if (!url || url.trim() === "") {
        console.warn("Empty or null URL provided");
        return null;
      }

      if (
        url.includes("drive.google.com/file/d/") &&
        (url.includes("/view") || url.includes("/preview"))
      ) {
        return url;
      }

      let fileId = "";

      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        fileId = fileIdMatch[1];
      } else if (url.includes("open?id=")) {
        try {
          const urlObj = new URL(url);
          fileId = urlObj.searchParams.get("id");
        } catch (urlError) {
          console.error("Error parsing open URL:", urlError);
        }
      } else if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
        fileId = url;
      }

      if (!fileId) {
        return url;
      }

      return `https://drive.google.com/file/d/${fileId}/view`;
    } catch (e) {
      console.error("Error parsing Drive URL:", e);
      return url;
    }
  };

  // Handle global broker change
  const handleGlobalBrokerChange = (broker) => {
    setGlobalBrokerName(broker);
    setBrokerSearch("");
    setShowBrokerDropdown(false);
    const filteredRates =
      broker && brokerRateMap[broker] ? brokerRateMap[broker] : [];
    setGlobalFilteredRates(filteredRates);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        rate: "",
        saudaNo: "",
      }))
    );
  };

  const handleRowRateChange = (rowId, selectedRate) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const selectedRateStr = selectedRate.toString();
          const foundRate = globalFilteredRates.find(
            (r) => r.rate.toString() === selectedRateStr
          );

          return {
            ...row,
            rate: selectedRate,
            saudaNo: foundRate ? foundRate.saudaNo : "",
          };
        }
        return row;
      })
    );
  };

  const handleRowInputChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            [field]: value,
          };
        }
        return row;
      })
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      size: "",
      section: "",
      qty: "",
      rate: "",
      saudaNo: "",
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setFormData({
      billDate: item.billDate || "",
      billNo: item.billNo || "",
      billImage: item.billImage || "",
      cashDiscount: item.cashDiscount || "",
      udaanVidhan: "",
      billStatus: item.billStatus || "",
      partyName: item.partyName || "",
    });

    const brokerName = item.brokerName || "";
    setGlobalBrokerName(brokerName);
    setBrokerSearch("");
    const filteredRates =
      brokerName && brokerRateMap[brokerName] ? brokerRateMap[brokerName] : [];
    setGlobalFilteredRates(filteredRates);

    setRows([
      {
        id: 1,
        size: item.size || "",
        section: item.section || "",
        qty: item.qty || "",
        rate: item.rate || "",
        saudaNo: item.saudaNo || "",
      },
    ]);

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setGlobalBrokerName("");
    setBrokerSearch("");
    setShowBrokerDropdown(false);
    setGlobalFilteredRates([]);
    setFormData({
      billDate: "",
      billNo: "",
      billImage: "",
      cashDiscount: "",
      udaanVidhan: "",
      billStatus: "",
      partyName: "",
    });
    setRows([
      {
        id: 1,
        size: "",
        section: "",
        qty: "",
        rate: "",
        saudaNo: "",
      },
    ]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file.type.startsWith("image/") ||
      file.name.endsWith(".pdf") ||
      file.type === "application/pdf"
    ) {
      setFormData((prev) => ({
        ...prev,
        billImage: file,
      }));
    } else {
      toast.error("Please upload an image file");
    }
  };

  const uploadImageToDrive = async (file) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result.split(",")[1];
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
      });

      const uploadResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbyyMQjRx0hc36Wfgu5cKgNHBxRE90sDDnRQPJeWoOacZfxZ9KVn-Sgb_tXWkQ0PbkWm/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            action: "uploadFile",
            fileName: `Invoice_${currentItem.erpDoNo}_${Date.now()}.jpg`,
            base64Data: base64Data,
            mimeType: file.type,
            folderId: "1s20cKM5rrBLD7qZCTXvXuzV1KpXpYWxV",
          }),
        }
      );

      const result = await uploadResponse.json();
      if (!result.success) {
        console.error("Upload error:", result.error);
        toast.error("Failed to upload image to Google Drive");
        return { success: false, error: result.error };
      }

      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return { success: false, error: "Failed to upload image" };
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      // Get the latest invoice number from Supabase
      const { data, error } = await supabase
        .from('invoice_delivery')
        .select('invoice_no')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      
      if (data && data.length > 0) {
        const lastInvoiceNo = data[0].invoice_no;
        if (lastInvoiceNo && lastInvoiceNo.startsWith('INV-')) {
          const lastNum = parseInt(lastInvoiceNo.replace('INV-', ''));
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }

      return `INV-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      // Fallback to timestamp-based number
      return `INV-${Date.now().toString().slice(-6)}`;
    }
  };

  const handleSubmitInvoice = async (orderNumber) => {
    if (!formData.billDate || !formData.billNo || !formData.billImage) {
      toast.error("Please fill Bill Date, Bill Image and Bill No");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = "";

      if (formData.billImage instanceof File) {
        const uploadResult = await uploadImageToDrive(formData.billImage);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload image");
        }
        imageUrl = uploadResult.fileUrl;
      } else if (formData.billImage) {
        imageUrl = formData.billImage;
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Insert all rows into invoice_delivery table
      const insertPromises = rows.map(async (row) => {
        const invoiceData = {
          timestamp:new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', ''),
          // invoice_no: invoiceNumber,
          order_number: orderNumber,
          party_name: formData.partyName,
          sauda_no: row.saudaNo || "",
          do_no: currentItem.erpDoNo,
          bill_date: formData.billDate,
          bill_no: formData.billNo,
          bill_image: imageUrl,
          delivery_term: currentItem.deliveryTerm,
          transporter_name: currentItem.transporterName,
          vehicle_no: currentItem.vehicleNumber,
          lr_number: currentItem.lrNumber,
          bill_status: formData.billStatus,
          size: row.size || "",
          section: row.section || "",
          qty:row.qty||null ,
          rate: row.rate || "",
          customer_discount: formData.cashDiscount,
          udaan_vidhan: formData.udaanVidhan,
          brand_name:currentItem.brandName,
            planned1:new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', ''),
        };

        const { data, error } = await supabase
          .from('invoice_delivery')
          .insert([invoiceData]);

        if (error) throw error;
        return data;
      });

      await Promise.all(insertPromises);

      // Update order_invoice table
      const { error: updateError } = await supabase
        .from('order_invoice')
        .update({
          party_name: formData.partyName,
           actual7:new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', ''),
        })
        .eq('id', currentItem.id);

      if (updateError) throw updateError;

      fetchData();
      fetchDataforHistory();
      fetchInvoiceData();
      toast.success(`Invoice(s) submitted successfully!`);
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting invoice data:", error);
      toast.error(`Failed to submit invoice data: ${error.message}`);
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

  const filteredHistory = filteredHistoryData
    .filter((item) => {
      const matchesSearch = item.party_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.party_name === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Make Invoice</h1>
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

          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              <Columns size={16} className="mr-2" />
              Columns
            </button>
            {showColumnDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {columnOptions[activeTab].map((column) => (
                    <div key={column.id} className="flex items-center p-2">
                      <input
                        type="checkbox"
                        id={`column-${column.id}`}
                        checked={
                          activeTab === "pending" 
                            ? selectedColumns.includes(column.id)
                            : selectedHistoryColumns.includes(column.id)
                        }
                        onChange={() => toggleColumn(column.id)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`column-${column.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {column.label}
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
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData?.length})
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
              History ({filteredHistory?.length})
            </button>
          </nav>
        </div>

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        {selectedColumns.includes("serialNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serial Number
                          </th>
                        )}
                        {selectedColumns.includes("vehicleNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle No
                          </th>
                        )}
                        {selectedColumns.includes("partyName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party Name
                          </th>
                        )}
                        {selectedColumns.includes("erpDoNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ERP DO No.
                          </th>
                        )}
                        {selectedColumns.includes("transporterName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transporter Name
                          </th>
                        )}
                        {selectedColumns.includes("lrNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            LR Number
                          </th>
                        )}
                        {selectedColumns.includes("deliveryTerm") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Term
                          </th>
                        )}
                        {selectedColumns.includes("brandName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand Name
                          </th>
                        )}
                        {selectedColumns.includes("dispatchQty") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dispatch Qty
                          </th>
                        )}
                        {selectedColumns.includes("planned7") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gate In
                          </th>
                        )}
                        {selectedColumns.includes("qcPDF") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            QC PDF
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                              Invoice
                            </button>
                          </td>
                          {selectedColumns.includes("serialNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serialNumber}
                            </td>
                          )}
                          {selectedColumns.includes("vehicleNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicleNumber}
                            </td>
                          )}
                          {selectedColumns.includes("partyName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.partyName}
                            </td>
                          )}
                          {selectedColumns.includes("erpDoNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.erpDoNo}
                            </td>
                          )}
                          {selectedColumns.includes("transporterName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.transporterName}
                            </td>
                          )}
                          {selectedColumns.includes("lrNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.lrNumber}
                            </td>
                          )}
                          {selectedColumns.includes("deliveryTerm") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.deliveryTerm}
                            </td>
                          )}
                          {selectedColumns.includes("brandName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.brandName}
                            </td>
                          )}
                          {selectedColumns.includes("dispatchQty") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.dispatchQty}
                            </td>
                          )}
                          {selectedColumns.includes("planned7") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.planned7}
                            </td>
                          )}
                          {selectedColumns.includes("qcPDF") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.qcPDF ? (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(item.qcPDF, "_blank");
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium px-2 py-1 rounded transition-colors"
                                >
                                  Download
                                </button>
                              ) : (
                                <span className="text-gray-400">No file</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPendingData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No pending invoice records found.
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
                        {selectedHistoryColumns.includes("invoice_no") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("order_number") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                        )}
                        {selectedHistoryColumns.includes("party_name") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party Name
                          </th>
                        )}
                        {selectedHistoryColumns.includes("sauda_no") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sauda No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("do_no") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Do No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("bill_date") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Date
                          </th>
                        )}
                        {selectedHistoryColumns.includes("bill_no") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("bill_image") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Image
                          </th>
                        )}
                        {selectedHistoryColumns.includes("delivery_term") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Term
                          </th>
                        )}
                        {selectedHistoryColumns.includes("transporter_name") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transporter Name
                          </th>
                        )}
                        {selectedHistoryColumns.includes("vehicle_no") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("lt_number") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bilty No
                          </th>
                        )}
                        {selectedHistoryColumns.includes("bill_status") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Status
                          </th>
                        )}
                        {selectedHistoryColumns.includes("size") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                        )}
                        {selectedHistoryColumns.includes("section") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                        )}
                        {selectedHistoryColumns.includes("qty") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                        )}
                        {selectedHistoryColumns.includes("rate") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rate
                          </th>
                        )}
                        {selectedHistoryColumns.includes("customer_discount") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cash Discount
                          </th>
                        )}
                        {selectedHistoryColumns.includes("udam_vidian") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Udaan/Vidhan
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {selectedHistoryColumns.includes("invoice_no") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.invoice_no}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("order_number") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.order_number}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("party_name") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.party_name}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("sauda_no") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.sauda_no}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("do_no") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.do_no}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("bill_date") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bill_date
                                ? new Date(item.bill_date).toLocaleDateString()
                                : "-"}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("bill_no") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bill_no}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("bill_image") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bill_image ? (
                                <button
                                  onClick={(e) => handleViewPDF(item.bill_image, e)}
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium px-2 py-1 rounded transition-colors"
                                  type="button"
                                >
                                  View PDF
                                </button>
                              ) : (
                                <span className="text-gray-400">No file</span>
                              )}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("delivery_term") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.delivery_term}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("transporter_name") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.transporter_name}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("vehicle_no") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicle_no}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("lt_number") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.lt_number}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("bill_status") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bill_status}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("size") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.size}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("section") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.section}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("qty") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.qty}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("rate") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.rate}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("customer_discount") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.customer_discount}
                            </td>
                          )}
                          {selectedHistoryColumns.includes("udam_vidian") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.udam_vidian}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistory.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">No invoice history found.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-indigo-600 ">
                <h2 className="text-xl font-semibold text-white">
                  Create Invoice
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={currentItem?.serialNumber || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Name
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={formData.partyName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ERP DO No.
                    </label>
                    <input
                      type="text"
                      value={currentItem?.erpDoNo || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle
                    </label>
                    <input
                      type="text"
                      value={currentItem?.vehicleNumber || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="billNo"
                      value={formData.billNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Status
                    </label>
                    <Select
                      showSearch
                      placeholder="Select Status"
                      name="billStatus"
                      value={formData.billStatus || undefined}
                      onChange={(value) =>
                        handleInputChange({
                          target: { name: "billStatus", value },
                        })
                      }
                      className="w-full h-[42px]"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {billStatuses.map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Discount
                    </label>
                    <input
                      type="number"
                      name="cashDiscount"
                      value={formData.cashDiscount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UDAAN/VIDHAN
                    </label>
                    <input
                      type="text"
                      name="udaanVidhan"
                      value={formData.udaanVidhan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Image / PDF
                    </label>
                    <div className="flex items-center space-x-3">
                      <label
                        tabIndex={0}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Upload size={16} className="mr-2" />
                        Upload File
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {formData.billImage && (
                        <span className="text-sm text-gray-600">
                          {formData.billImage instanceof File
                            ? formData.billImage.name
                            : "File uploaded"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Broker Name
                    </label>

                    <CustomSelect
                      placeholder="Search or select broker..."
                      value={globalBrokerName || undefined}
                      onChange={(selectedBroker) => {
                        handleGlobalBrokerChange(selectedBroker);
                      }}
                      options={filteredBrokers}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Size & Rate Details
                    </h3>
                    <button
                      onClick={handleAddRow}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} className="mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sauda No.
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3">
                              <CustomSelect
                                placeholder="Select Size"
                                value={row.size || undefined}
                                onChange={(value) =>
                                  handleRowInputChange(row.id, "size", value)
                                }
                                options={sizes}
                                className="w-[100px]"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <CustomSelect
                                placeholder="Select Section"
                                value={undefined}
                                onChange={(value) =>
                                  handleRowInputChange(row.id, "section", value)
                                }
                                options={sections}
                                className="w-[230px]"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) =>
                                  handleRowInputChange(
                                    row.id,
                                    "qty",
                                    e.target.value
                                  )
                                }
                                className="w-[100px] px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>

                            <td className="px-4 py-3">
                              {row.rate === "custom" ||
                              (row.rate &&
                                !globalFilteredRates.some(
                                  (item) =>
                                    item.rate.toString() === row.rate.toString()
                                )) ? (
                                <input
                                  type="number"
                                  value={row.rate === "custom" ? "" : row.rate}
                                  onChange={(e) =>
                                    handleRowInputChange(
                                      row.id,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!e.target.value) {
                                      handleRowInputChange(row.id, "rate", "");
                                    }
                                  }}
                                  className="w-[110px] px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  autoFocus={row.rate === "custom"}
                                />
                              ) : (
                                <CustomSelect
                                  placeholder="Select Rate"
                                  value={row.rate || undefined}
                                  onChange={(selectedRate) => {
                                    if (selectedRate === "custom") {
                                      handleRowInputChange(
                                        row.id,
                                        "rate",
                                        "custom"
                                      );
                                    } else {
                                      handleRowRateChange(row.id, selectedRate);
                                    }
                                  }}
                                  options={[
                                    ...globalFilteredRates.map(
                                      (item) => item.rate
                                    ),
                                    "custom",
                                  ]}
                                  className="w-[110px]"
                                  disabled={!globalBrokerName}
                                />
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={row.saudaNo}
                                readOnly
                                className="w-[80px] px-2 py-1 border border-gray-200 rounded bg-gray-100"
                              />
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveRow(row.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                disabled={rows.length <= 1}
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitInvoice(currentItem?.serialNumber)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
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
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeInvoice;