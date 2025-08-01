// import React, { useState, useEffect } from 'react';
// import { Filter, Search, Clock, CheckCircle, Upload , RefreshCw} from 'lucide-react';
// import useAuthStore from '../store/authStore';
// import toast from 'react-hot-toast';

// const FinalWeight = () => {
//   const { user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState('pending');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterParty, setFilterParty] = useState('all');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const [pendingData, setPendingData] = useState([]);
//   const [historyData, setHistoryData] = useState([]);
//   const [uniqueParties, setUniqueParties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [weighmentCopy, setWeighmentCopy] = useState(null);
//   const [partyName, setPartyName] = useState('');
//   const [finalWeight, setFinalWeight] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const getDriveViewerUrl = (url) => {
//   try {
//     // If it's already a direct link, return as-is
//     if (url.includes('uc?id=') || url.includes('uc?export=')) {
//       return url;
//     }

//     // Extract file ID from various Google Drive URL formats
//     let fileId = '';

//     // Standard share link format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//     const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
//     if (fileIdMatch) {
//       fileId = fileIdMatch[1];
//     }
//     // Open URL format: https://drive.google.com/open?id=FILE_ID
//     else {
//       const urlObj = new URL(url);
//       fileId = urlObj.searchParams.get('id');
//     }

//     if (!fileId) return url; // Fallback to original URL if we can't extract ID

//     // Return proper viewer URL
//     return `https://drive.google.com/file/d/${fileId}/preview`;
//   } catch (e) {
//     console.error('Error parsing Drive URL:', e);
//     return url; // Fallback to original URL if parsing fails
//   }
// };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Adding timestamp to URL to prevent caching
//       const timestamp = new Date().getTime();
//       const response = await fetch(
//         `https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
//       );
//       const json = await response.json();

//       if (json.success && Array.isArray(json.data)) {
//         const allData = json.data.slice(6).map((row, index) => ({
//           id: index + 1,
//           serialNumber: row[1],    // Column A
//           partyName: row[2],       // Column C
//           erpDoNo: row[3],         // Column D
//           transporterName: row[4], // Column E
//           lrNumber: row[5],        // Column F
//           vehicleNumber: row[6],   // Column G
//           deliveryTerm: row[7],    // Column H
//           brandName: row[8],       // Column I
//           dispatchQty: row[9],     // Column J
//           planned5: row[26],       // Column AA - Planned5
//           actual5: row[27],        // Column AB - Actual5
//           finalWeight: row[28],    // Column AC - Final Weight
//           weighmentCopy: row[29],  // Column AD - Weighment Copy
//           remarks: row[17]         // Column R - Remarks
//         }));

//         // Filter data based on conditions
//         const pending = allData.filter(item =>
//           item.planned5 && !item.actual5
//         );
//         const history = allData.filter(item =>
//           item.planned5 && item.actual5
//         );

//         setPendingData(pending);
//         setHistoryData(history);
//         setUniqueParties([...new Set(allData.map(item => item.partyName))]);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleOpenModal = (item) => {
//     setCurrentItem(item);
//     setPartyName(item.partyName);
//     setFinalWeight(item.finalWeight || '');
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentItem(null);
//     setWeighmentCopy(null);
//     setPartyName('');
//     setFinalWeight('');
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
//       setWeighmentCopy(file);
//     } else {
//       toast.error('Please upload an image or PDF file');
//     }
//   };

//   const handleSubmitFinalWeight = async () => {
//     if (!finalWeight) {
//       toast.error('Please enter final weight');
//       return;
//     }

//     if (activeTab === 'pending' && !weighmentCopy) {
//       toast.error('Please upload weighment copy');
//       return;
//     }

//     setIsSubmitting(true);
//     const currentDateTime = new Date().toLocaleString('en-GB', {
//       timeZone: 'Asia/Kolkata',
//     });

//     try {
//       let weighmentCopyUrl = currentItem.weighmentCopy || '';

//       // For pending items, upload the file first
//       // Replace the file upload section in your handleSubmitFinalWeight function
// // Find this part around line 90-110 and replace it with:

// if (activeTab === 'pending' && weighmentCopy) {
//   const reader = new FileReader();
//   reader.readAsDataURL(weighmentCopy);

//   const uploadResult = await new Promise((resolve, reject) => {
//     reader.onload = async () => {
//       try {
//         const base64File = reader.result.split(',')[1];
//         const uploadResponse = await fetch(
//           'https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec',
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams({
//               action: 'uploadFile',
//               fileName: weighmentCopy.name,
//               base64Data: base64File,  // Changed from fileData to base64Data
//               mimeType: weighmentCopy.type,  // Added missing mimeType parameter
//               folderId: '1H4H9qAaXYavUE1d3PJ9vIRfDZT85A-4U'
//             })
//           }
//         );
//         const result = await uploadResponse.json();
//         resolve(result);
//       } catch (error) {
//         reject(error);
//       }
//     };
//     reader.onerror = () => {
//       reject(new Error('Failed to read file'));
//     };
//   });

//   if (!uploadResult.success) {
//     throw new Error(uploadResult.error || 'Failed to upload file to Google Drive');
//   }
//   weighmentCopyUrl = uploadResult.fileUrl;
// }

//       // Update the Google Sheet
//       const updateResponse = await fetch(
//         'https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//           body: new URLSearchParams({
//             sheetId: '1blHC_0TZh9AuZMptHHB-mPfOi8TqGAvLIgxKhlQHva8',
//             sheetName: 'ORDER-INVOICE',
//             action: 'update',
//             rowIndex: currentItem.id + 6,
//             columnData: JSON.stringify({
//               'C': partyName,          // Column C - Party Name
//               'AB': activeTab === 'pending' ? currentDateTime : currentItem.actual5, // Column AB - Actual5
//               'AC':'',
//               'AD': finalWeight,       // Column AC - Final Weight
//               'AE': weighmentCopyUrl    // Column AD - Weighment Copy URL
//             })
//           })
//         }
//       );

//       const updateResult = await updateResponse.json();
//       if (!updateResult.success) {
//         throw new Error(updateResult.error || 'Failed to update Google Sheet');
//       }

//       toast.success('Final weight updated successfully!');
//       fetchData();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error updating final weight:', error);
//       toast.error('Failed to update final weight');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const filteredPendingData = pendingData.filter(item => {
//     const matchesSearch = item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesParty = filterParty === 'all' || item.partyName === filterParty;
//     return matchesSearch && matchesParty;
//   });

//   const filteredHistoryData = historyData.filter(item => {
//     const matchesSearch = item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesParty = filterParty === 'all' || item.partyName === filterParty;
//     return matchesSearch && matchesParty;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Modal */}
//       {isModalOpen && currentItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
//             <div className="bg-indigo-600 p-4 text-white">
//               <h2 className="text-xl font-bold">
//                 {activeTab === 'pending' ? 'Final Weight Details' : 'Edit Final Weight'}
//               </h2>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</label>
//                   <p className="mt-1 text-sm font-medium">{currentItem.serialNumber}</p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name *</label>
//                   <input
//                     type="text"
//                     value={partyName}
//                     onChange={(e) => setPartyName(e.target.value)}
//                     className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
//                   />
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Transporter</label>
//                   <p className="mt-1 text-sm font-medium">{currentItem.transporterName}</p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</label>
//                   <p className="mt-1 text-sm font-medium">{currentItem.vehicleNumber}</p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</label>
//                   <p className="mt-1 text-sm font-medium">{currentItem.brandName}</p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch Qty</label>
//                   <p className="mt-1 text-sm font-medium">{currentItem.dispatchQty}</p>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-3 rounded-lg">
//                 <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Final Weight *</label>
//                 <input
//                   type="number"
//                   value={finalWeight}
//                   onChange={(e) => setFinalWeight(e.target.value)}
//                   className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
//                   placeholder="Enter final weight"
//                 />
//               </div>

//               {activeTab === 'pending' && (
//                 <div className="pt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Weighment Copy *</label>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="file"
//                       id="weighment-upload"
//                       accept="image/*,.pdf"
//                       onChange={handleFileChange}
//                       className="hidden"
//                     />
//                     <label
//                       htmlFor="weighment-upload"
//                       className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
//                     >
//                       <Upload size={16} className="mr-2" />
//                       Upload File (Image/PDF)
//                     </label>
//                     {weighmentCopy && (
//                       <span className="text-sm text-gray-600">{weighmentCopy.name}</span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitFinalWeight}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     {activeTab === 'pending' ? 'Submitting...' : 'Updating...'}
//                   </>
//                 ) : (
//                   activeTab === 'pending' ? 'Submit Final Weight' : 'Update'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Final Weight</h1>
//         <button
//                   onClick={fetchData}
//                   className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//                   disabled={loading}
//                 >
//                   <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
//                   Refresh
//                 </button>
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
//             <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
//             {uniqueParties.map(party => (
//               <option key={party} value={party}>{party}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'pending'
//                 ? 'border-indigo-500 text-indigo-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               onClick={() => setActiveTab('pending')}
//             >
//               <Clock size={16} className="inline mr-2" />
//               Pending ({filteredPendingData.length})
//             </button>
//             <button
//               className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'history'
//                 ? 'border-indigo-500 text-indigo-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               onClick={() => setActiveTab('history')}
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
//               {activeTab === 'pending' && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP DO No.</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporter Name</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch Qty</th>
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
//                               Final Weight
//                             </button>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNumber}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.partyName}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.erpDoNo}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transporterName}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicleNumber}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brandName}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dispatchQty}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredPendingData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">No pending final weight records found.</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'history' && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weighment Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP DO No.</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch Qty</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Weight</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weighment Copy</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredHistoryData.map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <button
//                               onClick={() => handleOpenModal(item)}
//                               className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
//                             >
//                               Edit
//                             </button>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNumber}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {item.actual5 ? new Date(item.actual5).toLocaleString() : '-'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.partyName}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.erpDoNo}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicleNumber}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.brandName}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dispatchQty}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.finalWeight || '-'}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//   {item.weighmentCopy ? (
//     <a
//       href={getDriveViewerUrl(item.weighmentCopy)}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="text-indigo-600 hover:text-indigo-800"
//       onClick={(e) => {
//         if (!item.weighmentCopy) {
//           e.preventDefault();
//           toast.error("No weighment copy available");
//         }
//       }}
//     >
//       View
//     </a>
//   ) : "-"}
// </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {filteredHistoryData.length === 0 && !loading && (
//                     <div className="px-6 py-12 text-center">
//                       <p className="text-gray-500">No historical final weight records found.</p>
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

// export default FinalWeight;

import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Clock,
  CheckCircle,
  Upload,
  RefreshCw,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const FinalWeight = () => {
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
  const [weighmentCopy, setWeighmentCopy] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fixed function to get proper Google Drive viewer URL
  const getDriveViewerUrl = (url) => {
    try {
      if (!url || url.trim() === "") {
        console.warn("Empty or null URL provided");
        return null;
      }

      console.log("Original URL:", url);

      // If it's already a proper drive viewer link, return as-is
      if (
        url.includes("drive.google.com/file/d/") &&
        (url.includes("/view") || url.includes("/preview"))
      ) {
        console.log("Already proper drive URL:", url);
        return url;
      }

      // Extract file ID from various Google Drive URL formats
      let fileId = "";

      // Standard share link format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        fileId = fileIdMatch[1];
        console.log("Extracted file ID from standard format:", fileId);
      }
      // Open URL format: https://drive.google.com/open?id=FILE_ID
      else if (url.includes("open?id=")) {
        try {
          const urlObj = new URL(url);
          fileId = urlObj.searchParams.get("id");
          console.log("Extracted file ID from open format:", fileId);
        } catch (urlError) {
          console.error("Error parsing open URL:", urlError);
        }
      }
      // Direct ID format (just the ID)
      else if (url.match(/^[a-zA-Z0-9_-]{25,}$/)) {
        fileId = url;
        console.log("URL appears to be direct file ID:", fileId);
      }

      if (!fileId) {
        console.warn("Could not extract file ID from URL:", url);
        // Try to use the original URL as fallback
        return url;
      }

      // Return proper viewer URL that opens in new tab
      const viewerUrl = `https://drive.google.com/file/d/${fileId}/view`;
      console.log("Generated viewer URL:", viewerUrl);
      return viewerUrl;
    } catch (e) {
      console.error("Error parsing Drive URL:", e);
      return url; // Fallback to original URL if parsing fails
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Adding timestamp to URL to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec?sheet=ORDER-INVOICE&timestamp=${timestamp}`
      );
      const json = await response.json();
      console.log("Fetched data:", json);
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
          planned5: row[26], // Column AA - Planned5
          actual5: row[27], // Column AB - Actual5
          finalWeight: row[29], // Column AC - Final Weight
          weighmentCopy: row[30], // Column AD - Weighment Copy
          remarks: row[17], // Column R - Remarks
        }));

        // Filter data based on conditions
        const pending = allData.filter(
          (item) => item.planned5 && !item.actual5
        );
        const history = allData.filter((item) => item.planned5 && item.actual5);

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
    setPartyName(item.partyName);
    setFinalWeight(item.finalWeight || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setWeighmentCopy(null);
    setPartyName("");
    setFinalWeight("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setWeighmentCopy(file);
    } else {
      toast.error("Please upload an image or PDF file");
    }
  };

  const handleSubmitFinalWeight = async () => {
    if (!finalWeight) {
      toast.error("Please enter final weight");
      return;
    }

    if (activeTab === "pending" && !weighmentCopy) {
      toast.error("Please upload weighment copy");
      return;
    }

    setIsSubmitting(true);
    const currentDateTime = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
    });

    try {
      let weighmentCopyUrl = currentItem.weighmentCopy || "";

      // For pending items, upload the file first
      if (activeTab === "pending" && weighmentCopy) {
        const reader = new FileReader();
        reader.readAsDataURL(weighmentCopy);

        const uploadResult = await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64File = reader.result.split(",")[1];
              const uploadResponse = await fetch(
                "https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    action: "uploadFile",
                    fileName: weighmentCopy.name,
                    base64Data: base64File,
                    mimeType: weighmentCopy.type,
                    folderId: "1H4H9qAaXYavUE1d3PJ9vIRfDZT85A-4U",
                  }),
                }
              );
              const result = await uploadResponse.json();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
        });

        if (!uploadResult.success) {
          throw new Error(
            uploadResult.error || "Failed to upload file to Google Drive"
          );
        }
        weighmentCopyUrl = uploadResult.fileUrl;
      }

      // Update the Google Sheet
      const updateResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            sheetId: "1wbIPdsHBxTE7fnzgOiAxS4koFwNxzwdpgp59NRWsnoc",
            sheetName: "ORDER-INVOICE",
            action: "update",
            rowIndex: currentItem.id + 6,
            columnData: JSON.stringify({
              C: partyName, // Column C - Party Name
              AB:
                activeTab === "pending" ? currentDateTime : currentItem.actual5, // Column AB - Actual5
              AD: finalWeight, // Column AC - Final Weight
              AE: weighmentCopyUrl, // Column AD - Weighment Copy URL
            }),
          }),
        }
      );

      const updateResult = await updateResponse.json();
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update Google Sheet");
      }

      toast.success("Final weight updated successfully!");
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating final weight:", error);
      toast.error("Failed to update final weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle PDF viewing with better error handling
  const handleViewPDF = (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if url exists and is a string
    if (!url || typeof url !== "string") {
      toast.error("No valid weighment copy available");
      return;
    }

    try {
      const viewerUrl = getDriveViewerUrl(url.trim()); // Now safe to call trim()
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

  const filteredPendingData = pendingData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .filter((item) => {
      if (user?.username.toLowerCase() === "admin") return true;
      return item?.partyName.toLowerCase() === user?.username.toLowerCase();
    });

  const filteredHistoryData = historyData
    .filter((item) => {
      const matchesSearch =
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty =
        filterParty === "all" || item.partyName === filterParty;
      return matchesSearch && matchesParty;
    })
    .filter((item) => {
      if (user?.username.toLowerCase() === "admin") return true;
      return item?.partyName.toLowerCase() === user?.username.toLowerCase();
    });

  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">
                {activeTab === "pending"
                  ? "Final Weight Details"
                  : "Edit Final Weight"}
              </h2>
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
                    Party Name *
                  </label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  />
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

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Weight *
                </label>
                <input
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter final weight"
                />
              </div>

              {activeTab === "pending" && (
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weighment Copy *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="weighment-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="weighment-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload File (Image/PDF)
                    </label>
                    {weighmentCopy && (
                      <span className="text-sm text-gray-600">
                        {weighmentCopy.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
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
                onClick={handleSubmitFinalWeight}
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
                    {activeTab === "pending" ? "Submitting..." : "Updating..."}
                  </>
                ) : activeTab === "pending" ? (
                  "Submit Final Weight"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Final Weight</h1>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ERP DO No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transporter Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispatch Qty
                        </th>
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
                              Final Weight
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.serialNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.partyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.erpDoNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.transporterName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.vehicleNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.brandName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.dispatchQty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPendingData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No pending final weight records found.
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weighment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ERP DO No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispatch Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Final Weight
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weighment Copy
                        </th>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.serialNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.actual5
                              ? new Date(item.actual5).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.partyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.erpDoNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.vehicleNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.brandName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.dispatchQty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.finalWeight || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.weighmentCopy ? (
                              <button
                                onClick={(e) =>
                                  handleViewPDF(item.weighmentCopy, e)
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistoryData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        No historical final weight records found.
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

export default FinalWeight;
