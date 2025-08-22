// import React, { useState, useEffect } from "react";
// import { Filter, Search, Clock, CheckCircle, RefreshCw } from "lucide-react";
// import useAuthStore from "../store/authStore";
// import toast from "react-hot-toast";

// const GetLoading1st = () => {
//   const { user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState("pending");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterParty, setFilterParty] = useState("all");
//   const [remarks, setRemarks] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const [pendingData, setPendingData] = useState([]);
//   const [historyData, setHistoryData] = useState([]);
//   const [uniqueParties, setUniqueParties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isSubmittingLoading1st, setIsSubmittingLoading1st] = useState(false);
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Adding timestamp to URL to prevent caching
//       const timestamp = new Date().getTime();
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
//       );
//       const json = await response.json();

//       if (json.success && Array.isArray(json.data)) {
//         const allData = json.data.slice(6).map((row, index) => ({
//           id: index + 1,
//           serialNumber: row[1], // Column A
//           partyName: row[2], // Column C
//           erpDoNo: row[3], // Column D
//           transporterName: row[4], // Column E
//           lrNumber: row[5], // Column F
//           vehicleNumber: row[6], // Column G
//           deliveryTerm: row[7], // Column H
//           brandName: row[8], // Column I
//           dispatchQty: row[9], // Column J
//           planned3: row[18], // Column S - Planned3
//           actual3: row[19], // Column T - Actual3
//           loadingStatus1: row[21], // Column V - Loading Status1
//           remarks: row[17], // Column R - Remarks
//         }));

//         // Filter data based on conditions
//         const pending = allData.filter(
//           (item) => item.planned3 && !item.actual3
//         );
//         const history = allData.filter((item) => item.planned3 && item.actual3);

//         setPendingData(pending);
//         setHistoryData(history);
//         setUniqueParties([...new Set(allData.map((item) => item.partyName))]);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleRemarksChange = (id, value) => {
//     setRemarks((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   const handleOpenModal = (item) => {
//     setCurrentItem(item);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentItem(null);
//   };

//   const handleSubmitLoading1st = async (id) => {
//     setIsSubmittingLoading1st(true);
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       timeZone: "Asia/Kolkata",
//     });

//     try {
//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: new URLSearchParams({
//             sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
//             sheetName: "ORDER-INVOICE",
//             action: "update",
//             rowIndex: (id + 6).toString(),
//             columnData: JSON.stringify({
//               T: currentDateTime, // Actual3
//               V: currentItem.loadingStatus1 || "complete", // Loading Status1
//               W: remarks[id] || "", // Remarks
//             }),
//           }),
//         }
//       );

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || "Failed to update Google Sheet");
//       }

//       toast.success("Loading status updated successfully!");
//       fetchData();
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error updating loading status:", error);
//       toast.error("Failed to update loading status");
//     } finally {
//       setIsSubmittingLoading1st(false);
//     }
//   };

//   const filteredPendingData = pendingData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
//       const matchesParty =
//         filterParty === "all" || item.partyName === filterParty;
//       return matchesSearch && matchesParty;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     })
//     .reverse();

//   const filteredHistoryData = historyData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
//       const matchesParty =
//         filterParty === "all" || item.partyName === filterParty;
//       return matchesSearch && matchesParty;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     })
//     .reverse();

//   return (
//     <div className="space-y-6">
//       {/* Modal */}
//       {isModalOpen && currentItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
//             <div className="bg-indigo-600 p-4 text-white">
//               <h2 className="text-xl font-bold">Loading 1st Details</h2>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Serial No
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.serialNumber}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Party Name
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.partyName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Transporter
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.transporterName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Vehicle Number
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.vehicleNumber}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Brand
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.brandName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Dispatch Qty
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.dispatchQty}
//                   </p>
//                 </div>
//               </div>

//               <div className="pt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={currentItem.loadingStatus1 || ""}
//                   onChange={(e) =>
//                     setCurrentItem({
//                       ...currentItem,
//                       loadingStatus1: e.target.value,
//                     })
//                   }
//                   className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="complete">Complete</option>
//                 </select>
//               </div>
//             </div>

//             <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleSubmitLoading1st(currentItem.id)}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
//                 disabled={isSubmittingLoading1st}
//               >
//                 {isSubmittingLoading1st ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Loading"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Get Loading 1st</h1>
//         <button
//           onClick={fetchData}
//           className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//           disabled={loading}
//         >
//           <RefreshCw
//             size={16}
//             className={`mr-2 ${loading ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* Filter and Search */}
//       <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
//         <div className="flex flex-1 max-w-md">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search by party name or DO number..."
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
//             value={filterParty}
//             onChange={(e) => setFilterParty(e.target.value)}
//           >
//             <option value="all">All Parties</option>
//             {uniqueParties.map((party) => (
//               <option key={party} value={party}>
//                 {party}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "pending"
//                   ? "border-indigo-500 text-indigo-600"
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
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("history")}
//             >
//               <CheckCircle size={16} className="inline mr-2" />
//               History ({filteredHistoryData.length})
//             </button>
//           </nav>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6">
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//               <span className="text-gray-600 ml-3">Loading data...</span>
//             </div>
//           ) : (
//             <>
//               {activeTab === "pending" && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Action
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Serial Number
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Party Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           ERP DO No.
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Transporter Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Vehicle Number
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Brand Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Dispatch Qty
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredPendingData.map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <button
//                               onClick={() => handleOpenModal(item)}
//                               className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
//                             >
//                               Record Loading
//                             </button>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.serialNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.partyName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.erpDoNo}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.transporterName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.vehicleNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.brandName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.dispatchQty}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredPendingData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">
//                         No pending loading 1st records found.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "history" && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Serial Number
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Loading Date
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Party Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           ERP DO No.
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Vehicle Number
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Brand Name
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Dispatch Qty
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredHistoryData.map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.serialNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.actual3
//                               ? new Date(item.actual3).toLocaleString()
//                               : "-"}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.partyName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.erpDoNo}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.vehicleNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.brandName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.dispatchQty}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.loadingStatus1 === "complete" ? (
//                               <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
//                                 Complete
//                               </span>
//                             ) : (
//                               <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
//                                 Pending
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredHistoryData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">
//                         No historical loading 1st records found.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GetLoading1st;




// import React, { useState, useEffect } from "react";
// import { Filter, Search, Clock, CheckCircle, RefreshCw } from "lucide-react";
// import useAuthStore from "../store/authStore";
// import toast from "react-hot-toast";

// const GetLoading1st = () => {
//   const { user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState("pending");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterParty, setFilterParty] = useState("all");
//   const [remarks, setRemarks] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const [pendingData, setPendingData] = useState([]);
//   const [historyData, setHistoryData] = useState([]);
//   const [uniqueParties, setUniqueParties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isSubmittingLoading1st, setIsSubmittingLoading1st] = useState(false);
//   const [visibleColumns, setVisibleColumns] = useState([
//     "serialNumber",
//     "partyName",
//     "erpDoNo",
//     "transporterName",
//     "vehicleNumber",
//     "brandName",
//     "dispatchQty",
//   ]);

//   const columnOptions = [
//     { value: "serialNumber", label: "Serial Number" },
//     { value: "partyName", label: "Party Name" },
//     { value: "erpDoNo", label: "ERP DO No." },
//     { value: "transporterName", label: "Transporter Name" },
//     { value: "vehicleNumber", label: "Vehicle Number" },
//     { value: "brandName", label: "Brand Name" },
//     { value: "dispatchQty", label: "Dispatch Qty" },
//   ];

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Adding timestamp to URL to prevent caching
//       const timestamp = new Date().getTime();
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
//       );
//       const json = await response.json();

//       if (json.success && Array.isArray(json.data)) {
//         const allData = json.data.slice(6).map((row, index) => ({
//           id: index + 1,
//           serialNumber: row[1], // Column A
//           partyName: row[2], // Column C
//           erpDoNo: row[3], // Column D
//           transporterName: row[4], // Column E
//           lrNumber: row[5], // Column F
//           vehicleNumber: row[6], // Column G
//           deliveryTerm: row[7], // Column H
//           brandName: row[8], // Column I
//           dispatchQty: row[9], // Column J
//           planned3: row[18], // Column S - Planned3
//           actual3: row[19], // Column T - Actual3
//           loadingStatus1: row[21], // Column V - Loading Status1
//           remarks: row[17], // Column R - Remarks
//         }));

//         // Filter data based on conditions
//         const pending = allData.filter(
//           (item) => item.planned3 && !item.actual3
//         );
//         const history = allData.filter((item) => item.planned3 && item.actual3);

//         setPendingData(pending);
//         setHistoryData(history);
//         setUniqueParties([...new Set(allData.map((item) => item.partyName))]);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleRemarksChange = (id, value) => {
//     setRemarks((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   const handleOpenModal = (item) => {
//     setCurrentItem(item);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentItem(null);
//   };

//   const handleSubmitLoading1st = async (id) => {
//     setIsSubmittingLoading1st(true);
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       timeZone: "Asia/Kolkata",
//     });

//     try {
//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: new URLSearchParams({
//             sheetId: "13t-k1QO-LaJnvtAo2s4qjO97nh9XOqpM3SvTef9CaaY",
//             sheetName: "ORDER-INVOICE",
//             action: "update",
//             rowIndex: (id + 6).toString(),
//             columnData: JSON.stringify({
//               T: currentDateTime, // Actual3
//               V: currentItem.loadingStatus1 || "complete", // Loading Status1
//               W: remarks[id] || "", // Remarks
//             }),
//           }),
//         }
//       );

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || "Failed to update Google Sheet");
//       }

//       toast.success("Loading status updated successfully!");
//       fetchData();
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error updating loading status:", error);
//       toast.error("Failed to update loading status");
//     } finally {
//       setIsSubmittingLoading1st(false);
//     }
//   };

//   const filteredPendingData = pendingData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
//       const matchesParty =
//         filterParty === "all" || item.partyName === filterParty;
//       return matchesSearch && matchesParty;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     })
//     .reverse();

//   const filteredHistoryData = historyData
//     .filter((item) => {
//       const matchesSearch =
//         item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) 
//       const matchesParty =
//         filterParty === "all" || item.partyName === filterParty;
//       return matchesSearch && matchesParty;
//     })
//     .filter((item) => {
//       if (user?.username.toLowerCase() === "admin") return true;
//       return item?.partyName.toLowerCase() === user?.username.toLowerCase();
//     })
//     .reverse();

//   const handleColumnChange = (e) => {
//     const { value, checked } = e.target;
//     if (checked) {
//       setVisibleColumns((prev) => [...prev, value]);
//     } else {
//       setVisibleColumns((prev) => prev.filter((col) => col !== value));
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Modal */}
//       {isModalOpen && currentItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
//             <div className="bg-indigo-600 p-4 text-white">
//               <h2 className="text-xl font-bold">Loading 1st Details</h2>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Serial No
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.serialNumber}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Party Name
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.partyName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Transporter
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.transporterName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Vehicle Number
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.vehicleNumber}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Brand
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.brandName}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Dispatch Qty
//                   </label>
//                   <p className="mt-1 text-sm font-medium">
//                     {currentItem.dispatchQty}
//                   </p>
//                 </div>
//               </div>

//               <div className="pt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={currentItem.loadingStatus1 || ""}
//                   onChange={(e) =>
//                     setCurrentItem({
//                       ...currentItem,
//                       loadingStatus1: e.target.value,
//                     })
//                   }
//                   className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="complete">Complete</option>
//                 </select>
//               </div>
//             </div>

//             <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleSubmitLoading1st(currentItem.id)}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
//                 disabled={isSubmittingLoading1st}
//               >
//                 {isSubmittingLoading1st ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Loading"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Get Loading 1st</h1>
//         <button
//           onClick={fetchData}
//           className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//           disabled={loading}
//         >
//           <RefreshCw
//             size={16}
//             className={`mr-2 ${loading ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* Filter and Search */}
//       <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
//         <div className="flex flex-1 max-w-md">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search by party name or DO number..."
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
//             value={filterParty}
//             onChange={(e) => setFilterParty(e.target.value)}
//           >
//             <option value="all">All Parties</option>
//             {uniqueParties.map((party) => (
//               <option key={party} value={party}>
//                 {party}
//               </option>
//             ))}
//           </select>

//           <div className="relative group">
//             <button className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
//               Columns
//             </button>
//             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
//               <div className="p-2 space-y-2">
//                 {columnOptions.map((column) => (
//                   <label key={column.value} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
//                     <input
//                       type="checkbox"
//                       value={column.value}
//                       checked={visibleColumns.includes(column.value)}
//                       onChange={handleColumnChange}
//                       className="rounded text-indigo-600 focus:ring-indigo-500"
//                     />
//                     <span className="text-sm text-gray-700">{column.label}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${
//                 activeTab === "pending"
//                   ? "border-indigo-500 text-indigo-600"
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
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               onClick={() => setActiveTab("history")}
//             >
//               <CheckCircle size={16} className="inline mr-2" />
//               History ({filteredHistoryData.length})
//             </button>
//           </nav>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6">
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//               <span className="text-gray-600 ml-3">Loading data...</span>
//             </div>
//           ) : (
//             <>
//               {activeTab === "pending" && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Action
//                         </th>
//                         {visibleColumns.includes("serialNumber") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Serial Number
//                           </th>
//                         )}
//                         {visibleColumns.includes("partyName") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Party Name
//                           </th>
//                         )}
//                         {visibleColumns.includes("erpDoNo") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             ERP DO No.
//                           </th>
//                         )}
//                         {visibleColumns.includes("transporterName") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Transporter Name
//                           </th>
//                         )}
//                         {visibleColumns.includes("vehicleNumber") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Vehicle Number
//                           </th>
//                         )}
//                         {visibleColumns.includes("brandName") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Brand Name
//                           </th>
//                         )}
//                         {visibleColumns.includes("dispatchQty") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Dispatch Qty
//                           </th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredPendingData.map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <button
//                               onClick={() => handleOpenModal(item)}
//                               className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
//                             >
//                               Record Loading
//                             </button>
//                           </td>
//                           {visibleColumns.includes("serialNumber") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.serialNumber}
//                             </td>
//                           )}
//                           {visibleColumns.includes("partyName") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.partyName}
//                             </td>
//                           )}
//                           {visibleColumns.includes("erpDoNo") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.erpDoNo}
//                             </td>
//                           )}
//                           {visibleColumns.includes("transporterName") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.transporterName}
//                             </td>
//                           )}
//                           {visibleColumns.includes("vehicleNumber") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.vehicleNumber}
//                             </td>
//                           )}
//                           {visibleColumns.includes("brandName") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.brandName}
//                             </td>
//                           )}
//                           {visibleColumns.includes("dispatchQty") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.dispatchQty}
//                             </td>
//                           )}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredPendingData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">
//                         No pending loading 1st records found.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "history" && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         {visibleColumns.includes("serialNumber") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Serial Number
//                           </th>
//                         )}
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Loading Date
//                         </th>
//                         {visibleColumns.includes("partyName") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Party Name
//                           </th>
//                         )}
//                         {visibleColumns.includes("erpDoNo") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             ERP DO No.
//                           </th>
//                         )}
//                         {visibleColumns.includes("vehicleNumber") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Vehicle Number
//                           </th>
//                         )}
//                         {visibleColumns.includes("brandName") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Brand Name
//                           </th>
//                         )}
//                         {visibleColumns.includes("dispatchQty") && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Dispatch Qty
//                           </th>
//                         )}
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredHistoryData.map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           {visibleColumns.includes("serialNumber") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.serialNumber}
//                             </td>
//                           )}
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.actual3
//                               ? new Date(item.actual3).toLocaleString()
//                               : "-"}
//                           </td>
//                           {visibleColumns.includes("partyName") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.partyName}
//                             </td>
//                           )}
//                           {visibleColumns.includes("erpDoNo") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.erpDoNo}
//                             </td>
//                           )}
//                           {visibleColumns.includes("vehicleNumber") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.vehicleNumber}
//                             </td>
//                           )}
//                           {visibleColumns.includes("brandName") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.brandName}
//                             </td>
//                           )}
//                           {visibleColumns.includes("dispatchQty") && (
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {item.dispatchQty}
//                             </td>
//                           )}
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.loadingStatus1 === "complete" ? (
//                               <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
//                                 Complete
//                               </span>
//                             ) : (
//                               <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
//                                 Pending
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredHistoryData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">
//                         No historical loading 1st records found.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GetLoading1st;




import React, { useState, useEffect } from "react";
import { Filter, Search, Clock, CheckCircle, RefreshCw } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const GetLoading1st = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [remarks, setRemarks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [uniqueParties, setUniqueParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingLoading1st, setIsSubmittingLoading1st] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "serialNumber",
    "partyName",
    "erpDoNo",
    "transporterName",
    "vehicleNumber",
    "brandName",
    "dispatchQty",
  ]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  const columnOptions = [
    { value: "serialNumber", label: "Serial Number" },
    { value: "partyName", label: "Party Name" },
    { value: "erpDoNo", label: "ERP DO No." },
    { value: "transporterName", label: "Transporter Name" },
    { value: "vehicleNumber", label: "Vehicle Number" },
    { value: "brandName", label: "Brand Name" },
    { value: "dispatchQty", label: "Dispatch Qty" },
  ];

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
          planned3: row[18],
          actual3: row[19],
          loadingStatus1: row[21],
          remarks: row[17],
        }));

        const pending = allData.filter((item) => item.planned3 && !item.actual3);
        const history = allData.filter((item) => item.planned3 && item.actual3);

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

  const handleRemarksChange = (id, value) => {
    setRemarks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmitLoading1st = async (id) => {
    setIsSubmittingLoading1st(true);
    const currentDateTime = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
    });

    try {
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
            action: "update",
            rowIndex: (id + 6).toString(),
            columnData: JSON.stringify({
              T: currentDateTime,
              V: currentItem.loadingStatus1 || "complete",
              W: remarks[id] || "",
            }),
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update Google Sheet");
      }

      toast.success("Loading status updated successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating loading status:", error);
      toast.error("Failed to update loading status");
    } finally {
      setIsSubmittingLoading1st(false);
    }
  };

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .reverse();

  const toggleColumnDropdown = () => {
    setShowColumnDropdown(!showColumnDropdown);
  };

  const handleColumnChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setVisibleColumns((prev) => [...prev, value]);
    } else {
      setVisibleColumns((prev) => prev.filter((col) => col !== value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">Loading 1st Details</h2>
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
                    Transporter
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {currentItem.transporterName}
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

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={currentItem.loadingStatus1 || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      loadingStatus1: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitLoading1st(currentItem.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                disabled={isSubmittingLoading1st}
              >
                {isSubmittingLoading1st ? (
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
                  "Submit Loading"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Get Loading 1st</h1>
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

          <div className="relative">
            <button
              onClick={toggleColumnDropdown}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex items-center"
            >
              Columns
              <svg
                className={`ml-2 h-4 w-4 transition-transform ${
                  showColumnDropdown ? "rotate-180" : ""
                }`}
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  {columnOptions.map((column) => (
                    <label
                      key={column.value}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={column.value}
                        checked={visibleColumns.includes(column.value)}
                        onChange={handleColumnChange}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {column.label}
                      </span>
                    </label>
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
                        {visibleColumns.includes("serialNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serial Number
                          </th>
                        )}
                        {visibleColumns.includes("partyName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party Name
                          </th>
                        )}
                        {visibleColumns.includes("erpDoNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ERP DO No.
                          </th>
                        )}
                        {visibleColumns.includes("transporterName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transporter Name
                          </th>
                        )}
                        {visibleColumns.includes("vehicleNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle Number
                          </th>
                        )}
                        {visibleColumns.includes("brandName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand Name
                          </th>
                        )}
                        {visibleColumns.includes("dispatchQty") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dispatch Qty
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
                              Record Loading
                            </button>
                          </td>
                          {visibleColumns.includes("serialNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serialNumber}
                            </td>
                          )}
                          {visibleColumns.includes("partyName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.partyName}
                            </td>
                          )}
                          {visibleColumns.includes("erpDoNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.erpDoNo}
                            </td>
                          )}
                          {visibleColumns.includes("transporterName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.transporterName}
                            </td>
                          )}
                          {visibleColumns.includes("vehicleNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicleNumber}
                            </td>
                          )}
                          {visibleColumns.includes("brandName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.brandName}
                            </td>
                          )}
                          {visibleColumns.includes("dispatchQty") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.dispatchQty}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPendingData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No pending loading 1st records found.
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
                        {visibleColumns.includes("serialNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serial Number
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loading Date
                        </th>
                        {visibleColumns.includes("partyName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Party Name
                          </th>
                        )}
                        {visibleColumns.includes("erpDoNo") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ERP DO No.
                          </th>
                        )}
                        {visibleColumns.includes("vehicleNumber") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle Number
                          </th>
                        )}
                        {visibleColumns.includes("brandName") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand Name
                          </th>
                        )}
                        {visibleColumns.includes("dispatchQty") && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dispatch Qty
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {visibleColumns.includes("serialNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serialNumber}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.actual3
                              ? new Date(item.actual3).toLocaleString()
                              : "-"}
                          </td>
                          {visibleColumns.includes("partyName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.partyName}
                            </td>
                          )}
                          {visibleColumns.includes("erpDoNo") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.erpDoNo}
                            </td>
                          )}
                          {visibleColumns.includes("vehicleNumber") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.vehicleNumber}
                            </td>
                          )}
                          {visibleColumns.includes("brandName") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.brandName}
                            </td>
                          )}
                          {visibleColumns.includes("dispatchQty") && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.dispatchQty}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.loadingStatus1 === "complete" ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Complete
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistoryData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No historical loading 1st records found.
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

export default GetLoading1st;