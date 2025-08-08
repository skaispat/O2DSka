import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  Upload,
  RefreshCw,
  Columns,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

// Import jsPDF - you need to install it: npm install jspdf
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
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
      );
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          serialNumber: row[1], // Column A
          partyName: row[2], // Column C
          erpDoNo: row[3], // Column D
          transporterName: row[4], // Column E
          lrNumber: row[5], // Column F
          vehicleNumber: row[6], // Column G
          deliveryTerm: row[7], // Column H
          brandName: row[8], // Column I
          dispatchQty: row[9], // Column J
          planned6: row[31], // Column AF - Planned6
          actual6: row[32], // Column AG - Actual6
          section: row[34], // Column AI - Section
          tagProper: row[35], // Column AJ - Tag Proper
          typeOfMaterial: row[36], // Column AK - Type Of Material
          redNess: row[37], // Column AL - Red Ness
          noRust: row[38], // Column AM - No Rust
          bundleCountNo: row[39], // Column AN - Bundle Count No.
          pdf: row[40], // Column AO - PDF
          gateInDateTime: row[41], // Column AP - Gate In Date&Time (added this field)
          vehicalNo: row[6],
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
      
      // REMOVED THE AUTO-DOWNLOAD CODE
      // const link = document.createElement("a");
      // link.href = pdfOutput;
      // link.download = `QC_Report_${
      //   currentItem.serialNumber || "Unknown"
      // }_${Date.now()}.pdf`;
      // link.click();

      // toast.success("PDF generated successfully!"); // REMOVED THIS TOO

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

  const uploadPDFToDrive = async (pdfResult) => {
    try {
      // Extract just the base64 data part
      const base64Data = pdfResult.fileUrl.split(",")[1];

      const uploadResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            action: "uploadFile",
            fileName: pdfResult.fileName,
            base64Data: base64Data,
            mimeType: "application/pdf",
            folderId: "1kecfwGffVCpLrZPwqHNUzCcGZlXOaYA5",
          }),
        }
      );

      const result = await uploadResponse.json();

      if (!result.success) {
        console.error("Upload error:", result.error);
        toast.error("Failed to upload PDF to Google Drive");
        return { success: false, error: result.error };
      }

      return result;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
      return { success: false, error: "Failed to upload PDF" };
    }
  };

  function getFormattedDateTime() {
    const now = new Date();

    const pad = (num) => num.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // Months are 0-based
    const year = now.getFullYear();

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const handleSubmitQC = async () => {
    setIsSubmitting(true);
    const currentDateTime = getFormattedDateTime();

    try {
      // Generate PDF
      const pdfResult = await generatePDF();
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || "Failed to generate PDF");
      }

      // Upload PDF to Google Drive
      const uploadResult = await uploadPDFToDrive(pdfResult);
      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Failed to upload PDF to Google Drive"
        );
      }

      // Update the Google Sheet
      const updateResponse = await fetch(
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
              AG: `'${currentDateTime}`, // Column AG - Actual6
              AI: formData.section, // Column AI - Section
              AJ: formData.tagProper, // Column AJ - Tag Proper
              AK: formData.typeOfMaterial, // Column AK - Type Of Material
              AL: formData.redNess, // Column AL - Red Ness
              AM: formData.noRust, // Column AM - No Rust
              AN: formData.bundleCountNo, // Column AN - Bundle Count No.
              AO: uploadResult.fileUrl, // Column AO - PDF URL
            }),
          }),
        }
      );

      const updateResult = await updateResponse.json();
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update Google Sheet");
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

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
   .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-md max-h-screen overflow-y-auto">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">QC Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQC}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">QC</h1>
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

          {/* Column Filter Dropdown */}
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

      {/* Tabs */}
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
              Pending ({filteredPendingData.length})
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
              History ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
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
                        {selectedColumns.includes("vehicleNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle Number
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
                        {selectedColumns.includes("lrNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            LR No.
                          </th>
                        )}
                        {selectedColumns.includes("gateInDateTime") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gate In Date&Time
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
                              QC
                            </button>
                          </td>
                          {selectedColumns.includes("serialNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serialNumber}
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
                          {selectedColumns.includes("vehicleNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicleNumber}
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
                          {selectedColumns.includes("lrNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.lrNumber}
                            </td>
                          )}
                          {selectedColumns.includes("gateInDateTime") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                  {filteredPendingData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No pending QC records found.
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        {selectedColumns.includes("serialNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serial Number
                          </th>
                        )}
                        {selectedColumns.includes("actual6") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            QC Date
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
                        {selectedColumns.includes("vehicleNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle Number
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
                        {selectedColumns.includes("section") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                        )}
                        {selectedColumns.includes("tagProper") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tag Proper
                          </th>
                        )}
                        {selectedColumns.includes("typeOfMaterial") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type Of Material
                          </th>
                        )}
                        {selectedColumns.includes("redNess") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Red Ness
                          </th>
                        )}
                        {selectedColumns.includes("noRust") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No Rust
                          </th>
                        )}
                        {selectedColumns.includes("bundleCountNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bundle Count No.
                          </th>
                        )}
                        {selectedColumns.includes("lrNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            LR No.
                          </th>
                        )}
                        {selectedColumns.includes("gateInDateTime") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gate In Date&Time
                          </th>
                        )}
                        {selectedColumns.includes("pdf") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PDF
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                              Edit
                            </button>
                          </td>
                          {selectedColumns.includes("serialNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serialNumber}
                            </td>
                          )}
                          {selectedColumns.includes("actual6") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.actual6
                                ? new Date(item.actual6).toLocaleString()
                                : "-"}
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
                          {selectedColumns.includes("vehicleNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicleNumber}
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
                          {selectedColumns.includes("section") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.section || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("tagProper") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tagProper || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("typeOfMaterial") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.typeOfMaterial || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("redNess") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.redNess || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("noRust") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.noRust || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("bundleCountNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bundleCountNo || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("lrNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.lrNumber || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("gateInDateTime") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.gateInDateTime || "-"}
                            </td>
                          )}
                          {selectedColumns.includes("pdf") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                  {filteredHistoryData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No historical QC records found.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QC;