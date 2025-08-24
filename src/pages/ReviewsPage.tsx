import React, { useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService';
import { transactionService } from '../services/transactionService';
import { userService } from '../services/userService';
import { format, parseISO } from 'date-fns';

interface Review {
  id: number;
  transactionId: number;
  points: number;
  description: string;
  date: string;
}

interface Transaction {
  id: number;
  userId: number;
  status: string;
  price: number;
  paymentMethod: string;
  amount: number;
  productId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<{ [key: number]: Transaction }>({});
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await reviewService.getAllReviews();
        setReviews(reviewsData);

        // Obtener los detalles de las transacciones para cada review
        const transactionPromises = reviewsData.map(review =>
          transactionService.getTransactionById(review.transactionId)
        );

        const transactionResults = await Promise.allSettled(transactionPromises);
        const transactionMap: { [key: number]: Transaction } = {};

        transactionResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            transactionMap[reviewsData[index].transactionId] = result.value;
          }
        });

        setTransactions(transactionMap);

        // Obtener los detalles de los usuarios para cada transacción
        const userIds = Object.values(transactionMap).map(t => t.userId);
        const uniqueUserIds = [...new Set(userIds)];
        
        const userPromises = uniqueUserIds.map(userId =>
          userService.getUserProfile(userId)
        );

        const userResults = await Promise.allSettled(userPromises);
        const userMap: { [key: number]: User } = {};

        userResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            userMap[uniqueUserIds[index]] = result.value;
          }
        });

        setUsers(userMap);
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) return <div className="container-app py-8">Loading...</div>;
  if (error) return <div className="container-app py-8 text-red-600">{error}</div>;

  return (
    <div className="container-app py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Reviews</h1>
          <p className="text-gray-600 mt-1">View all product reviews from the community</p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => {
              const transaction = transactions[review.transactionId];
              const user = transaction ? users[transaction.userId] : null;
              
              return (
                <div key={review.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Rating */}
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-2xl ${
                              i < review.points ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-gray-600">({review.points}/5)</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm text-gray-600">Review</p>
                      <p className="text-gray-800">{review.description}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-gray-800">{formatDate(review.date)}</p>
                    </div>

                    {/* User Details */}
                    {user && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">User Details</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{user.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Details */}
                    {transaction && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Transaction Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium">{transaction.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-medium">${transaction.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium">{transaction.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-medium">{transaction.amount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Product ID</p>
                            <p className="font-medium">#{transaction.productId}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage; 