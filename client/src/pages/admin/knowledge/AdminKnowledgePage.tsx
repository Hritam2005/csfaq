import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle, Loader2, BookOpen, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { KnowledgeService, KnowledgeCategory } from '../../../services/knowledge/KnowledgeService';
import { Button } from '../../../components/ui/Button';

export const AdminKnowledgePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', summary: '', category: '' });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => KnowledgeService.getAllFaqsAdmin(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => KnowledgeService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: () => KnowledgeService.createFaq(form),
    onSuccess: () => {
      toast.success('FAQ created');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      setShowForm(false);
      setForm({ question: '', answer: '', summary: '', category: '' });
    },
    onError: () => toast.error('Failed to create FAQ'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => KnowledgeService.publishFaq(id),
    onSuccess: () => {
      toast.success('FAQ published');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => KnowledgeService.deleteFaq(id),
    onSuccess: () => {
      toast.success('FAQ deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    },
  });

  const getCategoryName = (faq: any) => {
    if (typeof faq.category === 'object') return faq.category?.name || '—';
    const cat = categories.find((c: KnowledgeCategory) => c._id === faq.category);
    return cat?.name || '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary-600" />
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage FAQ articles that power Yaksha and the public knowledge base.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">New FAQ Article</h2>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="Short summary (optional)"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[120px] dark:border-gray-700 dark:bg-gray-800"
            placeholder="Answer (Markdown supported)"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.question || !form.answer || !form.category || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {faqs.map((faq) => (
                <tr key={faq._id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">{faq.question}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getCategoryName(faq)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      faq.approvalStatus === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {faq.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {faq.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => publishMutation.mutate(faq._id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/20"
                          title="Publish"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(faq._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No FAQ articles yet. Run the seed script or add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
