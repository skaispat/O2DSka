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
import jsPDF from "jspdf";

const QC = () => {
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
  const [formData, setFormData] = useState({
    section: "",
    tagProper: "",
    typeOfMaterial: "",
    redNess: "",
    noRust: "",
    bundleCountNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    "serialNumber",
    "partyName",
    "erpDoNo",
    "transporterName",
    "vehicleNumber",
    "brandName",
    "dispatchQty",
    "lrNumber",
    "gateInDateTime",
  ]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Column options for both tabs
  const columnOptions = {
    pending: [
      { id: "serialNumber", label: "Serial Number" },
      { id: "partyName", label: "Party Name" },
      { id: "erpDoNo", label: "ERP DO No." },
      { id: "transporterName", label: "Transporter Name" },
      { id: "vehicleNumber", label: "Vehicle Number" },
      { id: "brandName", label: "Brand Name" },
      { id: "dispatchQty", label: "Dispatch Qty" },
      { id: "lrNumber", label: "LR No." },
      { id: "gateInDateTime", label: "Gate In Date&Time" },
    ],
    history: [
      { id: "serialNumber", label: "Serial Number" },
      { id: "actual6", label: "QC Date" },
      { id: "partyName", label: "Party Name" },
      { id: "erpDoNo", label: "ERP DO No." },
      { id: "vehicleNumber", label: "Vehicle Number" },
      { id: "brandName", label: "Brand Name" },
      { id: "dispatchQty", label: "Dispatch Qty" },
      { id: "section", label: "Section" },
      { id: "tagProper", label: "Tag Proper" },
      { id: "typeOfMaterial", label: "Type Of Material" },
      { id: "redNess", label: "Red Ness" },
      { id: "noRust", label: "No Rust" },
      { id: "bundleCountNo", label: "Bundle Count No." },
      { id: "lrNumber", label: "LR No." },
      { id: "gateInDateTime", label: "Gate In Date&Time" },
      { id: "pdf", label: "PDF" },
    ],
  };

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
        .from('order_invoice')
        .select(`
          id,
          order_no,
          party_name,
          erp_do_no,
          transporter_name,
          lr_number,
          vehicle_number,
          delivery_term,
          brand_name,
          dispatch_qty,
          planned6,
          actual6,
          section,
          tag_proper,
          type_of_material,
          red_ness,
          no_rust,
          bundle_count_no,
          pdf,
          gate_in_date_and_time,
          timestamp
        `)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data) {
        const allData = data.map((row) => ({
          id: row.id,
          serialNumber: row.order_no,
          partyName: row.party_name,
          erpDoNo: row.erp_do_no,
          transporterName: row.transporter_name,
          lrNumber: row.lr_number,
          vehicleNumber: row.vehicle_number,
          deliveryTerm: row.delivery_term,
          brandName: row.brand_name,
          dispatchQty: row.dispatch_qty,
          planned6: row.planned6,
          actual6: row.actual6,
          section: row.section,
          tagProper: row.tag_proper,
          typeOfMaterial: row.type_of_material,
          redNess: row.red_ness,
          noRust: row.no_rust,
          bundleCountNo: row.bundle_count_no,
          pdf: row.pdf,
          gateInDateTime: row.gate_in_date_and_time,
          vehicalNo: row.vehicle_number,
        }));

        const pending = allData.filter(
          (item) =>
            item.planned6 &&
            item.planned6.trim() !== "" &&
            (!item.actual6 || item.actual6.trim() === "")
        );

        const history = allData.filter(
          (item) =>
            item.planned6 &&
            item.planned6.trim() !== "" &&
            item.actual6 &&
            item.actual6.trim() !== ""
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

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setFormData({
      section: item.section || "",
      tagProper: item.tagProper || "",
      typeOfMaterial: item.typeOfMaterial || "",
      redNess: item.redNess || "",
      noRust: item.noRust || "",
      bundleCountNo: item.bundleCountNo || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({
      section: "",
      tagProper: "",
      typeOfMaterial: "",
      redNess: "",
      noRust: "",
      bundleCountNo: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();

      // ===== Page Border =====
      doc.setDrawColor(0, 0, 0);
      doc.rect(5, 5, 200, 287);

      // ===== Party Name =====
      doc.setFillColor(220, 235, 250);
      doc.setDrawColor(23, 107, 135);
      doc.roundedRect(10, 20, 190, 20, 3, 3, "FD");
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Party Name : ${currentItem.partyName || "N/A"}`, 105, 32, {
        align: "center",
      });

      // ===== Basic Information =====
      doc.setFillColor(235, 245, 255);
      doc.setDrawColor(180, 210, 255);
      doc.roundedRect(10, 45, 190, 35, 3, 3, "FD");

      doc.setFillColor(23, 107, 135);
      doc.rect(10, 45, 190, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Basic Information", 15, 50);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`LR NO.: ${currentItem.lrNumber || "N/A"}`, 15, 60);

      doc.text(
        `GATE IN DETAILS : ${new Date(
          currentItem.gateInDateTime
        ).toLocaleDateString("en-GB")}`,
        115,
        60
      );

      doc.text(`VEHICAL NUMBER : ${currentItem.vehicalNo || "N/A"}`, 115, 70);

      doc.text(`BRAND NAME : ${currentItem.brandName || "N/A"}`, 15, 70);

      // ===== BOUNLE COUNT NO. =====
      doc.setFillColor(210, 230, 250);
      doc.setDrawColor(23, 107, 135);
      doc.roundedRect(10, 85, 190, 20, 3, 3, "FD");
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `BOUNDLE COUNT NO.: ${formData.bundleCountNo || "N/A"}`,
        105,
        97,
        { align: "center" }
      );

      // ===== Inspection Details Section =====
      const inspY = 110;
      doc.setFillColor(230, 245, 255);
      doc.setDrawColor(180, 210, 255);
      doc.roundedRect(10, inspY, 190, 70, 3, 3, "FD");

      doc.setFillColor(23, 107, 135);
      doc.rect(10, inspY, 190, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Inspection Details", 15, inspY + 5);

      // ---- Table ----
      const tableX = 35;
      const labelWidth = 60;
      const valueWidth = 80;
      const rowHeight = 10;
      let tableY = inspY + 10;

      const rows = [
        ["Section", formData.section || "N/A"],
        ["Tag Proper", formData.tagProper || "N/A"],
        ["Type Of Material", formData.typeOfMaterial || "N/A"],
        ["Red Ness", formData.redNess || "N/A"],
        ["No Rust", formData.noRust || "N/A"],
      ];

      rows.forEach(([label, value]) => {
        doc.setDrawColor(160, 200, 255);
        doc.setFillColor(255, 255, 255);
        doc.rect(tableX, tableY, labelWidth, rowHeight, "FD");
        doc.rect(tableX + labelWidth, tableY, valueWidth, rowHeight, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(label, tableX + 2, tableY + 7);
        doc.text(value, tableX + labelWidth + 2, tableY + 7);
        tableY += rowHeight;
      });

      // ===== Watermark =====
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text("@Botivate_2025 | Quality Control Report", 105, 290, {
        align: "center",
      });

      // ===== Output PDF =====
      const pdfOutput = doc.output("datauristring");
      
      return {
        success: true,
        fileUrl: pdfOutput,
        fileName: `QC_Report_${
          currentItem.serialNumber || "Unknown"
        }_${Date.now()}.pdf`,
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`PDF Generation Error: ${error.message}`);
      return {
        success: false,
        error: error.message || "Failed to generate PDF",
      };
    }
  };

  const uploadPDFToSupabase = async (pdfResult) => {
    try {
      // Extract base64 data
      const base64Data = pdfResult.fileUrl.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });

      // Generate unique file name
      const fileName = `qc-reports/${pdfResult.fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('qc_reports')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('qc_reports')
        .getPublicUrl(fileName);

      return {
        success: true,
        fileUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error("Error uploading PDF:", error);
      return { 
        success: false, 
        error: error.message || "Failed to upload PDF" 
      };
    }
  };

  const handleSubmitQC = async () => {
    setIsSubmitting(true);
    const currentDateTime = new Date().toLocaleString("en-CA", { 
  timeZone: "Asia/Kolkata", 
  hour12: false 
}).replace(',', '') 

    try {
      // Generate PDF
      const pdfResult = await generatePDF();
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || "Failed to generate PDF");
      }

      // Upload PDF to Supabase
      const uploadResult = await uploadPDFToSupabase(pdfResult);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload PDF");
      }

      // Update the record in Supabase
      const { error: updateError } = await supabase
        .from('order_invoice')
        .update({
          actual6: currentDateTime,
          section: formData.section,
          tag_proper: formData.tagProper,
          type_of_material: formData.typeOfMaterial,
          red_ness: formData.redNess,
          no_rust: formData.noRust,
          bundle_count_no: formData.bundleCountNo,
          pdf: uploadResult.fileUrl,
          // planned7: currentDateTime,
        })
        .eq('id', currentItem.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      toast.success("QC data submitted successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting QC data:", error);
      toast.error(`Failed to submit QC data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter data by order_no (serialNumber) and partyName
  const filteredPendingData = pendingData
    .filter((item) => {
      const orderNo = item.serialNumber ? String(item.serialNumber).toLowerCase() : "";
      const partyName = item.partyName ? String(item.partyName).toLowerCase() : "";
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        orderNo.includes(searchLower) ||
        partyName.includes(searchLower);
      
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      
      return matchesSearch && matchesParty;
    })
    .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const orderNo = item.serialNumber ? String(item.serialNumber).toLowerCase() : "";
      const partyName = item.partyName ? String(item.partyName).toLowerCase() : "";
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        orderNo.includes(searchLower) ||
        partyName.includes(searchLower);
      
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
          {selectedColumns.includes("serialNumber") && (
            <p className="text-sm font-medium text-gray-900">
              Serial: {item.serialNumber}
            </p>
          )}
          {selectedColumns.includes("partyName") && (
            <p className="text-sm text-gray-600 mt-1">
              Party: {item.partyName}
            </p>
          )}
        </div>
        <button
          onClick={() => handleOpenModal(item)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          QC
        </button>
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
        {selectedColumns.includes("brandName") && item.brandName && (
          <div>
            <span className="text-gray-500">Brand:</span>
            <p className="font-medium">{item.brandName}</p>
          </div>
        )}
        {selectedColumns.includes("dispatchQty") && item.dispatchQty && (
          <div>
            <span className="text-gray-500">Qty:</span>
            <p className="font-medium">{item.dispatchQty}</p>
          </div>
        )}
        {selectedColumns.includes("lrNumber") && item.lrNumber && (
          <div>
            <span className="text-gray-500">LR No:</span>
            <p className="font-medium">{item.lrNumber}</p>
          </div>
        )}
        {selectedColumns.includes("gateInDateTime") && item.gateInDateTime && (
          <div>
            <span className="text-gray-500">Gate In:</span>
            <p className="font-medium">
              {new Date(item.gateInDateTime).toLocaleDateString("en-GB")}
            </p>
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
              Serial: {item.serialNumber}
            </p>
          )}
          {selectedColumns.includes("partyName") && (
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
      
      <div className="space-y-2 text-sm">
        {selectedColumns.includes("actual6") && item.actual6 && (
          <div>
            <span className="text-gray-500">QC Date:</span>
            <p className="font-medium">
              {new Date(item.actual6).toLocaleString()}
            </p>
          </div>
        )}
        
        {selectedColumns.includes("erpDoNo") && item.erpDoNo && (
          <div>
            <span className="text-gray-500">ERP DO:</span>
            <p className="font-medium">{item.erpDoNo}</p>
          </div>
        )}
        
        {selectedColumns.includes("vehicleNumber") && item.vehicleNumber && (
          <div>
            <span className="text-gray-500">Vehicle:</span>
            <p className="font-medium">{item.vehicleNumber}</p>
          </div>
        )}
        
        {selectedColumns.includes("brandName") && item.brandName && (
          <div>
            <span className="text-gray-500">Brand:</span>
            <p className="font-medium">{item.brandName}</p>
          </div>
        )}
        
        {selectedColumns.includes("dispatchQty") && item.dispatchQty && (
          <div>
            <span className="text-gray-500">Qty:</span>
            <p className="font-medium">{item.dispatchQty}</p>
          </div>
        )}
        
        {selectedColumns.includes("section") && item.section && (
          <div>
            <span className="text-gray-500">Section:</span>
            <p className="font-medium">{item.section}</p>
          </div>
        )}
        
        {selectedColumns.includes("tagProper") && item.tagProper && (
          <div>
            <span className="text-gray-500">Tag Proper:</span>
            <p className="font-medium">{item.tagProper}</p>
          </div>
        )}
        
        {selectedColumns.includes("typeOfMaterial") && item.typeOfMaterial && (
          <div>
            <span className="text-gray-500">Material Type:</span>
            <p className="font-medium">{item.typeOfMaterial}</p>
          </div>
        )}
        
        {selectedColumns.includes("redNess") && item.redNess && (
          <div>
            <span className="text-gray-500">Red Ness:</span>
            <p className="font-medium">{item.redNess}</p>
          </div>
        )}
        
        {selectedColumns.includes("noRust") && item.noRust && (
          <div>
            <span className="text-gray-500">No Rust:</span>
            <p className="font-medium">{item.noRust}</p>
          </div>
        )}
        
        {selectedColumns.includes("bundleCountNo") && item.bundleCountNo && (
          <div>
            <span className="text-gray-500">Bundle Count:</span>
            <p className="font-medium">{item.bundleCountNo}</p>
          </div>
        )}
        
        {selectedColumns.includes("lrNumber") && item.lrNumber && (
          <div>
            <span className="text-gray-500">LR No:</span>
            <p className="font-medium">{item.lrNumber}</p>
          </div>
        )}
        
        {selectedColumns.includes("gateInDateTime") && item.gateInDateTime && (
          <div>
            <span className="text-gray-500">Gate In:</span>
            <p className="font-medium">{item.gateInDateTime}</p>
          </div>
        )}
        
        {selectedColumns.includes("pdf") && item.pdf && (
          <div>
            <span className="text-gray-500">PDF:</span>
            <a
              href={item.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Report
            </a>
          </div>
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
                <h2 className="text-xl font-bold">QC Details</h2>
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
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.partyName}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ERP DO No.
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.erpDoNo}
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

              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Enter section"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Proper
                  </label>
                  <select
                    name="tagProper"
                    value={formData.tagProper}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Of Material
                  </label>
                  <select
                    name="typeOfMaterial"
                    value={formData.typeOfMaterial}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Select option</option>
                    <option value="Straight">Straight</option>
                    <option value="Bend">Bend</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Red Ness
                  </label>
                  <input
                    type="text"
                    name="redNess"
                    value={formData.redNess}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Enter red ness"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No Rust
                  </label>
                  <input
                    type="text"
                    name="noRust"
                    value={formData.noRust}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Enter no rust"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bundle Count No.
                  </label>
                  <input
                    type="text"
                    name="bundleCountNo"
                    value={formData.bundleCountNo}
                    onChange={handleInputChange}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Enter bundle count no."
                  />
                </div>
              </div>
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
                onClick={handleSubmitQC}
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
                    Submitting...
                  </>
                ) : (
                  "Submit QC"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">QC</h1>
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
                            No pending QC records found.
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
                            {selectedColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial Number
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
                            {selectedColumns.includes("brandName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand Name
                              </th>
                            )}
                            {selectedColumns.includes("dispatchQty") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dispatch Qty
                              </th>
                            )}
                            {selectedColumns.includes("lrNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LR No.
                              </th>
                            )}
                            {selectedColumns.includes("gateInDateTime") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gate In Date&Time
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
                                  QC
                                </button>
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
                              {selectedColumns.includes("brandName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.brandName}
                                </td>
                              )}
                              {selectedColumns.includes("dispatchQty") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.dispatchQty}
                                </td>
                              )}
                              {selectedColumns.includes("lrNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.lrNumber}
                                </td>
                              )}
                              {selectedColumns.includes("gateInDateTime") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.gateInDateTime
                                    ? new Date(
                                        item.gateInDateTime
                                      ).toLocaleDateString("en-GB")
                                    : "N/A"}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredPendingData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No pending QC records found.
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
                            No historical QC records found.
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
                            {selectedColumns.includes("serialNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial Number
                              </th>
                            )}
                            {selectedColumns.includes("actual6") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                QC Date
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
                            {selectedColumns.includes("vehicleNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle Number
                              </th>
                            )}
                            {selectedColumns.includes("brandName") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand Name
                              </th>
                            )}
                            {selectedColumns.includes("dispatchQty") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dispatch Qty
                              </th>
                            )}
                            {selectedColumns.includes("section") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section
                              </th>
                            )}
                            {selectedColumns.includes("tagProper") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tag Proper
                              </th>
                            )}
                            {selectedColumns.includes("typeOfMaterial") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type Of Material
                              </th>
                            )}
                            {selectedColumns.includes("redNess") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Red Ness
                              </th>
                            )}
                            {selectedColumns.includes("noRust") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No Rust
                              </th>
                            )}
                            {selectedColumns.includes("bundleCountNo") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bundle Count No.
                              </th>
                            )}
                            {selectedColumns.includes("lrNumber") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LR No.
                              </th>
                            )}
                            {selectedColumns.includes("gateInDateTime") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gate In Date&Time
                              </th>
                            )}
                            {selectedColumns.includes("pdf") && (
                              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PDF
                              </th>
                            )}
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
                              {selectedColumns.includes("serialNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.serialNumber}
                                </td>
                              )}
                              {selectedColumns.includes("actual6") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.actual6
                                    ? new Date(item.actual6).toLocaleString()
                                    : "-"}
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
                              {selectedColumns.includes("vehicleNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.vehicleNumber}
                                </td>
                              )}
                              {selectedColumns.includes("brandName") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.brandName}
                                </td>
                              )}
                              {selectedColumns.includes("dispatchQty") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.dispatchQty}
                                </td>
                              )}
                              {selectedColumns.includes("section") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.section || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("tagProper") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.tagProper || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("typeOfMaterial") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.typeOfMaterial || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("redNess") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.redNess || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("noRust") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.noRust || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("bundleCountNo") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.bundleCountNo || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("lrNumber") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.lrNumber || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("gateInDateTime") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.gateInDateTime || "-"}
                                </td>
                              )}
                              {selectedColumns.includes("pdf") && (
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.pdf ? (
                                    <a
                                      href={item.pdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800"
                                    >
                                      View
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredHistoryData.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-500 text-sm md:text-base">
                            No historical QC records found.
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

export default QC;