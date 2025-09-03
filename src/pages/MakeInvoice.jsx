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
  const [filteredHistoryDatas, setFilteredHistoryData] = useState([]);
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
      { id: "invoiceNumber", label: "Invoice No" },
      { id: "orderNumber", label: "Order Number" },
      { id: "partyName", label: "Party Name" },
      { id: "saudaNumber", label: "Sauda No" },
      { id: "doNo", label: "Do No" },
      { id: "billDate", label: "Bill Date" },
      { id: "billNO", label: "Bill No" },
      { id: "billImage", label: "Bill Image" },
      { id: "deliveryTerm", label: "Delivery Term" },
      { id: "transpoterName", label: "Transporter Name" },
      { id: "vehicalNo", label: "Vehicle No" },
      { id: "biltyNo", label: "Bilty No" },
      { id: "billStatus", label: "Bill Status" },
      { id: "size", label: "Size" },
      { id: "section", label: "Section" },
      { id: "qty", label: "Qty" },
      { id: "rate", label: "Rate" },
      { id: "cashDescount", label: "Cash Discount" },
      { id: "udaan_vidhan", label: "Udaan/Vidhan" },
    ],
  };

  const toggleColumn = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
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
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=INVOICE-DELIVERY&timestamp=${timestamp}`
      );
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const dataRows = json.data.slice(6).filter((row) => row.length > 0);

        const transformedData = dataRows.map((row, index) => ({
          id: index + 1,
          invoiceNumber: row[1] || "",
        }));

        setInvoiceData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  const fetchDataforHistory = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=INVOICE-DELIVERY&timestamp=${timestamp}`
      );
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          invoiceNumber: row[1],
          orderNumber: row[2],
          partyName: row[3],
          saudaNumber: row[4],
          doNo: row[5],
          billDate: row[6],
          billNO: row[7],
          billImage: row[8],
          deliveryTerm: row[9],
          transpoterName: row[10],
          vehicalNo: row[11],
          biltyNo: row[12],
          billStatus: row[13],
          size: row[14],
          section: row[15],
          qty: row[16],
          rate: row[17],
          cashDescount: row[18],
          udaan_vidhan: row[19],
        }));

        // console.log("allData", allData);
        setFilteredHistoryData(allData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
      );
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const allData = json.data.slice(6).map((row, index) => ({
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
          qcPDF: row[40],
          planned7: row[41],
          actual7: row[42],
          billDate: row[45],
          billNo: row[46],
          billImage: row[47],
          size: row[48],
          section: row[49],
          qty: row[50],
          rate: row[51],
          cashDiscount: row[52],
          saudaNo: row[53],
          brokerName: row[54],
          billStatus: row[55],
          pdf: row[40],
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
      // Fixed broker API call with proper sheet parameter
      const brokerResponse = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=SaudaForm`
      );
      const brokerJson = await brokerResponse.json();

      if (brokerJson.success && Array.isArray(brokerJson.data)) {
        const saudaData = brokerJson.data;
        // console.log("SaudaForm data:", saudaData);

        // Find the header row - look for "Broker Name" column
        let headerRowIndex = -1;
        let brokerNameIndex = -1;
        let rateIndex = -1;
        let saudaNoIndex = -1;
        let orderStatusIndex = -1;

        // Search for headers in the first few rows
        for (let i = 0; i < Math.min(10, saudaData.length); i++) {
          if (saudaData[i] && Array.isArray(saudaData[i])) {
            const row = saudaData[i];

            // Check if this row contains the headers we're looking for
            for (let j = 0; j < row.length; j++) {
              const cellValue = row[j]?.toString().toLowerCase().trim();

              if (
                cellValue.includes("broker name") ||
                cellValue === "broker name"
              ) {
                headerRowIndex = i;
                brokerNameIndex = j;
              }
              if (cellValue.includes("rate")) {
                rateIndex = j;
              }
              if (
                cellValue.includes("sauda no") ||
                cellValue.includes("sauda number")
              ) {
                saudaNoIndex = j;
              }
              if (
                cellValue.includes("order status") ||
                cellValue.includes("status")
              ) {
                orderStatusIndex = j;
              }
            }

            // If we found broker name, break
            if (brokerNameIndex !== -1) break;
          }
        }

        // console.log("Header found at row:", headerRowIndex);
        // console.log("Broker Name column:", brokerNameIndex);
        // console.log("Rate column:", rateIndex);
        // console.log("Sauda No column:", saudaNoIndex);
        // console.log("Order Status column:", orderStatusIndex);

        if (headerRowIndex === -1 || brokerNameIndex === -1) {
          console.error("Could not find Broker Name column in SaudaForm sheet");
          // Fallback: assume broker name is in column D (index 3)
          brokerNameIndex = 3;
          headerRowIndex = 0;
          // console.log("Using fallback: Broker Name in column D");
        }

        // Set fallbacks for other columns if not found
        if (rateIndex === -1) rateIndex = 6; // Column G
        if (saudaNoIndex === -1) saudaNoIndex = 1; // Column B
        if (orderStatusIndex === -1) orderStatusIndex = 8; // Fallback column

        // Process data starting from the row after headers
        const dataStartRow = headerRowIndex + 1;
        const dataRows = saudaData.slice(dataStartRow);

        // Extract broker names (only from pending records if Order Status exists)
        let brokerNames = [];
        const mapping = {};

        dataRows.forEach((row) => {
          if (row && Array.isArray(row) && row.length > brokerNameIndex) {
            const broker = row[brokerNameIndex]?.toString().trim();
            const rate = row[rateIndex]?.toString().trim();
            const saudaNo = row[saudaNoIndex]?.toString().trim();
            const orderStatus = row[orderStatusIndex]?.toString().trim();

            if (broker) {
              // If Order Status column exists, only include pending records
              if (orderStatusIndex !== -1 && orderStatus) {
                if (orderStatus.toLowerCase() === "pending") {
                  brokerNames.push(broker);

                  if (rate) {
                    if (!mapping[broker]) {
                      mapping[broker] = [];
                    }
                    mapping[broker].push({ rate, saudaNo: saudaNo || "" });
                  }
                }
              } else {
                // If no Order Status column, include all records
                brokerNames.push(broker);

                if (rate) {
                  if (!mapping[broker]) {
                    mapping[broker] = [];
                  }
                  mapping[broker].push({ rate, saudaNo: saudaNo || "" });
                }
              }
            }
          }
        });

        // Remove duplicates and filter empty values
        const uniqueBrokers = [...new Set(brokerNames)].filter(
          (b) => b && b.trim() !== ""
        );

        // console.log("Extracted brokers:", uniqueBrokers);
        // console.log("Broker rate mapping:", mapping);

        setBrokerNames(uniqueBrokers);
        setBrokerRateMap(mapping);
      } else {
        console.error("Invalid response from SaudaForm sheet:", brokerJson);
      }

      // Rest of your existing code for size and status fetching remains the same...
      const sizeResponse = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master&id=1blHC_0TZh9AuZMptHHB-mPfOi8TqGAvLIgxKhlQHva8`
      );
      const sizeJson = await sizeResponse.json();
      if (sizeJson.success) {
        const uniqueSizes = [
          ...new Set(sizeJson.data.slice(1).map((row) => row[2])),
        ];
        setSizes(uniqueSizes.filter((s) => s));

        const uniqueSections = [
          ...new Set(sizeJson.data.slice(1).map((row) => row[4])),
        ];
        setSections(uniqueSections.filter((s) => s));
      }

      const statusResponse = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master&id=1blHC_0TZh9AuZMptHHB-mPfOi8TqGAvLIgxKhlQHva8`
      );
      const statusJson = await statusResponse.json();
      if (statusJson.success) {
        const uniqueStatuses = [
          ...new Set(statusJson.data.slice(1).map((row) => row[3])),
        ];
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

      // console.log("Original URL:", url);

      if (
        url.includes("drive.google.com/file/d/") &&
        (url.includes("/view") || url.includes("/preview"))
      ) {
        console.log("Already proper drive URL:", url);
        return url;
      }

      let fileId = "";

      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        fileId = fileIdMatch[1];
        // console.log("Extracted file ID from standard format:", fileId);
      } else if (url.includes("open?id=")) {
        try {
          const urlObj = new URL(url);
          fileId = urlObj.searchParams.get("id");
          // console.log("Extracted file ID from open format:", fileId);
        } catch (urlError) {
          console.error("Error parsing open URL:", urlError);
        }
      } else if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
        fileId = url;
        // console.log("URL appears to be direct file ID:", fileId);
      }

      if (!fileId) {
        // console.warn("Could not extract file ID from URL:", url);
        return url;
      }

      const viewerUrl = `https://drive.google.com/file/d/${fileId}/view`;
      // console.log("Generated viewer URL:", viewerUrl);
      return viewerUrl;
    } catch (e) {
      console.error("Error parsing Drive URL:", e);
      return url;
    }
  };

  // Handle global broker change
  const handleGlobalBrokerChange = (broker) => {
    setGlobalBrokerName(broker);
    setBrokerSearch(""); // Clear search after selection
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
            saudaNo: foundRate ? foundRate.saudaNo : "", // This autofills Sauda No.
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
    setBrokerSearch(""); // Clear search when opening modal
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

  const getNextEmptyInvoiceRow = async () => {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "getNextEmptyRow",
          sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
          sheetName: "INVOICE-DELIVERY",
          column: "B",
        }),
      }
    );

    const result = await response.json();
    if (result.success) {
      return result.rowIndex;
    } else {
      throw new Error(result.error);
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
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
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

  function getFormattedDateTime() {
    const now = new Date();

    const pad = (num) => num.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();

    return `${day}/${month}/${year}`;
  }

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

      // Use Promise.all to handle both updates concurrently
      await Promise.all([
        // Update ORDER-INVOICE sheet
        fetch(
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
              rowIndex: currentItem.id + 6,
              columnData: JSON.stringify({
                C: formData.partyName,
              }),
            }),
          }
        ).then((response) => response.json()),

        // Process all rows for INVOICE-DELIVERY
        (async () => {
          for (const row of rows) {
            // Get the next empty row first
            const rowIndex = await getNextEmptyInvoiceRow();

            const rowData = [
              getFormattedDateTime(), // Column A: Timestamp
              "", // Column B: Will be populated with invoice number by server
              orderNumber, // Column C: Order Number
              formData.partyName, // Column D: Party Name
              row.saudaNo || "", // Column E: Sauda No
              currentItem.erpDoNo, // Column F: ERP DO No
              formData.billDate, // Column G: Bill Date
              formData.billNo, // Column H: Bill No
              imageUrl, // Column I: Image URL
              currentItem.deliveryTerm, // Column J: Delivery Term
              currentItem.transporterName, // Column K: Transporter Name
              currentItem.vehicleNumber, // Column L: Vehicle Number
              currentItem.lrNumber, // Column M: LR Number
              formData.billStatus, // Column N: Bill Status
              row.size || "", // Column O: Size
              row.section || "", // Column P: Section
              row.qty || "", // Column Q: Quantity
              row.rate || "", // Column R: Rate
              formData.cashDiscount, // Column S: Cash Discount
              formData.udaanVidhan, // Column T: Udaan Vidhan
            ];

            // Use atomic insertWithSN action which handles invoice number generation
            const updateResponse = await fetch(
              "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
                  sheetName: "INVOICE-DELIVERY",
                  action: "insertWithSN",
                  rowData: JSON.stringify(rowData),
                }),
              }
            );

            const updateResult = await updateResponse.json();
            if (!updateResult.success) {
              throw new Error(
                updateResult.error || "Failed to update Google Sheet"
              );
            }

            // Log the generated invoice number for reference
            if (updateResult.generatedSN) {
              console.log(
                "Generated Invoice Number:",
                updateResult.generatedSN
              );
            }
          }
        })(),
      ]);

      fetchData();
      toast.success(`Invoice(s) submitted successfully!`);
      fetchInvoiceData();
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

  const filteredHistoryData = filteredHistoryDatas
    .filter((item) => {
      const matchesSearch = item.partyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
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
                        checked={selectedColumns.includes(column.id)}
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
              History ({filteredHistoryData?.length})
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
                            Vehical No
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
                        {selectedColumns.includes("invoiceNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice No
                          </th>
                        )}
                        {selectedColumns.includes("orderNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                        )}
                        {selectedColumns.includes("partyName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party Name
                          </th>
                        )}
                        {selectedColumns.includes("saudaNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            sauda No
                          </th>
                        )}
                        {selectedColumns.includes("doNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Do No
                          </th>
                        )}
                        {selectedColumns.includes("billDate") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Date
                          </th>
                        )}
                        {selectedColumns.includes("billNO") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill No
                          </th>
                        )}
                        {selectedColumns.includes("billImage") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Image
                          </th>
                        )}
                        {selectedColumns.includes("deliveryTerm") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Term
                          </th>
                        )}
                        {selectedColumns.includes("transpoterName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transpoter Name
                          </th>
                        )}
                        {selectedColumns.includes("vehicalNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehical No
                          </th>
                        )}
                        {selectedColumns.includes("biltyNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bilty No
                          </th>
                        )}
                        {selectedColumns.includes("billStatus") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill Status
                          </th>
                        )}
                        {selectedColumns.includes("size") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                        )}
                        {selectedColumns.includes("section") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                        )}
                        {selectedColumns.includes("qty") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                        )}
                        {selectedColumns.includes("rate") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rate
                          </th>
                        )}
                        {selectedColumns.includes("cashDescount") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cash Descount
                          </th>
                        )}
                        {selectedColumns.includes("udaan_vidhan") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Udaan/Vidhan
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {selectedColumns.includes("invoiceNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.invoiceNumber}
                            </td>
                          )}
                          {selectedColumns.includes("orderNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.orderNumber}
                            </td>
                          )}
                          {selectedColumns.includes("partyName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.partyName}
                            </td>
                          )}
                          {selectedColumns.includes("saudaNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.saudaNumber}
                            </td>
                          )}
                          {selectedColumns.includes("doNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.doNo}
                            </td>
                          )}
                          {selectedColumns.includes("billDate") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.billDate
                                ? new Date(item.billDate).toLocaleDateString()
                                : "-"}
                            </td>
                          )}
                          {selectedColumns.includes("billNO") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.billNO}
                            </td>
                          )}
                          {selectedColumns.includes("billImage") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.billImage ? (
                                <button
                                  onClick={(e) =>
                                    handleViewPDF(item.billImage, e)
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
                          )}
                          {selectedColumns.includes("deliveryTerm") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.deliveryTerm}
                            </td>
                          )}
                          {selectedColumns.includes("transpoterName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.transpoterName}
                            </td>
                          )}
                          {selectedColumns.includes("vehicalNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicalNo}
                            </td>
                          )}
                          {selectedColumns.includes("biltyNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.biltyNo}
                            </td>
                          )}
                          {selectedColumns.includes("billStatus") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.billStatus}
                            </td>
                          )}
                          {selectedColumns.includes("size") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.size}
                            </td>
                          )}
                          {selectedColumns.includes("section") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.section}
                            </td>
                          )}
                          {selectedColumns.includes("qty") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.qty}
                            </td>
                          )}
                          {selectedColumns.includes("rate") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.rate}
                            </td>
                          )}
                          {selectedColumns.includes("cashDescount") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.cashDescount}
                            </td>
                          )}
                          {selectedColumns.includes("udaan_vidhan") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.udaan_vidhan}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistoryData.length === 0 && !loading && (
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
                      Vehical
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
                        tabIndex={0} // <-- add this
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
                      value={globalBrokerName || undefined} // Use globalBrokerName instead
                      onChange={(selectedBroker) => {
                        handleGlobalBrokerChange(selectedBroker); // This will update all necessary states
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
                            {/* In the Size & Rate Details table */}

                            <td className="px-4 py-3">
                              <CustomSelect
                                placeholder="Select Size"
                                value={row.size || undefined}
                                onChange={(value) =>
                                  handleRowInputChange(row.id, "size", value)
                                }
                                options={sizes} // ye tumhara sizes array
                                className="w-[100px]"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <CustomSelect
                                placeholder="Select Section"
                                value={row.section || undefined}
                                onChange={(value) =>
                                  handleRowInputChange(row.id, "section", value)
                                }
                                options={sections} // ye tumhara sections array
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

                            {/* Updated */}

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

              {/* Button section */}

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
