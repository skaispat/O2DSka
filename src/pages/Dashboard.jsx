
// import React, { useState, useEffect } from 'react';
// import useAuthStore from '../store/authStore';
// import useDataStore from '../store/dataStore';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line
// } from 'recharts';
// import {
//   Package,
//   Truck,
//   Scale,
//   Receipt,
//   Users,
//   TrendingUp,
//   Clock,
//   CheckCircle
// } from 'lucide-react';

// const Dashboard = () => {
//   const { user } = useAuthStore();
//   const { getFilteredData } = useDataStore();

//   // State for Google Sheets data
//   const [sheetsData, setSheetsData] = useState({
//     saudaQuantity: 0,
//     doGenerated: 0,
//     gateIn: 0,
//     pending: 0,
//     totalDelivered: 0,
//     orderStatusData: [],
//     logisticsData: [],
//     recentTransactions: []
//   });

//   const [selectedDate, setSelectedDate] = useState('');
//   const [loading, setLoading] = useState(true);
// const [dateRange, setDateRange] = useState({
//   startDate: '',
//   endDate: ''
// });
//   // Web app URL
//   const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec";

//   // Helper function to ensure data is in array format
//   const ensureArray = (data) => {
//     if (!data) return [];
//     if (Array.isArray(data)) return data;
//     if (data.values && Array.isArray(data.values)) return data.values;
//     if (data.data && Array.isArray(data.data)) return data.data;
//     if (data.saudaData && Array.isArray(data.saudaData)) return data.saudaData;
//     if (data.orderInvoiceData && Array.isArray(data.orderInvoiceData)) return data.orderInvoiceData;
//     if (data.invoiceDeliveryData && Array.isArray(data.invoiceDeliveryData)) return data.invoiceDeliveryData;
//     return [];
//   };

//   // Fetch data from Google Sheets
//   const fetchSheetsData = async () => {
//     try {
//       setLoading(true);

//       // Fetch data for each sheet separately using the same pattern as GateIn
//       const [saudaResponse, orderInvoiceResponse, invoiceDeliveryResponse] = await Promise.all([
//         fetch(`${WEBAPP_URL}?sheet=Sauda`),
//         fetch(`${WEBAPP_URL}?sheet=ORDER-INVOICE`),
//         fetch(`${WEBAPP_URL}?sheet=INVOICE-DELIVERY`)
//       ]);

//       const saudaData = (await saudaResponse.json()).data || [];
//       const orderInvoiceData = (await orderInvoiceResponse.json()).data || [];
//       const invoiceDeliveryData = (await invoiceDeliveryResponse.json()).data || [];

//       // Process the data
//       processSheetData(saudaData, orderInvoiceData, invoiceDeliveryData);

//     } catch (error) {
//       console.error('Error fetching sheets data:', error);
//       // Set default empty data
//       setSheetsData({
//         saudaQuantity: 0,
//         doGenerated: 0,
//         gateIn: 0,
//         pending: 0,
//         totalDelivered: 0,
//         orderStatusData: [
//           { name: 'Pending', value: 0, color: '#F59E0B' },
//           { name: 'In Progress', value: 0, color: '#3B82F6' },
//           { name: 'Completed', value: 0, color: '#10B981' },
//           { name: 'Cancelled', value: 0, color: '#EF4444' }
//         ],
//         logisticsData: [],
//         recentTransactions: []
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processSheetData = (saudaData, orderInvoiceData, invoiceDeliveryData) => {
//     // (1) Sauda Quantity - Count non-empty rows in column G (index 6)
//     const saudaQuantity = saudaData.reduce((total, row) => {
//       const value = parseFloat(row[6]);
//       return total + (isNaN(value) ? 0 : value);
//     }, 0);

//     // (2) DO Generated - Count non-empty rows in column B (index 1)
//     const doGenerated = saudaData.slice(1).filter(row =>
//       row && row[1] && row[1].toString().trim() !== ''
//     ).length;


//     // (3) Gate In - Count rows where Column K (index 10) is NOT NULL and Column L (index 11) is NULL
//     const gateIn = orderInvoiceData.filter(row =>
//       row && row[10] && row[10] !== '' && row[10] !== null &&
//       (!row[11] || row[11] === '' || row[11] === null)
//     ).length;

//     // (4) Pending - Count non-empty rows in column M (index 12)
//     const pending = saudaData.slice(1).reduce((total, row) => {
//       const value = parseFloat(row[12]);
//       return total + (isNaN(value) ? 0 : value);
//     }, 0);


//     // (5) Total Delivered - Count non-empty rows in column K (index 10)
//     const totalDelivered = saudaData.filter(row =>
//       row && row[10] && row[10] !== '' && row[10] !== null
//     ).length;

//     // (6) Order Status Tracking - Column W (index 22) from INVOICE-DELIVERY
//     const statusData = invoiceDeliveryData
//       .slice(1) // Skip header row
//       .filter(row => row && row[22] && row[22] !== '' && row[22] !== null);

//     const completeCount = statusData.filter(row =>
//       row[22].toString().toLowerCase() === 'complete'
//     ).length;

//     const pendingCount = statusData.filter(row =>
//       row[22].toString().toLowerCase() === 'pending'
//     ).length;

//     const totalStatus = completeCount + pendingCount;

//     const orderStatusData = [
//       {
//         name: 'Pending',
//         value: totalStatus > 0 ? Math.round((pendingCount / totalStatus) * 100) : 0,
//         color: '#F59E0B'
//       },
//       {
//         name: 'Completed',
//         value: totalStatus > 0 ? Math.round((completeCount / totalStatus) * 100) : 0,
//         color: '#10B981'
//       }
//     ];

//     // (7) Logistics Overview - Monthly data from ORDER-INVOICE
//     const logisticsData = processLogisticsData(orderInvoiceData);

//     // (8) Recent Transactions - Columns C, D, E, M from Sauda
//     let recentTransactions = saudaData
//   // Skip the first row (header) and filter out empty rows
//   .slice(6)
//   .filter(row => row && row.length > 0)
//   .map(row => {
//     // Format dateOfSauda from row[2]
//     let dateStr = '';
//     if (row[2]) {
//       const rawDate = new Date(row[2]);
//       if (!isNaN(rawDate.getTime())) {
//         const day = String(rawDate.getDate()).padStart(2, '0');
//         const month = String(rawDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
//         const year = rawDate.getFullYear();
//         dateStr = `${day}/${month}/${year}`;
//       } else {
//         // If date is in string format like dd-mm-yyyy or dd/mm/yyyy, keep as-is
//         dateStr = row[2].toString();
//       }
//     }

//     return {
//       dateOfSauda: dateStr || '',
//       brokerName: row[3] || '',
//       rate: row[4] || '',
//       pendingQty: row[12] || ''
//     };
//   })
//   .filter(item => item.dateOfSauda || item.brokerName || item.rate || item.pendingQty);


//     // Filter by selected date if provided
//     if (selectedDate) {
//       recentTransactions = recentTransactions.filter(item => {
//         if (item.dateOfSauda) {
//           try {
//             const itemDate = new Date(item.dateOfSauda).toISOString().split('T')[0];
//             return itemDate === selectedDate;
//           } catch (e) {
//             return false;
//           }
//         }
//         return false;
//       });
//     }

//     setSheetsData({
//       saudaQuantity,
//       doGenerated,
//       gateIn,
//       pending,
//       totalDelivered,
//       orderStatusData,
//       logisticsData,
//       recentTransactions: recentTransactions.slice(0, 10)
//     });
//   };

//   const processLogisticsData = (orderInvoiceData) => {
//     const monthlyData = {};

//     orderInvoiceData.forEach(row => {
//       if (!row) return;

//       let month = 'Unknown';
//       if (row[0]) {
//         try {
//           const date = new Date(row[0]);
//           if (!isNaN(date.getTime())) {
//             month = date.toLocaleDateString('en-US', { month: 'short' });
//           }
//         } catch (e) {
//           const dateStr = row[0].toString();
//           if (dateStr.includes('/') || dateStr.includes('-')) {
//             const parts = dateStr.split(/[\/\-]/);
//             if (parts.length >= 2) {
//               const monthNum = parseInt(parts[1]) || parseInt(parts[0]);
//               if (monthNum >= 1 && monthNum <= 12) {
//                 const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//                 month = monthNames[monthNum - 1];
//               }
//             }
//           }
//         }
//       }

//       if (!monthlyData[month]) {
//         monthlyData[month] = { month, gateIn: 0, gateOut: 0, delays: 0 };
//       }

//       // Gate In - Column K (index 10) is NOT NULL
//       if (row[10] && row[10] !== '' && row[10] !== null) {
//         monthlyData[month].gateIn++;
//       }

//       // Gate Out - Column T (index 19) & U (index 20) must both be NOT NULL
//       if (row[19] && row[19] !== '' && row[19] !== null &&
//         row[20] && row[20] !== '' && row[20] !== null) {
//         monthlyData[month].gateOut++;
//       }

//       // Delays - Count rows in Column U (index 20)
//       if (row[20] !== undefined && row[20] !== null) {
//         monthlyData[month].delays++;
//       }
//     });

//     const result = Object.values(monthlyData).slice(0, 6);

//     if (result.length === 0) {
//       return [
//         { month: 'Jan', gateIn: 0, gateOut: 0, delays: 0 },
//         { month: 'Feb', gateIn: 0, gateOut: 0, delays: 0 },
//         { month: 'Mar', gateIn: 0, gateOut: 0, delays: 0 },
//         { month: 'Apr', gateIn: 0, gateOut: 0, delays: 0 },
//         { month: 'May', gateIn: 0, gateOut: 0, delays: 0 },
//         { month: 'Jun', gateIn: 0, gateOut: 0, delays: 0 }
//       ];
//     }

//     return result;
//   };

//   useEffect(() => {
//     fetchSheetsData();
//   }, []);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchSheetsData();
//     }
//   }, [selectedDate]);

//   // Get filtered data based on user role (keeping original logic)
//   const saudaData = getFilteredData('saudaData', user);
//   const doData = getFilteredData('doData', user);
//   const gateInData = getFilteredData('gateInData', user);
//   const invoiceData = getFilteredData('invoiceData', user);

//   const performanceData = [
//     { name: 'Staff Productivity', value: 85 },
//     { name: 'Delivery Times', value: 92 },
//     { name: 'Quality Score', value: 88 },
//     { name: 'Customer Satisfaction', value: 94 }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Dashboard {user?.role !== 'admin' && '(My Data)'}
//         </h1>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//         <div className="bg-white rounded-xl shadow p-6 flex items-start">
//           <div className="p-3 rounded-full bg-blue-100 mr-4">
//             <Package size={24} className="text-blue-600" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Sauda Quantity</p>
//             <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.saudaQuantity}</h3>
//             <p className="text-xs text-green-600 mt-1">+12% from last month</p>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6 flex items-start">
//           <div className="p-3 rounded-full bg-green-100 mr-4">
//             <Truck size={24} className="text-green-600" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">DO Generated</p>
//             <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.doGenerated}</h3>
//             <p className="text-xs text-green-600 mt-1">+8% from last month</p>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6 flex items-start">
//           <div className="p-3 rounded-full bg-purple-100 mr-4">
//             <Scale size={24} className="text-purple-600" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Gate In</p>
//             <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.gateIn}</h3>
//             <p className="text-xs text-amber-600 mt-1">5 pending today</p>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6 flex items-start">
//           <div className="p-3 rounded-full bg-amber-100 mr-4">
//             <Receipt size={24} className="text-amber-600" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Pending</p>
//             <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.pending}</h3>
//             <p className="text-xs text-green-600 mt-1">₹2.5L revenue</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow p-6 flex items-start">
//           <div className="p-3 rounded-full bg-amber-100 mr-4">
//             <Receipt size={24} className="text-amber-600" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Total Deliverd</p>
//             <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.totalDelivered}</h3>
//             <p className="text-xs text-green-600 mt-1">₹2.5L revenue</p>
//           </div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow p-6">
//           <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
//             <Package size={20} className="mr-2 text-indigo-600" />
//             Order Status Tracking
//           </h2>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={sheetsData.orderStatusData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   dataKey="value"
//                   nameKey="name"
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {sheetsData.orderStatusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow p-6">
//           <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
//             <Truck size={20} className="mr-2 text-indigo-600" />
//             Logistics Overview
//           </h2>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={sheetsData.logisticsData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="gateIn" name="Gate In" fill="#4F46E5" />
//                 <Bar dataKey="gateOut" name="Gate Out" fill="#10B981" />
//                 <Bar dataKey="delays" name="Delays" fill="#EF4444" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Data Table - 4 Column */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-bold text-gray-800 flex items-center">
//             <Users size={20} className="mr-2 text-indigo-600" />
//             Recent Transactions
//           </h2>
//           <div className="flex items-center space-x-2">
//             <label htmlFor="dateFilter" className="text-sm text-gray-600">Filter by Date:</label>
//             <input
//               type="date"
//               id="dateFilter"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {selectedDate && (
//               <button
//                 onClick={() => setSelectedDate('')}
//                 className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Sauda</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Of Quantity</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
//                 </tr>
//               ) : sheetsData.recentTransactions.length > 0 ? (
//                 sheetsData.recentTransactions.map((item, index) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.dateOfSauda}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.brokerName}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.rate}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.pendingQty}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No data available</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

















import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useDataStore from '../store/dataStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Package,
  Truck,
  Scale,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  PackageCheck 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getFilteredData } = useDataStore();

  // State for Google Sheets data
  const [sheetsData, setSheetsData] = useState({
    saudaQuantity: 0,
    doGenerated: 0,
    gateIn: 0,
    pending: 0,
    totalDelivered: 0,
    orderStatusData: [],
    logisticsData: [],
    recentTransactions: []
  });

  console.log("sheetDAta",sheetsData);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  // Web app URL
  const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec";

  // Helper function to ensure data is in array format
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.values && Array.isArray(data.values)) return data.values;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.saudaData && Array.isArray(data.saudaData)) return data.saudaData;
    if (data.orderInvoiceData && Array.isArray(data.orderInvoiceData)) return data.orderInvoiceData;
    if (data.invoiceDeliveryData && Array.isArray(data.invoiceDeliveryData)) return data.invoiceDeliveryData;
    return [];
  };

  // Fetch data from Google Sheets
  const fetchSheetsData = async () => {
    try {
      setLoading(true);

      // Fetch data for each sheet separately using the same pattern as GateIn
      const [saudaResponse, orderInvoiceResponse, invoiceDeliveryResponse] = await Promise.all([
        fetch(`${WEBAPP_URL}?sheet=Sauda`),
        fetch(`${WEBAPP_URL}?sheet=ORDER-INVOICE`),
        fetch(`${WEBAPP_URL}?sheet=INVOICE-DELIVERY`)
      ]);

      const saudaData = (await saudaResponse.json()).data || [];
      const orderInvoiceData = (await orderInvoiceResponse.json()).data || [];
      const invoiceDeliveryData = (await invoiceDeliveryResponse.json()).data || [];


      // console.log("saudaData",saudaData);
      // console.log("orderInvoiceData",orderInvoiceData);
      // console.log("invoiceDeliveryData",invoiceDeliveryData);

      // Process the data
      processSheetData(saudaData, orderInvoiceData, invoiceDeliveryData);

    } catch (error) {
      console.error('Error fetching sheets data:', error);
      // Set default empty data
      setSheetsData({
        saudaQuantity: 0,
        doGenerated: 0,
        gateIn: 0,
        pending: 0,
        totalDelivered: 0,
        orderStatusData: [
          { name: 'Pending', value: 0, color: '#F59E0B' },
          { name: 'In Progress', value: 0, color: '#3B82F6' },
          { name: 'Completed', value: 0, color: '#10B981' },
          { name: 'Cancelled', value: 0, color: '#EF4444' }
        ],
        logisticsData: [],
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const processSheetData = (saudaData, orderInvoiceData, invoiceDeliveryData) => {
    // (1) Sauda Quantity - Count non-empty rows in column G (index 6)
    const saudaQuantity = saudaData.reduce((total, row) => {
      const value = parseFloat(row[6]);
      console.log("value",value)
      
      return total + (isNaN(value) ? 0 : value);
    }, 0);

    // (2) DO Generated - Count non-empty rows in column B (index 1)
    const doGenerated = saudaData.slice(1).filter(row =>
      row && row[1] && row[1].toString().trim() !== ''
    ).length;


    // (3) Gate In - Count rows where Column K (index 10) is NOT NULL and Column L (index 11) is NULL
    const gateIn = orderInvoiceData.filter(row =>
      row && row[10] && row[10] !== '' && row[10] !== null &&
      (!row[11] || row[11] === '' || row[11] === null)
    ).length;

    // (4) Pending - Count non-empty rows in column M (index 12)
    const pending = saudaData.slice(1).reduce((total, row) => {
      const value = parseFloat(row[12]);


      return total + (isNaN(value) ? 0 : value);
    }, 0);


    // (5) Total Delivered - Count non-empty rows in column K (index 10)
    const totalDelivered = saudaData.filter(row =>
      row && row[10] && row[10] !== '' && row[10] !== null
    ).length;

    // (6) Order Status Tracking - Column W (index 22) from INVOICE-DELIVERY
    const statusData = invoiceDeliveryData
      .slice(1) // Skip header row
      .filter(row => row && row[22] && row[22] !== '' && row[22] !== null);

    const completeCount = statusData.filter(row =>
      row[22].toString().toLowerCase() === 'complete'
    ).length;

    const pendingCount = statusData.filter(row =>
      row[22].toString().toLowerCase() === 'pending'
    ).length;

    const totalStatus = completeCount + pendingCount;

    const orderStatusData = [
      {
        name: 'Pending',
        value: totalStatus > 0 ? Math.round((pendingCount / totalStatus) * 100) : 0,
        color: '#F59E0B'
      },
      {
        name: 'Completed',
        value: totalStatus > 0 ? Math.round((completeCount / totalStatus) * 100) : 0,
        color: '#10B981'
      }
    ];

    // (7) Logistics Overview - Monthly data from ORDER-INVOICE
    const logisticsData = processLogisticsData(orderInvoiceData);

    // (8) Recent Transactions - Columns C, D, E, M from Sauda
    let recentTransactions = saudaData
      .slice(6)
      .filter(row => row && row.length > 0)
      .map(row => {
        // Format dateOfSauda from row[2]
        let dateStr = '';
        if (row[2]) {
          const rawDate = new Date(row[2]);
          if (!isNaN(rawDate.getTime())) {
            const day = String(rawDate.getDate()).padStart(2, '0');
            const month = String(rawDate.getMonth() + 1).padStart(2, '0');
            const year = rawDate.getFullYear();
            dateStr = `${day}/${month}/${year}`;
          } else {
            dateStr = row[2].toString();
          }
        }

        return {
          dateOfSauda: dateStr || '',
          brokerName: row[3] || '',
          rate: row[4] || '',
          pendingQty: row[12] || ''
        };
      })
      .filter(item => item.dateOfSauda || item.brokerName || item.rate || item.pendingQty);

    // Filter by date range if provided
    if (dateRange.startDate && dateRange.endDate) {
      recentTransactions = recentTransactions.filter(item => {
        if (item.dateOfSauda) {
          try {
            // Convert the item date to a comparable format
            const [day, month, year] = item.dateOfSauda.split('/');
            const itemDate = new Date(`${year}-${month}-${day}`);
            
            // Convert filter dates to Date objects
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            
            // Check if the item date is within the range
            return itemDate >= startDate && itemDate <= endDate;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    }

    setSheetsData({
      saudaQuantity,
      doGenerated,
      gateIn,
      pending,
      totalDelivered,
      orderStatusData,
      logisticsData,
      recentTransactions: recentTransactions.slice(0, 10)
    });
  };

  const processLogisticsData = (orderInvoiceData) => {
    const monthlyData = {};

    orderInvoiceData.forEach(row => {
      if (!row) return;

      let month = 'June';
      if (row[0]) {
        try {
          const date = new Date(row[0]);
          if (!isNaN(date.getTime())) {
            month = date.toLocaleDateString('en-US', { month: 'short' });
          }
        } catch (e) {
          const dateStr = row[0].toString();
          if (dateStr.includes('/') || dateStr.includes('-')) {
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length >= 2) {
              const monthNum = parseInt(parts[1]) || parseInt(parts[0]);
              if (monthNum >= 1 && monthNum <= 12) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                month = monthNames[monthNum - 1];
              }
            }
          }
        }
      }

      if (!monthlyData[month]) {
        monthlyData[month] = { month, gateIn: 0, gateOut: 0, delays: 0 };
      }

      // Gate In - Column K (index 10) is NOT NULL
      if (row[10] && row[10] !== '' && row[10] !== null) {
        monthlyData[month].gateIn++;
      }

      // Gate Out - Column T (index 19) & U (index 20) must both be NOT NULL
      if (row[19] && row[19] !== '' && row[19] !== null &&
        row[20] && row[20] !== '' && row[20] !== null) {
        monthlyData[month].gateOut++;
      }

      // Delays - Count rows in Column U (index 20)
      if (row[20] !== undefined && row[20] !== null) {
        monthlyData[month].delays++;
      }
    });

    const result = Object.values(monthlyData).slice(0, 6);

    if (result.length === 0) {
      return [
        { month: 'Jan', gateIn: 0, gateOut: 0, delays: 0 },
        { month: 'Feb', gateIn: 0, gateOut: 0, delays: 0 },
        { month: 'Mar', gateIn: 0, gateOut: 0, delays: 0 },
        { month: 'Apr', gateIn: 0, gateOut: 0, delays: 0 },
        { month: 'May', gateIn: 0, gateOut: 0, delays: 0 },
        { month: 'Jun', gateIn: 0, gateOut: 0, delays: 0 }
      ];
    }

    return result;
  };

  useEffect(() => {
    fetchSheetsData();
  }, []);

  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      fetchSheetsData();
    }
  }, [dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Get filtered data based on user role (keeping original logic)
  const saudaData = getFilteredData('saudaData', user);
  const doData = getFilteredData('doData', user);
  const gateInData = getFilteredData('gateInData', user);
  const invoiceData = getFilteredData('invoiceData', user);


  // console.log("saudaData",saudaData);
  // console.log("doData",doData);
  // console.log("gateInData",gateInData);
  // console.log("invoiceData",invoiceData);

  const performanceData = [
    { name: 'Staff Productivity', value: 85 },
    { name: 'Delivery Times', value: 92 },
    { name: 'Quality Score', value: 88 },
    { name: 'Customer Satisfaction', value: 94 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard {user?.role !== 'admin' && '(My Data)'}
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sauda Quantity</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.saudaQuantity}</h3>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <Truck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">DO Generated</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.doGenerated}</h3>
            <p className="text-xs text-green-600 mt-1">+8% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <Scale size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Gate In</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.gateIn}</h3>
            <p className="text-xs text-amber-600 mt-1">5 pending today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <Receipt size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.pending}</h3>
            <p className="text-xs text-green-600 mt-1">₹2.5L revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Deliverd</p>
            <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : sheetsData.totalDelivered}</h3>
            <p className="text-xs text-green-600 mt-1">₹2.5L revenue</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Package size={20} className="mr-2 text-indigo-600" />
            Order Status Tracking
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sheetsData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sheetsData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Truck size={20} className="mr-2 text-indigo-600" />
            Logistics Overview
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sheetsData.logisticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gateIn" name="Gate In" fill="#4F46E5" />
                <Bar dataKey="gateOut" name="Gate Out" fill="#10B981" />
                <Bar dataKey="delays" name="Delays" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table - 4 Column */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Users size={20} className="mr-2 text-indigo-600" />
            Recent Transactions
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="startDate" className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="endDate" className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={clearDateRange}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Sauda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Of Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : sheetsData.recentTransactions.length > 0 ? (
                sheetsData.recentTransactions.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.dateOfSauda}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.brokerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.rate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.pendingQty}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;