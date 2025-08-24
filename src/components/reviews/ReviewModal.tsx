import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  transactionId,
}) => {
  const navigate = useNavigate();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      if (!isOpen || !transactionId) return;
      
      setLoading(true);
      setError(null);
      try {
        const reviewData = await reviewService.getReviewByTransactionId(transactionId);
        if (reviewData) {
          setReview(reviewData);
        } else {
          // Si no hay review, redirigir a la página de creación
          navigate(`/create-review/${transactionId}`);
          onClose();
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Si no existe la review, redirigir a la página de creación
          navigate(`/create-review/${transactionId}`);
          onClose();
        } else {
          setError(err.message || 'Failed to fetch review');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [isOpen, transactionId, navigate, onClose]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Review Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : review ? (
          <div className="space-y-4">
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
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-800">{review.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-gray-800">
                {review.date ? formatDate(review.date) : 'N/A'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewModal; 