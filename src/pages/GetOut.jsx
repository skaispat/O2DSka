
import React, { useState, useEffect } from 'react';
import { Filter, Search, Clock, CheckCircle , RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const GetOut = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParty, setFilterParty] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [uniqueParties, setUniqueParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Adding timestamp to URL to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec?sheet=INVOICE-DELIVERY&timestamp=${timestamp}`
      );
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        const allData = json.data.slice(6).map((row, index) => ({
          id: index + 1,
          serialNumber: row[1],    // Column A
          partyName: row[2],       // Column C
          erpDoNo: row[3],         // Column D
          transporterName: row[4],  // Column E
          lrNumber: row[5],         // Column F
          vehicleNumber: row[6],    // Column G
          deliveryTerm: row[7],     // Column H
          billingDate: row[8],      // Column I
          billNo: row[9],           // Column J
          billStatus: row[10],      // Column K
          cashDiscount: row[11],    // Column L
          planned1: row[19],        // Column T - Planned1
          actual1: row[20],         // Column U - Actual1
          status: row[22]           // Column W - Status
        }));

        // Filter data based on conditions
        const pending = allData.filter(item => 
          item.planned1 && !item.actual1
        );
        const history = allData.filter(item => 
          item.planned1 && item.actual1
        );

        setPendingData(pending);
        setHistoryData(history);
        setUniqueParties([...new Set(allData.map(item => item.partyName))]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setStatus(item.status || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setStatus('');
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


  const handleSubmitStatus = async () => {

    console.log("currentItem",currentItem);

    if (!status) {
      toast.error('Please select status');
      return;
    }

    setIsSubmitting(true);
    const currentDateTime = getFormattedDateTime();

    try {
      

      // Update the Google Sheet
      const updateResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbyhWN2S6qnJm7RVQr5VpPfyKRxI8gks0xxgWh_reMVlpsWvLo0rfzvqVA34x2xkPsJm/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            sheetId: '1wbIPdsHBxTE7fnzgOiAxS4koFwNxzwdpgp59NRWsnoc',
            sheetName: 'INVOICE-DELIVERY',
            action: 'update',
            rowIndex: currentItem.id + 6,
            columnData: JSON.stringify({
              'U': `'${currentDateTime}`,  // Column U - Actual1 (autofill current date)
              'W': status            // Column W - Status
            })
          })
        }
      );

      const updateResult = await updateResponse.json();
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update Google Sheet');
      }

      toast.success('Status updated successfully!');
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("pendingData",pendingData);
  console.log("historyData",historyData);

  const filteredPendingData = pendingData.filter(item => {
    const matchesSearch = item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParty = filterParty === 'all' || item.partyName === filterParty;
    return matchesSearch && matchesParty;
  }).filter(item => {
  if (user?.username.toLowerCase() === 'admin') return true;
  return item?.partyName.toLowerCase() === user?.username.toLowerCase();
});

  const filteredHistoryData = historyData.filter(item => {
    const matchesSearch = item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.erpDoNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParty = filterParty === 'all' || item.partyName === filterParty;
    return matchesSearch && matchesParty;
  }).filter(item => {
  if (user?.username.toLowerCase() === 'admin') return true;
  return item?.partyName.toLowerCase() === user?.username.toLowerCase();
});


  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">Update Status</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</label>
                  <p className="mt-1 text-sm font-medium">{currentItem.serialNumber}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</label>
                  <p className="mt-1 text-sm font-medium">{currentItem.partyName}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">ERP DO No.</label>
                  <p className="mt-1 text-sm font-medium">{currentItem.erpDoNo}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</label>
                  <p className="mt-1 text-sm font-medium">{currentItem.vehicleNumber}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Complete">Complete</option>
                </select>
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
                onClick={handleSubmitStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Get Out</h1>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            {uniqueParties.map(party => (
              <option key={party} value={party}>{party}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('history')}
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
              {activeTab === 'pending' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP DO No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporter Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Term</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Discount</th>
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
                              Get Out
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.partyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.erpDoNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transporterName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lrNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicleNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deliveryTerm}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.billingDate ? new Date(item.billingDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.billNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.billStatus === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.billStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cashDiscount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPendingData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">No pending get out records found.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP DO No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporter Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Term</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Discount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'Complete' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.actual1 ? new Date(item.actual1).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.partyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.erpDoNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transporterName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lrNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicleNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deliveryTerm}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.billingDate ? new Date(item.billingDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.billNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.billStatus === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.billStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cashDiscount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistoryData.length === 0 && !loading && (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">No historical get out records found.</p>
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

export default GetOut;