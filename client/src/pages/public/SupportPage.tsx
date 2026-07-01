import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/axios';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Link } from 'react-router-dom';

export const SupportPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [question, setQuestion] = useState('');

  const { data: myQueries = [], refetch } = useQuery({
    queryKey: ['my-queries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/queries/my-queries');
      return data.data;
    },
    enabled: isAuthenticated
  });

  const submitMutation = useMutation({
    mutationFn: async (q: string) => {
      await apiClient.post('/queries', { question: q });
    },
    onSuccess: () => {
      toast.success('Question submitted successfully!');
      setQuestion('');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit question');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    submitMutation.mutate(question);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Support & Unknown Questions</h1>
        <p className="text-gray-600 mb-8">Please sign in to submit a question to our administration team.</p>
        <Link to="/login">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Question not present on the portal?</h1>
        <p className="text-gray-600 dark:text-gray-400">If you couldn't find your answer in the FAQs or via Yaksha, submit your question directly to our admin team here.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your detailed question here..."
            className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[120px]"
            required
            maxLength={1000}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submitMutation.isPending || !question.trim()}
              className="w-full sm:w-auto"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Question'}
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Previous Queries</h2>
        {myQueries.length === 0 ? (
          <p className="text-gray-500 italic">You haven't submitted any questions yet.</p>
        ) : (
          <div className="space-y-4">
            {myQueries.map((q: any) => (
              <div key={q._id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    q.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    q.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {q.status}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-3">{q.question}</p>
                {q.response && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mt-4 border-l-4 border-primary-500">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Admin Response:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{q.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
