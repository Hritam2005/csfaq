import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { KnowledgeService } from '../../services/knowledge/KnowledgeService';

export const FAQDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  const { data: faq, isLoading, error } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => KnowledgeService.getFaq(id!),
    enabled: !!id,
  });

  const feedbackMutation = useMutation({
    mutationFn: (type: 'helpful' | 'unhelpful') => KnowledgeService.submitFeedback(id!, type),
    onSuccess: (_, type) => {
      setFeedback(type);
      toast.success('Thanks for your feedback!');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Article not found.</p>
        <Link to="/faqs" className="mt-4 inline-block text-primary-600 hover:underline">Back to Knowledge Base</Link>
      </div>
    );
  }

  const categoryName = typeof faq.category === 'object' ? faq.category?.name : 'General';

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
      <Link to="/faqs" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Knowledge Base
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-background">
        <span className="mb-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {categoryName}
        </span>
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900 dark:text-white">{faq.question}</h1>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <ReactMarkdown>{faq.answer || ''}</ReactMarkdown>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Was this article helpful?</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => feedbackMutation.mutate('helpful')}
                disabled={!!feedback}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${
                  feedback === 'helpful' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700'
                }`}
              >
                <ThumbsUp className="h-4 w-4" /> Yes
              </button>
              <button
                onClick={() => feedbackMutation.mutate('unhelpful')}
                disabled={!!feedback}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${
                  feedback === 'unhelpful' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700'
                }`}
              >
                <ThumbsDown className="h-4 w-4" /> No
              </button>
            </div>
          </div>
          <Link
            to="/support"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500"
          >
            <MessageSquare className="h-4 w-4" />
            Still need help? Ask support
          </Link>
        </div>
      </div>

      {faq.relatedFaqs && faq.relatedFaqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Articles</h2>
          <div className="grid gap-3">
            {faq.relatedFaqs.map((related: any) => (
              <Link
                key={related._id}
                to={`/faqs/${related._id}`}
                className="rounded-lg border border-gray-200 p-4 text-sm hover:border-primary-500 dark:border-gray-800"
              >
                {related.question}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
