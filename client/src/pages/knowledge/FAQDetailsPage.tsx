import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, Eye, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FAQService } from '../../services/faqService';
import toast from 'react-hot-toast';

export const FAQDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState(false);

  const { data: faq, isLoading, error } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => FAQService.getFaqById(id!),
    enabled: !!id
  });

  const voteMutation = useMutation({
    mutationFn: (vote: 'helpful' | 'unhelpful') => FAQService.voteHelpful(id!, vote),
    onSuccess: () => {
      setHasVoted(true);
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries({ queryKey: ['faq', id] });
    },
    onError: () => {
      toast.error('Failed to submit feedback. Please try again.');
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse space-y-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">FAQ Not Found</h2>
        <p className="mt-2 text-gray-500">The FAQ you are looking for does not exist or could not be loaded.</p>
        <Link to="/faqs" className="mt-4 inline-flex items-center text-primary-600 hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to FAQs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
      <Link to="/faqs" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Knowledge Base
      </Link>
      
      <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-background">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: faq.category?.color || '#3B82F6' }}>
            {faq.category?.name}
          </span>
          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            {faq.difficultyLevel}
          </span>
        </div>

        <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{faq.question}</h1>
        
        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {faq.estimatedReadingTime} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {faq.viewCount || 0} views
          </span>
          {faq.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {new Date(faq.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed">
          <ReactMarkdown>{faq.answer}</ReactMarkdown>
        </div>

        {/* Helpful Voting section */}
        <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Was this article helpful?</h4>
            <p className="text-xs text-gray-500 mt-1">{faq.helpfulCount} out of {faq.helpfulCount + faq.unhelpfulCount} people found this helpful</p>
          </div>
          
          <div className="flex gap-3">
            {hasVoted ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Thanks for your feedback!</span>
            ) : (
              <>
                <button
                  onClick={() => voteMutation.mutate('helpful')}
                  disabled={voteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-500 transition-all dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ThumbsUp className="h-4 w-4 text-green-500" /> Yes
                </button>
                <button
                  onClick={() => voteMutation.mutate('unhelpful')}
                  disabled={voteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-500 transition-all dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ThumbsDown className="h-4 w-4 text-red-500" /> No
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

