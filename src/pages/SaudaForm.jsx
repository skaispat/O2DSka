// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   X,
//   Filter,
//   Search,
//   Clock,
//   CheckCircle,
//   RefreshCw,
// } from "lucide-react";
// import useAuthStore from "../store/authStore";
// import toast from "react-hot-toast";

// const SaudaForm = () => {
//   const { user } = useAuthStore();
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterBrand, setFilterBrand] = useState("all");
//   const [activeTab, setActiveTab] = useState("pending");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [saudaData, setSaudaData] = useState([]);
//   const [brandOptions, setBrandOptions] = useState([]);

//   const [showCancelModal, setShowCancelModal] = useState({
//     show: false,
//     sauda: null,
//   });

//   const [cancelForm, setCancelForm] = useState({
//     saudaNumber: "",
//     quantity: "",
//     remark: "",
//   });

//   // console.log("user",user);

//   const [formData, setFormData] = useState({
//     dateOfSauda: "",
//     partyName: "",
//     rate: "",
//     brandName: "",
//     totalQuantity: "",
//     remark: "",
//     partyWhatsApp: "",
//     contactPersonName: "",
//     pendingQty: "Pending", // Default to Pending
//   });

//   // Fetch brand options from Google Sheets
//   const fetchBrandOptions = async () => {
//     try {
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master`
//       );
//       const result = await response.json();

//       if (result.success && result.data) {
//         const brands = result.data
//           .slice(1) // Skip header row
//           .map((row) => row[0]) // Get first column (Column A)
//           .filter((brand) => brand); // Filter out empty values

//         setBrandOptions(brands);
//       }
//     } catch (error) {
//       console.error("Error fetching brand options:", error);
//       toast.error("Failed to load brand options");
//     }
//   };

//   // Fetch data from Google Sheets
//   const fetchSaudaData = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=sauda`
//       );

//       const result = await response.json();

//       if (result.success && result.data) {
//         // Skip first 6 rows, start from row 7
//         const dataRows = result.data.slice(5).filter((row) => row.length > 0);

//         const transformedData = dataRows.map((row, index) => {
//           const pendingQty = row[12] ? String(row[12]).trim() : "Pending";

//           return {
//             id: index + 1,
//             timestamp: row[0] || "", // Column A
//             saudaNumber: row[1] || "aaaa", // Column B
//             dateOfSauda: row[2] || "", // Column C
//             partyName: row[3] || "", // Column D
//             rate: row[4] || "", // Column E
//             brandName: row[5] || "", // Column F
//             totalQuantity: row[6] || "", // Column G
//             remark: row[7] || "", // Column H
//             partyWhatsApp: row[8] || "", // Column I
//             contactPersonName: row[9] || "", // Column J
//             pendingQty: pendingQty, // Column M
//             completed: row[13] || "", // Boolean flag
//           };
//         });

//         setSaudaData(transformedData);
//       }
//     } catch (error) {
//       console.error("Error fetching sauda data:", error);
//       toast.error("Failed to load sauda data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSaudaData();
//     fetchBrandOptions();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRefresh = async () => {
//     try {
//       setIsLoading(true);
//       await fetchSaudaData();
//       toast.success("Data refreshed successfully");
//     } catch (error) {
//       console.error("Refresh error:", error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   function getFormattedDateTime() {
//     const now = new Date();

//     const pad = (num) => num.toString().padStart(2, "0");

//     const day = pad(now.getDate());
//     const month = pad(now.getMonth() + 1); // Months are 0-based
//     const year = now.getFullYear();

//     const hours = pad(now.getHours());
//     const minutes = pad(now.getMinutes());
//     const seconds = pad(now.getSeconds());

//     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
//   }

//   const postToGoogleSheet = async (data) => {
//     try {
//       const currentDateTime = getFormattedDateTime();
//       // Get last used sauda number
//       const existingSaudaNumbers = saudaData
//         .map((item) => item.saudaNumber)
//         .filter(Boolean)
//         .map((sn) => parseInt(sn?.split("-")[1]))
//         .filter((num) => !isNaN(num));

//       const lastNumber =
//         existingSaudaNumbers.length > 0 ? Math.max(...existingSaudaNumbers) : 0;
//       const saudaNumber = `SN-${String(lastNumber + 1).padStart(3, "0")}`;
//       // Prepare row data according to column structure
//       const rowData = [
//         `'${currentDateTime}`, // A: Timestamp
//         saudaNumber, // B: Sauda Number
//         data.dateOfSauda, // C: Date Of Sauda
//         data.partyName, // D: Broker Name
//         data.rate, // E: Rate
//         data.brandName, // F: Brand Name
//         data.totalQuantity, // G: Total Quantity (Ton)
//         data.remark || "", // H: Remark
//         data.partyWhatsApp, // I: Party WhatsApp Number
//         data.contactPersonName, // J: Contact Person Name
//         "", // K: Empty
//         "", // L: Empty
//       ];

//       const formData = new URLSearchParams();
//       formData.append("sheetName", "Sauda");
//       formData.append("action", "insert");
//       formData.append("rowData", JSON.stringify(rowData));

//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       console.log("response", response);

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || "Failed to save to Google Sheets");
//       }

//       return { success: true, saudaNumber };
//     } catch (error) {
//       console.error("Google Sheets Error:", error);
//       throw new Error("Failed to save to Google Sheets");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const { saudaNumber } = await postToGoogleSheet(formData);

//       toast.success(`Sauda ${saudaNumber} added successfully!`);
//       setFormData({
//         dateOfSauda: "",
//         partyName: "",
//         rate: "",
//         brandName: "",
//         totalQuantity: "",
//         remark: "",
//         partyWhatsApp: "",
//         contactPersonName: "",
//         pendingQty: "Pending",
//       });
//       setShowModal(false);

//       // Refresh data after successful submission
//       fetchSaudaData();
//     } catch (error) {
//       console.error("Submission Error:", error);
//       toast.error(error.message || "Failed to add sauda");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // console.log("saudaData",saudaData);

//   // Filter data based on tab selection
//   const filteredPendingData = saudaData.filter(
//     (item) => item.completed === "Pending"
//   );
//   const filteredHistoryData = saudaData.filter(
//     (item) => item.completed === "Complete"
//   );

//   const currentTabData =
//     activeTab === "pending" ? filteredPendingData : filteredHistoryData;

//   const filteredData = currentTabData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesBrand =
//         filterBrand === "all" || item.brandName === filterBrand;
//       return matchesSearch && matchesBrand;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     }).reverse();
//   // console.log("filteredData", filteredData);

//   const uniqueBrands = [
//     ...new Set(saudaData.map((item) => item.brandName).filter(Boolean)),
//   ];

//   const handleSubmitClose = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const currentDateTime = getFormattedDateTime();
//       const rowData = [
//         `'${currentDateTime}`, // A: Timestamp
//         cancelForm.saudaNumber, // B: Sauda Number
//         cancelForm.quantity, // C: Quantity
//         cancelForm.remark || "", // D: Remark
//       ];

//       const formData = new URLSearchParams();
//       formData.append("sheetName", "Cancle"); // Note: Sheet name is "Cancle"
//       formData.append("action", "insert");
//       formData.append("rowData", JSON.stringify(rowData));

//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(
//           result.error || "Failed to save cancellation to Google Sheets"
//         );
//       }

//       toast.success(
//         `Sauda ${cancelForm.saudaNumber} cancellation submitted successfully!`
//       );
//       setShowCancelModal({ show: false, sauda: null });
//       setCancelForm({ saudaNumber: "", quantity: "", remark: "" });

//       // Refresh data after successful submission
//       fetchSaudaData();
//     } catch (error) {
//       console.error("Cancellation Error:", error);
//       toast.error(error.message || "Failed to submit cancellation");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Sauda Form</h1>
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={handleRefresh}
//             className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             disabled={isLoading}
//           >
//             <RefreshCw
//               size={16}
//               className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </button>
//           <button
//             onClick={() => setShowModal(true)}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//             disabled={isLoading}
//           >
//             <Plus size={16} className="mr-2" />
//             New Sauda
//           </button>
//         </div>
//       </div>

//       {/* Filter and Search */}
//       <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
//         <div className="flex flex-1 max-w-md">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search by party name or brand..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Search
//               size={20}
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//             />
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Filter size={16} className="text-gray-500" />
//           <select
//             className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={filterBrand}
//             onChange={(e) => setFilterBrand(e.target.value)}
//           >
//             <option value="all">All Brands</option>
//             {uniqueBrands.map((brand) => (
//               <option key={brand} value={brand}>
//                 {brand}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "pending"
//                   ? "border-orange-500 text-orange-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("pending")}
//             >
//               <Clock size={16} className="inline mr-2" />
//               Pending (
//               {
//                 filteredPendingData.length
//               }
//               )
//             </button>
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "history"
//                   ? "border-green-500 text-green-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("history")}
//             >
//               <CheckCircle size={16} className="inline mr-2" />
//               Complete (
//               {
//                 filteredHistoryData.length
//               }
//               )
//             </button>
//           </nav>
//         </div>

//         {/* Loading State */}
//         {isLoading && (
//           <div className="flex items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//             <span className="text-gray-600 ml-2">Loading data...</span>
//           </div>
//         )}

//         {/* Table */}
//         {!isLoading && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Sauda No.
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date Of Sauda
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Broker Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Rate
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Brand Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total Quantity (Ton)
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Remark
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Party WhatsApp
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact Person
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredData.map((item) => (
//                   <tr key={item.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.saudaNumber || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.dateOfSauda
//                         ? new Date(item.dateOfSauda).toLocaleDateString()
//                         : "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.partyName || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       ₹{item.rate || "0"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.brandName || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.totalQuantity || "0"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.remark || "-"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.partyWhatsApp || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {item.contactPersonName || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           item.pendingQty === "Complete"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-orange-100 text-orange-800"
//                         }`}
//                       >
//                         {item.pendingQty || "Pending"}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <button
//                         onClick={() => {
//                           setShowCancelModal({ show: true, sauda: item });
//                           setCancelForm({
//                             saudaNumber: item.saudaNumber,
//                             quantity: "",
//                             remark: "",
//                           });
//                         }}
//                         className="px-3 py-2 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
//                       >
//                         Short Close
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Cancel Modal */}
//         {showCancelModal.show && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
//               <div className="flex justify-between items-center p-6 border-b">
//                 <h3 className="text-lg font-medium">Short Close Sauda</h3>
//                 <button
//                   onClick={() => {
//                     setShowCancelModal({ show: false, sauda: null });
//                     setCancelForm({
//                       saudaNumber: "",
//                       quantity: "",
//                       remark: "",
//                     });
//                   }}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <form onSubmit={handleSubmitClose} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Sauda No.
//                   </label>
//                   <input
//                     type="text"
//                     value={showCancelModal.sauda?.saudaNumber || ""}
//                     readOnly
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     value={cancelForm.quantity}
//                     onChange={(e) =>
//                       setCancelForm({ ...cancelForm, quantity: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Remark
//                   </label>
//                   <textarea
//                     value={cancelForm.remark}
//                     onChange={(e) =>
//                       setCancelForm({ ...cancelForm, remark: e.target.value })
//                     }
//                     rows={3}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//                 <div className="flex justify-end space-x-2 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowCancelModal({ show: false, sauda: null });
//                       setCancelForm({
//                         saudaNumber: "",
//                         quantity: "",
//                         remark: "",
//                       });
//                     }}
//                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <svg
//                           className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           ></circle>
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           ></path>
//                         </svg>
//                         Submitting
//                       </>
//                     ) : (
//                       "Submit"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {!isLoading && filteredData.length === 0 && (
//           <div className="px-6 py-12 text-center">
//             <p className="text-gray-500">No sauda records found.</p>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-medium">New Sauda</h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//                 disabled={isSubmitting}
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date Of Sauda *
//                   </label>
//                   <input
//                     type="date"
//                     name="dateOfSauda"
//                     value={formData.dateOfSauda}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Broker Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="partyName"
//                     value={formData.partyName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Rate *
//                   </label>
//                   <input
//                     type="number"
//                     name="rate"
//                     value={formData.rate}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Brand Name *
//                   </label>
//                   <select
//                     name="brandName"
//                     value={formData.brandName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   >
//                     <option value="">Select Brand</option>
//                     {brandOptions.map((brand) => (
//                       <option key={brand} value={brand}>
//                         {brand}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Total Quantity (Ton) *
//                   </label>
//                   <input
//                     type="number"
//                     name="totalQuantity"
//                     value={formData.totalQuantity}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Party WhatsApp Number
//                   </label>
//                   <input
//                     type="tel"
//                     name="partyWhatsApp"
//                     value={formData.partyWhatsApp}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Contact Person Name
//                   </label>
//                   <input
//                     type="text"
//                     name="contactPersonName"
//                     value={formData.contactPersonName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Remark
//                 </label>
//                 <textarea
//                   name="remark"
//                   value={formData.remark}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div className="flex justify-end space-x-2 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg
//                         className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         ></path>
//                       </svg>
//                       Submitting
//                     </>
//                   ) : (
//                     "Submit"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SaudaForm;




// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   X,
//   Filter,
//   Search,
//   Clock,
//   CheckCircle,
//   RefreshCw,
//   Eye,
// } from "lucide-react";
// import useAuthStore from "../store/authStore";
// import toast from "react-hot-toast";

// const SaudaForm = () => {
//   const { user } = useAuthStore();
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterBrand, setFilterBrand] = useState("all");
//   const [activeTab, setActiveTab] = useState("pending");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [saudaData, setSaudaData] = useState([]);
//   const [brandOptions, setBrandOptions] = useState([]);

//   // Column visibility state
//   const [columnVisibility, setColumnVisibility] = useState({
//     pending: {
//       saudaNumber: true,
//       dateOfSauda: true,
//       partyName: true,
//       rate: true,
//       brandName: true,
//       totalQuantity: true,
//       remark: true,
//       partyWhatsApp: true,
//       contactPersonName: true,
//       status: true,
//       action: true,
//     },
//     history: {
//       saudaNumber: true,
//       dateOfSauda: true,
//       partyName: true,
//       rate: true,
//       brandName: true,
//       totalQuantity: true,
//       remark: true,
//       partyWhatsApp: true,
//       contactPersonName: true,
//       status: true,
//       action: true,
//     },
//   });

//   const [showCancelModal, setShowCancelModal] = useState({
//     show: false,
//     sauda: null,
//   });

//   const [cancelForm, setCancelForm] = useState({
//     saudaNumber: "",
//     quantity: "",
//     remark: "",
//   });

//   const [formData, setFormData] = useState({
//     dateOfSauda: "",
//     partyName: "",
//     rate: "",
//     brandName: "",
//     totalQuantity: "",
//     remark: "",
//     partyWhatsApp: "",
//     contactPersonName: "",
//     pendingQty: "Pending",
//   });

//   // Column options for the dropdown
//   const columnOptions = [
//     { id: "saudaNumber", label: "Sauda No." },
//     { id: "dateOfSauda", label: "Date Of Sauda" },
//     { id: "partyName", label: "Broker Name" },
//     { id: "rate", label: "Rate" },
//     { id: "brandName", label: "Brand Name" },
//     { id: "totalQuantity", label: "Total Quantity (Ton)" },
//     { id: "remark", label: "Remark" },
//     { id: "partyWhatsApp", label: "Party WhatsApp" },
//     { id: "contactPersonName", label: "Contact Person" },
//     { id: "status", label: "Status" },
//     { id: "action", label: "Action" },
//   ];

//   const toggleColumnVisibility = (tab, columnId) => {
//     setColumnVisibility((prev) => ({
//       ...prev,
//       [tab]: {
//         ...prev[tab],
//         [columnId]: !prev[tab][columnId],
//       },
//     }));
//   };

//   const fetchBrandOptions = async () => {
//     try {
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master`
//       );
//       const result = await response.json();

//       if (result.success && result.data) {
//         const brands = result.data
//           .slice(1)
//           .map((row) => row[0])
//           .filter((brand) => brand);

//         setBrandOptions(brands);
//       }
//     } catch (error) {
//       console.error("Error fetching brand options:", error);
//       toast.error("Failed to load brand options");
//     }
//   };

//   const fetchSaudaData = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=sauda`
//       );

//       const result = await response.json();

//       if (result.success && result.data) {
//         const dataRows = result.data.slice(5).filter((row) => row.length > 0);

//         const transformedData = dataRows.map((row, index) => {
//           const pendingQty = row[12] ? String(row[12]).trim() : "Pending";

//           return {
//             id: index + 1,
//             timestamp: row[0] || "",
//             saudaNumber: row[1] || "aaaa",
//             dateOfSauda: row[2] || "",
//             partyName: row[3] || "",
//             rate: row[4] || "",
//             brandName: row[5] || "",
//             totalQuantity: row[6] || "",
//             remark: row[7] || "",
//             partyWhatsApp: row[8] || "",
//             contactPersonName: row[9] || "",
//             pendingQty: pendingQty,
//             completed: row[13] || "",
//           };
//         });

//         setSaudaData(transformedData);
//       }
//     } catch (error) {
//       console.error("Error fetching sauda data:", error);
//       toast.error("Failed to load sauda data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSaudaData();
//     fetchBrandOptions();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRefresh = async () => {
//     try {
//       setIsLoading(true);
//       await fetchSaudaData();
//       toast.success("Data refreshed successfully");
//     } catch (error) {
//       console.error("Refresh error:", error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   function getFormattedDateTime() {
//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, "0");
//     const day = pad(now.getDate());
//     const month = pad(now.getMonth() + 1);
//     const year = now.getFullYear();
//     const hours = pad(now.getHours());
//     const minutes = pad(now.getMinutes());
//     const seconds = pad(now.getSeconds());
//     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
//   }

//   const postToGoogleSheet = async (data) => {
//     try {
//       const currentDateTime = getFormattedDateTime();
//       const existingSaudaNumbers = saudaData
//         .map((item) => item.saudaNumber)
//         .filter(Boolean)
//         .map((sn) => parseInt(sn?.split("-")[1]))
//         .filter((num) => !isNaN(num));

//       const lastNumber =
//         existingSaudaNumbers.length > 0 ? Math.max(...existingSaudaNumbers) : 0;
//       const saudaNumber = `SN-${String(lastNumber + 1).padStart(3, "0")}`;
//       const rowData = [
//         `'${currentDateTime}`,
//         saudaNumber,
//         data.dateOfSauda,
//         data.partyName,
//         data.rate,
//         data.brandName,
//         data.totalQuantity,
//         data.remark || "",
//         data.partyWhatsApp,
//         data.contactPersonName,
//         "",
//         "",
//       ];

//       const formData = new URLSearchParams();
//       formData.append("sheetName", "Sauda");
//       formData.append("action", "insert");
//       formData.append("rowData", JSON.stringify(rowData));

//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || "Failed to save to Google Sheets");
//       }

//       return { success: true, saudaNumber };
//     } catch (error) {
//       console.error("Google Sheets Error:", error);
//       throw new Error("Failed to save to Google Sheets");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const { saudaNumber } = await postToGoogleSheet(formData);

//       toast.success(`Sauda ${saudaNumber} added successfully!`);
//       setFormData({
//         dateOfSauda: "",
//         partyName: "",
//         rate: "",
//         brandName: "",
//         totalQuantity: "",
//         remark: "",
//         partyWhatsApp: "",
//         contactPersonName: "",
//         pendingQty: "Pending",
//       });
//       setShowModal(false);
//       fetchSaudaData();
//     } catch (error) {
//       console.error("Submission Error:", error);
//       toast.error(error.message || "Failed to add sauda");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const filteredPendingData = saudaData.filter(
//     (item) => item.completed === "Pending"
//   );
//   const filteredHistoryData = saudaData.filter(
//     (item) => item.completed === "Complete"
//   );

//   const currentTabData =
//     activeTab === "pending" ? filteredPendingData : filteredHistoryData;

//   const filteredData = currentTabData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesBrand =
//         filterBrand === "all" || item.brandName === filterBrand;
//       return matchesSearch && matchesBrand;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     })
//     .reverse();

//   const uniqueBrands = [
//     ...new Set(saudaData.map((item) => item.brandName).filter(Boolean)),
//   ];

//   const handleSubmitClose = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const currentDateTime = getFormattedDateTime();
//       const rowData = [
//         `'${currentDateTime}`,
//         cancelForm.saudaNumber,
//         cancelForm.quantity,
//         cancelForm.remark || "",
//       ];

//       const formData = new URLSearchParams();
//       formData.append("sheetName", "Cancle");
//       formData.append("action", "insert");
//       formData.append("rowData", JSON.stringify(rowData));

//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(
//           result.error || "Failed to save cancellation to Google Sheets"
//         );
//       }

//       toast.success(
//         `Sauda ${cancelForm.saudaNumber} cancellation submitted successfully!`
//       );
//       setShowCancelModal({ show: false, sauda: null });
//       setCancelForm({ saudaNumber: "", quantity: "", remark: "" });
//       fetchSaudaData();
//     } catch (error) {
//       console.error("Cancellation Error:", error);
//       toast.error(error.message || "Failed to submit cancellation");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Sauda Form</h1>
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={handleRefresh}
//             className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             disabled={isLoading}
//           >
//             <RefreshCw
//               size={16}
//               className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </button>
//           <button
//             onClick={() => setShowModal(true)}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//             disabled={isLoading}
//           >
//             <Plus size={16} className="mr-2" />
//             New Sauda
//           </button>
//         </div>
//       </div>

//       {/* Filter and Search */}
//       <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
//         <div className="flex flex-1 max-w-md">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search by party name or brand..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Search
//               size={20}
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//             />
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           {/* Column visibility dropdown */}
//           <div className="relative group">
//             <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//               <Eye size={16} className="mr-2" />
//               Columns
//             </button>
//             <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden group-hover:block">
//               <div className="py-1">
//                 {columnOptions.map((column) => (
//                   <div key={column.id} className="px-4 py-2">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={columnVisibility[activeTab][column.id]}
//                         onChange={() => toggleColumnVisibility(activeTab, column.id)}
//                         className="rounded text-indigo-600 focus:ring-indigo-500"
//                       />
//                       <span>{column.label}</span>
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <Filter size={16} className="text-gray-500" />
//           <select
//             className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={filterBrand}
//             onChange={(e) => setFilterBrand(e.target.value)}
//           >
//             <option value="all">All Brands</option>
//             {uniqueBrands.map((brand) => (
//               <option key={brand} value={brand}>
//                 {brand}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "pending"
//                   ? "border-orange-500 text-orange-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("pending")}
//             >
//               <Clock size={16} className="inline mr-2" />
//               Pending ({filteredPendingData.length})
//             </button>
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "history"
//                   ? "border-green-500 text-green-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("history")}
//             >
//               <CheckCircle size={16} className="inline mr-2" />
//               Complete ({filteredHistoryData.length})
//             </button>
//           </nav>
//         </div>

//         {isLoading && (
//           <div className="flex items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//             <span className="text-gray-600 ml-2">Loading data...</span>
//           </div>
//         )}

//         {!isLoading && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {columnVisibility[activeTab].saudaNumber && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Sauda No.
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].dateOfSauda && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date Of Sauda
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].partyName && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Broker Name
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].rate && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Rate
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].brandName && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Brand Name
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].totalQuantity && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Total Quantity (Ton)
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].remark && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Remark
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].partyWhatsApp && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Party WhatsApp
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].contactPersonName && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Contact Person
//                     </th>
//                   )}
//                   {columnVisibility[activeTab].status && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                   )}
//                   {activeTab === "pending" && columnVisibility[activeTab].action && (
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredData.map((item) => (
//                   <tr key={item.id} className="hover:bg-gray-50">
//                     {columnVisibility[activeTab].saudaNumber && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.saudaNumber || "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].dateOfSauda && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.dateOfSauda
//                           ? new Date(item.dateOfSauda).toLocaleDateString()
//                           : "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].partyName && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.partyName || "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].rate && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         ₹{item.rate || "0"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].brandName && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.brandName || "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].totalQuantity && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.totalQuantity || "0"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].remark && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.remark || "-"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].partyWhatsApp && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.partyWhatsApp || "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].contactPersonName && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {item.contactPersonName || "N/A"}
//                       </td>
//                     )}
//                     {columnVisibility[activeTab].status && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             item.pendingQty === "Complete"
//                               ? "bg-green-100 text-green-800"
//                               : "bg-orange-100 text-orange-800"
//                           }`}
//                         >
//                           {item.pendingQty || "Pending"}
//                         </span>
//                       </td>
//                     )}
//                     {activeTab === "pending" && columnVisibility[activeTab].action && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <button
//                           onClick={() => {
//                             setShowCancelModal({ show: true, sauda: item });
//                             setCancelForm({
//                               saudaNumber: item.saudaNumber,
//                               quantity: "",
//                               remark: "",
//                             });
//                           }}
//                           className="px-3 py-2 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
//                         >
//                           Short Close
//                         </button>
//                       </td>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {showCancelModal.show && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
//               <div className="flex justify-between items-center p-6 border-b">
//                 <h3 className="text-lg font-medium">Short Close Sauda</h3>
//                 <button
//                   onClick={() => {
//                     setShowCancelModal({ show: false, sauda: null });
//                     setCancelForm({
//                       saudaNumber: "",
//                       quantity: "",
//                       remark: "",
//                     });
//                   }}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <form onSubmit={handleSubmitClose} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Sauda No.
//                   </label>
//                   <input
//                     type="text"
//                     value={showCancelModal.sauda?.saudaNumber || ""}
//                     readOnly
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     value={cancelForm.quantity}
//                     onChange={(e) =>
//                       setCancelForm({ ...cancelForm, quantity: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Remark
//                   </label>
//                   <textarea
//                     value={cancelForm.remark}
//                     onChange={(e) =>
//                       setCancelForm({ ...cancelForm, remark: e.target.value })
//                     }
//                     rows={3}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//                 <div className="flex justify-end space-x-2 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowCancelModal({ show: false, sauda: null });
//                       setCancelForm({
//                         saudaNumber: "",
//                         quantity: "",
//                         remark: "",
//                       });
//                     }}
//                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <svg
//                           className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           ></circle>
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           ></path>
//                         </svg>
//                         Submitting
//                       </>
//                     ) : (
//                       "Submit"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {!isLoading && filteredData.length === 0 && (
//           <div className="px-6 py-12 text-center">
//             <p className="text-gray-500">No sauda records found.</p>
//           </div>
//         )}
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-medium">New Sauda</h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//                 disabled={isSubmitting}
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date Of Sauda *
//                   </label>
//                   <input
//                     type="date"
//                     name="dateOfSauda"
//                     value={formData.dateOfSauda}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Broker Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="partyName"
//                     value={formData.partyName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Rate *
//                   </label>
//                   <input
//                     type="number"
//                     name="rate"
//                     value={formData.rate}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Brand Name *
//                   </label>
//                   <select
//                     name="brandName"
//                     value={formData.brandName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   >
//                     <option value="">Select Brand</option>
//                     {brandOptions.map((brand) => (
//                       <option key={brand} value={brand}>
//                         {brand}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Total Quantity (Ton) *
//                   </label>
//                   <input
//                     type="number"
//                     name="totalQuantity"
//                     value={formData.totalQuantity}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Party WhatsApp Number
//                   </label>
//                   <input
//                     type="tel"
//                     name="partyWhatsApp"
//                     value={formData.partyWhatsApp}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Contact Person Name
//                   </label>
//                   <input
//                     type="text"
//                     name="contactPersonName"
//                     value={formData.contactPersonName}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Remark
//                 </label>
//                 <textarea
//                   name="remark"
//                   value={formData.remark}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div className="flex justify-end space-x-2 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg
//                         className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         ></path>
//                       </svg>
//                       Submitting
//                     </>
//                   ) : (
//                     "Submit"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SaudaForm;






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

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    pending: {
      saudaNumber: true,
      dateOfSauda: true,
      partyName: true,
      rate: true,
      brandName: true,
      totalQuantity: true,
      remark: true,
      partyWhatsApp: true,
      contactPersonName: true,
      status: true,
      action: true,
    },
    history: {
      saudaNumber: true,
      dateOfSauda: true,
      partyName: true,
      rate: true,
      brandName: true,
      totalQuantity: true,
      remark: true,
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
    remark: "",
  });

  const [formData, setFormData] = useState({
    dateOfSauda: "",
    partyName: "",
    rate: "",
    brandName: "",
    totalQuantity: "",
    remark: "",
    partyWhatsApp: "",
    contactPersonName: "",
    pendingQty: "Pending",
  });

  // Column options for the dropdown
  const columnOptions = [
    { id: "saudaNumber", label: "Sauda No." },
    { id: "dateOfSauda", label: "Date Of Sauda" },
    { id: "partyName", label: "Broker Name" },
    { id: "rate", label: "Rate" },
    { id: "brandName", label: "Brand Name" },
    { id: "totalQuantity", label: "Total Quantity (Ton)" },
    { id: "remark", label: "Remark" },
    { id: "partyWhatsApp", label: "Party WhatsApp" },
    { id: "contactPersonName", label: "Contact Person" },
    { id: "status", label: "Status" },
    { id: "action", label: "Action" },
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

  const toggleColumnVisibility = (tab, columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [columnId]: !prev[tab][columnId],
      },
    }));
  };

   const fetchBrandOptions = async () => {
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=Main Master`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const brands = result.data
          .slice(1)
          .map((row) => row[0])
          .filter((brand) => brand);

        setBrandOptions(brands);
      }
    } catch (error) {
      console.error("Error fetching brand options:", error);
      toast.error("Failed to load brand options");
    }
  };

  const fetchSaudaData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=sauda`
      );

      const result = await response.json();

      if (result.success && result.data) {
        const dataRows = result.data.slice(5).filter((row) => row.length > 0);

        const transformedData = dataRows.map((row, index) => {
          const pendingQty = row[12] ? String(row[12]).trim() : "Pending";

          return {
            id: index + 1,
            timestamp: row[0] || "",
            saudaNumber: row[1] || "aaaa",
            dateOfSauda: row[2] || "",
            partyName: row[3] || "",
            rate: row[4] || "",
            brandName: row[5] || "",
            totalQuantity: row[6] || "",
            remark: row[7] || "",
            partyWhatsApp: row[8] || "",
            contactPersonName: row[9] || "",
            pendingQty: pendingQty,
            completed: row[13] || "",
          };
        });

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
      const currentDateTime = getFormattedDateTime();
      const existingSaudaNumbers = saudaData
        .map((item) => item.saudaNumber)
        .filter(Boolean)
        .map((sn) => parseInt(sn?.split("-")[1]))
        .filter((num) => !isNaN(num));

      const lastNumber =
        existingSaudaNumbers.length > 0 ? Math.max(...existingSaudaNumbers) : 0;
      const saudaNumber = `SN-${String(lastNumber + 1).padStart(3, "0")}`;
      const rowData = [
        `'${currentDateTime}`,
        saudaNumber,
        data.dateOfSauda,
        data.partyName,
        data.rate,
        data.brandName,
        data.totalQuantity,
        data.remark || "",
        data.partyWhatsApp,
        data.contactPersonName,
        "",
        "",
      ];

      const formData = new URLSearchParams();
      formData.append("sheetName", "Sauda");
      formData.append("action", "insert");
      formData.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save to Google Sheets");
      }

      return { success: true, saudaNumber };
    } catch (error) {
      console.error("Google Sheets Error:", error);
      throw new Error("Failed to save to Google Sheets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { saudaNumber } = await postToGoogleSheet(formData);

      toast.success(`Sauda ${saudaNumber} added successfully!`);
      setFormData({
        dateOfSauda: "",
        partyName: "",
        rate: "",
        brandName: "",
        totalQuantity: "",
        remark: "",
        partyWhatsApp: "",
        contactPersonName: "",
        pendingQty: "Pending",
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
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand =
        filterBrand === "all" || item.brandName === filterBrand;
      return matchesSearch && matchesBrand;
    })
    .reverse();

  const uniqueBrands = [
    ...new Set(saudaData.map((item) => item.brandName).filter(Boolean)),
  ];

  const handleSubmitClose = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentDateTime = getFormattedDateTime();
      const rowData = [
        `'${currentDateTime}`,
        cancelForm.saudaNumber,
        cancelForm.quantity,
        cancelForm.remark || "",
      ];

      const formData = new URLSearchParams();
      formData.append("sheetName", "Cancle");
      formData.append("action", "insert");
      formData.append("rowData", JSON.stringify(rowData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
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
      setCancelForm({ saudaNumber: "", quantity: "", remark: "" });
      fetchSaudaData();
    } catch (error) {
      console.error("Cancellation Error:", error);
      toast.error(error.message || "Failed to submit cancellation");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sauda Form</h1>
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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Plus size={16} className="mr-2" />
            New Sauda
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by party name or brand..."
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
            <option value="all">All Brands</option>
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
                          onChange={() => toggleColumnVisibility(activeTab, column.id)}
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
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-orange-500 text-orange-600"
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
                  {columnVisibility[activeTab].partyName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker Name
                    </th>
                  )}
                  {columnVisibility[activeTab].rate && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                  )}
                  {columnVisibility[activeTab].brandName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand Name
                    </th>
                  )}
                  {columnVisibility[activeTab].totalQuantity && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Quantity (Ton)
                    </th>
                  )}
                  {columnVisibility[activeTab].remark && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remark
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
                  {activeTab === "pending" && columnVisibility[activeTab].action && (
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
                        {item.saudaNumber || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].dateOfSauda && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.dateOfSauda
                          ? new Date(item.dateOfSauda).toLocaleDateString()
                          : "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].partyName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.partyName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].rate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.rate || "0"}
                      </td>
                    )}
                    {columnVisibility[activeTab].brandName && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.brandName || "N/A"}
                      </td>
                    )}
                    {columnVisibility[activeTab].totalQuantity && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalQuantity || "0"}
                      </td>
                    )}
                    {columnVisibility[activeTab].remark && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.remark || "-"}
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.pendingQty === "Complete"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {item.pendingQty || "Pending"}
                        </span>
                      </td>
                    )}
                    {activeTab === "pending" && columnVisibility[activeTab].action && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setShowCancelModal({ show: true, sauda: item });
                            setCancelForm({
                              saudaNumber: item.saudaNumber,
                              quantity: "",
                              remark: "",
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

        {/* Rest of your existing code (Cancel Modal, etc.) */}
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
                      remark: "",
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
                    Remark
                  </label>
                  <textarea
                    value={cancelForm.remark}
                    onChange={(e) =>
                      setCancelForm({ ...cancelForm, remark: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        remark: "",
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

      {/* Modal */}
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
                    Date Of Sauda *
                  </label>
                  <input
                    type="date"
                    name="dateOfSauda"
                    value={formData.dateOfSauda}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broker Name *
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate *
                  </label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={isSubmitting}
                  />
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
                    disabled={isSubmitting}
                  >
                    <option value="">Select Brand</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity (Ton) *
                  </label>
                  <input
                    type="number"
                    name="totalQuantity"
                    value={formData.totalQuantity}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
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