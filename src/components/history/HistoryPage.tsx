import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService } from '../../services/historyService';
import { transactionService } from '../../services/transactionService';
import { format } from 'date-fns';
import { getUserId, isAuthenticated } from '../../utils/auth';
import ReviewModal from '../reviews/ReviewModal';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recentSells, setRecentSells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingRecentSells, setLoadingRecentSells] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      const userId = getUserId();
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }
      
      try {
        const [historyData, recentSellsData] = await Promise.all([
          historyService.getHistoryByUserId(userId),
          transactionService.getUserTransactions(userId)
        ]);
        
        // Asegurarse de que historyData tenga la estructura correcta
        setHistory({
          orders: historyData?.orders || [],
          totalOrders: historyData?.totalOrders || 0
        });
        
        // Asegurarse de que recentSellsData sea un array
        setRecentSells(Array.isArray(recentSellsData) ? recentSellsData : []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.message || 'Failed to load data');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleViewTransactions = async (order: any) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setTransactions([]);
      return;
    }

    setSelectedOrder(order);
    setLoadingTransactions(true);
    setError(null);

    try {
      if (!order.transactionIds || !Array.isArray(order.transactionIds) || order.transactionIds.length === 0) {
        setTransactions([]);
        return;
      }

      const transactionPromises = order.transactionIds.map((id: number) => 
        transactionService.getTransactionById(id)
      );

      const results = await Promise.allSettled(transactionPromises);
      const successfulTransactions = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulTransactions.length === 0) {
        setError('No transactions could be loaded');
      } else if (successfulTransactions.length < order.transactionIds.length) {
        setError('Some transactions could not be loaded');
      }

      setTransactions(successfulTransactions);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error(err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleStatusChange = async (transactionId: number, newStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    setUpdatingStatus(transactionId);
    try {
      // Find the current transaction data
      const currentTransaction = recentSells.find(t => t.id === transactionId) || 
                               transactions.find(t => t.id === transactionId);
      
      if (!currentTransaction) {
        throw new Error('Transaction not found');
      }

      // Create updated transaction data with new status
      const updatedTransactionData = {
        ...currentTransaction,
        status: newStatus
      };

      const updatedTransaction = await transactionService.updateTransactionStatus(updatedTransactionData);
      
      // Update the transaction in recentSells
      setRecentSells(prevSells => 
        prevSells.map(transaction => 
          transaction.id === transactionId ? updatedTransaction : transaction
        )
      );

      // Update the transaction in the selected order's transactions if it exists
      if (selectedOrder) {
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId ? updatedTransaction : transaction
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status');
      console.error(err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReviewClick = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
  };

  const handleReviewCreated = () => {
    // Refresh the transactions to show the new review
    if (selectedOrder) {
      handleViewTransactions(selectedOrder);
    }
  };

  const StatusSelect: React.FC<{ 
    transactionId: number; 
    currentStatus: string;
    onStatusChange: (id: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => void;
  }> = ({ transactionId, currentStatus, onStatusChange }) => (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(transactionId, e.target.value as 'PENDING' | 'COMPLETED' | 'CANCELLED')}
      disabled={updatingStatus === transactionId}
      className={`px-2 py-1 rounded text-sm ${
        currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        currentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      } border-0 focus:ring-2 focus:ring-primary-500`}
    >
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );

  if (loading) return <div className="container-app py-8">Loading...</div>;
  if (error && !transactions.length) return <div className="container-app py-8 text-red-600">{error}</div>;
  if (!history) return <div className="container-app py-8">No history found</div>;

  return (
    <div className="container-app py-8">
      <div className="space-y-12">
        {/* Recent Sells Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Sells</h2>
            <p className="text-gray-600 mt-1">View and manage your recent transactions</p>
          </div>
          
          {loadingRecentSells ? (
            <div className="text-center py-8">Loading recent sells...</div>
          ) : recentSells.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSells.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-medium">#{transaction.id}</p>
                      </div>
                      <StatusSelect
                        transactionId={transaction.id}
                        currentStatus={transaction.status}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium">${transaction.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">{transaction.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{transaction.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Product ID</p>
                        <p className="font-medium">#{transaction.productId}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">#{transaction.orderId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent sells found</div>
          )}
        </section>

        {/* Orders Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
            <p className="text-gray-600 mt-1">View your complete order history and their transactions</p>
          </div>

          <div className="space-y-6">
            {history.orders.map((order: any) => (
              <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderNumber}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">
                        Date: {format(new Date(order.date), 'PPP')}
                      </p>
                      <p className="text-gray-600">Status: {order.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewTransactions(order)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {selectedOrder?.id === order.id ? 'Hide Transactions' : 'View Transactions'}
                  </button>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Transactions</h3>
                    {loadingTransactions ? (
                      <div className="text-center py-4">Loading transactions...</div>
                    ) : transactions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="bg-white p-4 rounded-md shadow-sm">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-600">Transaction ID</p>
                                  <p className="font-medium">#{transaction.id}</p>
                                </div>
                                <StatusSelect
                                  transactionId={transaction.id}
                                  currentStatus={transaction.status}
                                  onStatusChange={handleStatusChange}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-sm text-gray-600">Price</p>
                                  <p className="font-medium">${transaction.price.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Amount</p>
                                  <p className="font-medium">{transaction.amount}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Payment Method</p>
                                  <p className="font-medium">{transaction.paymentMethod}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Product ID</p>
                                  <p className="font-medium">#{transaction.productId}</p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleReviewClick(transaction.id)}
                                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">No transactions found</div>
                    )}
                    {error && transactions.length > 0 && (
                      <div className="mt-2 text-sm text-red-600">{error}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={selectedTransactionId !== null}
        onClose={() => setSelectedTransactionId(null)}
        transactionId={selectedTransactionId || 0}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
};

export default HistoryPage; 