import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reviewService } from '../services/reviewService';

const CreateReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [points, setPoints] = useState(5);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (!transactionId) {
      setError('Transaction ID is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reviewService.createReview({
        transactionId: parseInt(transactionId),
        points,
        description,
      });
      navigate('/history');
    } catch (err: any) {
      setError(err.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Review</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPoints(i + 1)}
                    className={`text-3xl ${
                      i < points ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-500 transition-colors`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-3 text-gray-600">({points}/5)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={6}
                placeholder="Write your review here..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewPage; 