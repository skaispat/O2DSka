import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Filter, Search, RefreshCw, Eye } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { Select } from "antd";
import CustomSelect from "../utils/CustomSelect";

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
  const { Option } = Select;
  const [partyNames, setPartyNames] = useState([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [showTransporterDropdown, setShowTransporterDropdown] = useState(false);
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [isAddingTransporter, setIsAddingTransporter] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const brandDropdownRef = useRef(null);
  const partyDropdownRef = useRef(null);
  const transporterDropdownRef = useRef(null);

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
      if (
        transporterDropdownRef.current &&
        !transporterDropdownRef.current.contains(event.target)
      ) {
        setShowTransporterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // Show dropdown when typing in specific fields
    if (name === "brandName") {
      setShowBrandDropdown(true);
    } else if (name === "partyName") {
      setShowPartyDropdown(true);
    }
  };
  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brandName: brand }));
    setShowBrandDropdown(false);
  };

  const handlePartySelect = (party) => {
    setFormData((prev) => ({ ...prev, partyName: party }));
    setShowPartyDropdown(false);
  };

  const handleTransporterSelect = (transporter) => {
    setSelectedTransporter(transporter);
    setShowTransporterDropdown(false);
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

      await fetchPartyNames();
      toast.success(`Party "${partyName}" added successfully!`);
      return true;
    } catch (error) {
      console.error("Error adding party:", error);
      toast.error(`Failed to add party: ${error.message}`);
      return false;
    }
  };

  const fetchPartyNames = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master"
      );
      const data = await response.json();
      if (data.success && data.data && data.data.length > 1) {
        const parties = data.data
          .slice(1)
          .map((row) => (row[6] ? row[6].toString().trim() : "")) // Column G (index 6)
          .filter((party) => party !== "");

        setPartyNames([...new Set(parties.filter((p) => p))]);
      }
    } catch (error) {
      console.error("Error fetching party names:", error);
      setPartyNames([]);
    }
  };

  const handleAddNewParty = async () => {
    const currentSearchValue = document.querySelector(
      ".party-select .ant-select-selection-search input"
    )?.value;
    const partyToAdd = currentSearchValue || formData.partyName;

    if (
      partyToAdd &&
      partyToAdd.trim() &&
      !partyNames.includes(partyToAdd.trim())
    ) {
      setIsAddingParty(true);
      const success = await addNewPartyToMaster(partyToAdd.trim());
      if (success) {
        setFormData((prev) => ({ ...prev, partyName: partyToAdd.trim() }));
      }
      setIsAddingParty(false);
    } else if (partyToAdd && partyNames.includes(partyToAdd.trim())) {
      toast.info("Party already exists");
    } else {
      toast.error("Please enter a party name first");
    }
  };

  const handleAddNewTransporter = async () => {
    const currentSearchValue = document.querySelector(
      ".transporter-select .ant-select-selection-search input"
    )?.value;
    const transporterToAdd = currentSearchValue || selectedTransporter;

    if (
      transporterToAdd &&
      transporterToAdd.trim() &&
      !transporterName.includes(transporterToAdd.trim())
    ) {
      setIsAddingTransporter(true);
      const success = await addNewTransporterToMaster(transporterToAdd.trim());
      if (success) {
        setSelectedTransporter(transporterToAdd.trim());
      }
      setIsAddingTransporter(false);
    } else if (
      transporterToAdd &&
      transporterName.includes(transporterToAdd.trim())
    ) {
      toast.info("Transporter already exists");
    } else {
      toast.error("Please enter a transporter name first");
    }
  };

  useEffect(() => {
    fetchPartyNames();
  }, []);

  const addNewTransporterToMaster = async (transporterName) => {
    try {
      const rowData = [transporterName.trim()];

      const encodedSheetName = encodeURIComponent("Main Master");

      const payload = new URLSearchParams();
      payload.append("action", "insertTransporterOnly");
      payload.append("sheetName", encodedSheetName);
      payload.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString(),
        }
      );

      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to add transporter");

      await fetchMainMasterData();
      toast.success(`Transporter "${transporterName}" added successfully!`);
      return true;
    } catch (error) {
      console.error("Error adding transporter:", error);
      toast.error(`Failed to add transporter: ${error.message}`);
      return false;
    }
  };

  const filteredBrandOptions =
    formData.brandName && formData.brandName.trim() !== ""
      ? brandOptions.filter((brand) =>
          brand.toLowerCase().includes(formData.brandName.toLowerCase())
        )
      : brandOptions;

  const filteredPartyOptions =
    formData.partyName && formData.partyName.trim() !== ""
      ? partyNames.filter((party) =>
          party.toLowerCase().includes(formData.partyName.toLowerCase())
        )
      : partyNames;

  const filteredTransporterOptions =
    selectedTransporter && selectedTransporter.trim() !== ""
      ? transporterName.filter((transporter) =>
          transporter.toLowerCase().includes(selectedTransporter.toLowerCase())
        )
      : transporterName;

  const [showDealerModal, setShowDealerModal] = useState({
    show: false,
    brandName: "",
    callback: null,
  });

  const handleAddNewBrand = async () => {
    const currentSearchValue = document.querySelector(
      ".brand-select .ant-select-selection-search input"
    )?.value;
    const brandToAdd = currentSearchValue || formData.brandName;

    if (
      brandToAdd &&
      brandToAdd.trim() &&
      !brandOptions.includes(brandToAdd.trim())
    ) {
      setIsAddingBrand(true);
      const success = await addNewBrandToMaster(brandToAdd.trim());
      if (success) {
        setFormData((prev) => ({ ...prev, brandName: brandToAdd.trim() }));
      }
      setIsAddingBrand(false);
    } else if (brandToAdd && brandOptions.includes(brandToAdd.trim())) {
      toast.info("Brand already exists");
    } else {
      toast.error("Please enter a brand name first");
    }
  };

  const addNewBrandToMaster = async (brandName) => {
    try {
      // Include empty values for all columns up to column G (dealer name)
      const rowData = [
        brandName.trim(), // Column A: Brand Name
        "", // Column B: Empty
        "", // Column C: Empty
        "", // Column D: Empty
        "", // Column E: Empty
        "", // Column F: Empty
        "", // Column G: Dealer Name (empty for now)
      ];

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

      // Refresh brand options
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

            setBrandOptions([...new Set(brands.filter((b) => b))]);
          }
        } catch (error) {
          console.error("Error fetching master data:", error);
        }
      };

      await fetchMasterData();
      toast.success(`Brand "${brandName}" added successfully!`);
      return true;
    } catch (error) {
      console.error("Error adding brand:", error);
      toast.error(`Failed to add brand: ${error.message}`);
      return false;
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
      const timeStemp = getFormattedDateTime();
      console.log("timeStemp", timeStemp);

      // Remove the commented out manual order number generation code
      // The server will now automatically generate the order number

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
              timeStemp, // Column A: Timestamp
              "", // Column B: Order Number (auto-generated by server)
              data.partyName, // Column C
              data.erpDoNo, // Column D
              selectedTransporter, // Column E
              data.lrNumber, // Column F
              data.vehicleNumber, // Column G
              data.deliveryTerm, // Column H
              data.brandName, // Column I
              data.dispatchQty, // Column J
            ]),
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save to Google Sheet");
      }

      // Log the generated order number for reference
      if (result.generatedOrderNumber) {
        console.log("Generated Order Number:", result.generatedOrderNumber);
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

  const filteredData = doData.filter((item) => {
    const partyName = String(item.partyName || ""); // always string bana diya

    const matchesSearch = partyName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesParty = filterParty === "all" || partyName === filterParty;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !item.completed) ||
      (statusFilter === "complete" && item.completed);

    return matchesSearch && matchesParty && matchesStatus;
  });

  const uniqueParties = [...new Set(doData.map((item) => item.partyName))];

  // const handleSubmitVehicleNumber = async (id, orderNo) => {
  //   try {
  //     const vehicleNumber = editedVehicleNumbers[id];
  //     setChangeVehicalNo(true);
  //     const responseOrderInvoice = await fetch(
  //       "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //         body: new URLSearchParams({
  //           sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
  //           sheetName: "ORDER-INVOICE",
  //           action: "updateVehicleByOrderNoOrderInvoice",
  //           orderNo: orderNo,
  //           vehicleNumber: vehicleNumber,
  //         }),
  //       }
  //     );

  //     const responseInvoiceDelivery = await fetch(
  //       "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //         body: new URLSearchParams({
  //           sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
  //           sheetName: "INVOICE-DELIVERY",
  //           action: "updateVehicleByOrderNoInvoiceDelivery",
  //           orderNo: orderNo,
  //           vehicleNumber: vehicleNumber,
  //         }),
  //       }
  //     );

  //     const resultOrderInvoice = await responseOrderInvoice.json();

  //     if (resultOrderInvoice.success) {
  //       toast.success("Vehicle number updated successfully!");

  //       setDoData((prevData) =>
  //         prevData.map((item) =>
  //           item.serialNumber === orderNo
  //             ? { ...item, vehicleNumber: vehicleNumber }
  //             : item
  //         )
  //       );

  //       setEditingId(null);
  //     } else {
  //       setEditingId(null);
  //       throw new Error(
  //         resultOrderInvoice.error || "Failed to update vehicle number"
  //       );
  //     }

  //     const resultInvoiceDelivery = await responseInvoiceDelivery.json();
  //     console.log("resultInvoiceDelivery",resultInvoiceDelivery)

  //     if (!resultInvoiceDelivery.success) {
  //       throw new Error(
  //         resultInvoiceDelivery.error ||
  //           "Failed to update vehicle number in Invoice-Delivery"
  //       );
  //       setEditingId(null);
  //     }
  //   } catch (error) {
  //     console.error("Error updating vehicle number:", error);
  //     toast.error("Failed to update vehicle number");
  //   } finally {
  //     setChangeVehicalNo(false);
  //   }
  // };

  const handleSubmitVehicleNumber = async (id, orderNo) => {
    try {
      const vehicleNumber = editedVehicleNumbers[id];
      setChangeVehicalNo(true);

      // Execute both requests in parallel
      const [resultOrderInvoice, resultInvoiceDelivery] = await Promise.all([
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
              action: "updateVehicleByOrderNoOrderInvoice",
              orderNo: orderNo,
              vehicleNumber: vehicleNumber,
            }),
          }
        ).then((res) => res.json()),

        fetch(
          "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
              sheetName: "INVOICE-DELIVERY",
              action: "updateVehicleByOrderNoInvoiceDelivery",
              orderNo: orderNo,
              vehicleNumber: vehicleNumber,
            }),
          }
        ).then((res) => res.json()),
      ]);

      // Check if both updates were successful
      if (resultOrderInvoice.success) {
        toast.success("Vehicle number updated successfully in both sheets!");

        // Update local state
        setDoData((prevData) =>
          prevData.map((item) =>
            item.serialNumber === orderNo
              ? { ...item, vehicleNumber: vehicleNumber }
              : item
          )
        );

        setEditingId(null);
      } else {
        // Handle partial success or failure
        const errors = [];
        if (!resultOrderInvoice.success) {
          errors.push(`ORDER-INVOICE: ${resultOrderInvoice.error}`);
        }
        if (!resultInvoiceDelivery.success) {
          errors.push(`INVOICE-DELIVERY: ${resultInvoiceDelivery.error}`);
        }
        throw new Error(errors.join(", "));
      }
    } catch (error) {
      console.error("Error updating vehicle number:", error);
      toast.error("Failed to update vehicle number");
      setEditingId(null);
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
            onClick={() => {
              resetFormData();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Generate DO
          </button>
          <button
            onClick={() => {
              resetFormData();
              setShowModal(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          ></button>
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
                {/* Party Name */}
                {/* <div className="relative" ref={partyDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleInputChange}
                    onFocus={() => setShowPartyDropdown(true)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type to search or add party..."
                    required
                  />

                  {showPartyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredPartyOptions.length > 0 ? (
                        filteredPartyOptions.map((party, index) => (
                          <div
                            key={index}
                            onClick={() => handlePartySelect(party)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {party}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          No parties found
                        </div>
                      )}

                      {formData.partyName &&
                        formData.partyName.trim() !== "" &&
                        !partyNames.includes(formData.partyName.trim()) && (
                          <div
                            onClick={() =>
                              addNewPartyToMaster(formData.partyName.trim())
                            }
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200"
                          >
                            + Add "{formData.partyName.trim()}" as new party
                          </div>
                        )}
                    </div>
                  )}
                </div> */}

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
                    filterOption={false}
                    notFoundContent={null}
                    dropdownRender={(menu) => (
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
                    className="w-full party-select"
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

                {/* Transporter Name */}
                {/* <div className="relative" ref={transporterDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transporter Name
                  </label>
                  <input
                    type="text"
                    value={selectedTransporter}
                    onChange={(e) => setSelectedTransporter(e.target.value)}
                    onFocus={() => setShowTransporterDropdown(true)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type to search or add transporter..."
                  />

                  {showTransporterDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredTransporterOptions.length > 0 ? (
                        filteredTransporterOptions.map((transporter, index) => (
                          <div
                            key={index}
                            onClick={() => handleTransporterSelect(transporter)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {transporter}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          No transporters found
                        </div>
                      )}

                      {selectedTransporter &&
                        selectedTransporter.trim() !== "" &&
                        !transporterName.includes(
                          selectedTransporter.trim()
                        ) && (
                          <div
                            onClick={() =>
                              addNewTransporterToMaster(
                                selectedTransporter.trim()
                              )
                            }
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200"
                          >
                            + Add "{selectedTransporter.trim()}" as new
                            transporter
                          </div>
                        )}
                    </div>
                  )}
                </div> */}

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
                    filterOption={false}
                    notFoundContent={null}
                    dropdownRender={(menu) => (
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
                    className="w-full transporter-select"
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
                    className="w-full h-[42px]"
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
                {/* <div className="relative" ref={brandDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    onFocus={() => setShowBrandDropdown(true)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type to search or add brand..."
                    required
                  />

                  {showBrandDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredBrandOptions.length > 0 ? (
                        filteredBrandOptions.map((brand, index) => (
                          <div
                            key={index}
                            onClick={() => handleBrandSelect(brand)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {brand}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          No brands found
                        </div>
                      )}

                      {formData.brandName &&
                        formData.brandName.trim() !== "" &&
                        !brandOptions.includes(formData.brandName.trim()) && (
                          <div
                            onClick={() =>
                              addNewBrandToMaster(formData.brandName.trim())
                            }
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-600 border-t border-gray-200"
                          >
                            + Add "{formData.brandName.trim()}" as new brand
                          </div>
                        )}
                    </div>
                  )}
                </div> */}

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
                    className="w-full brand-select"
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
