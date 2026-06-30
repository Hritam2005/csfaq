import React, { useState, useEffect } from 'react';
import { Save, Loader2, Bot, Database } from 'lucide-react';
import { adminApi } from '../../../services/admin/AdminService';
import toast from 'react-hot-toast';

export const AdminAISettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    rag_chunk_size: 1000,
    rag_chunk_overlap: 100,
    rag_chunk_strategy: 'recursive',
    rag_embedding_engine: 'openai',
    rag_max_results: 5,
    llm_temperature: 0.3,
    llm_top_p: 1.0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getConfigs();
      const configMap = res.data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      setSettings(prev => ({
        ...prev,
        ...configMap
      }));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        adminApi.updateConfig(key, value)
      );
      await Promise.all(promises);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    
    if (type === 'number' || type === 'range') {
      parsedValue = Number(value);
    }
    
    setSettings(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Engine Configuration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure parameters for Retrieval-Augmented Generation (RAG) and LLMs.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Document Processing (RAG) */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Database className="h-5 w-5 text-indigo-500" />
              Document Processing & Retrieval
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chunking Strategy</label>
              <select
                name="rag_chunk_strategy"
                value={settings.rag_chunk_strategy}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="recursive">Recursive Character (Recommended)</option>
                <option value="sentence">Sentence Based</option>
                <option value="paragraph">Paragraph Based</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chunk Size (Tokens)</label>
                <input
                  type="number"
                  name="rag_chunk_size"
                  value={settings.rag_chunk_size}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overlap Size (Tokens)</label>
                <input
                  type="number"
                  name="rag_chunk_overlap"
                  value={settings.rag_chunk_overlap}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Embedding Engine</label>
              <select
                name="rag_embedding_engine"
                value={settings.rag_embedding_engine}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="openai">OpenAI (text-embedding-3-small)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Retrieval Results</label>
              <input
                type="number"
                name="rag_max_results"
                value={settings.rag_max_results}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">Number of most relevant chunks passed to LLM.</p>
            </div>
          </div>
        </div>

        {/* LLM Generation */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Bot className="h-5 w-5 text-purple-500" />
              Language Model (LLM) Settings
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                <span className="text-sm text-gray-500">{settings.llm_temperature}</span>
              </div>
              <input
                type="range"
                name="llm_temperature"
                min="0"
                max="2"
                step="0.1"
                value={settings.llm_temperature}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500">Higher values produce more random outputs.</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Top P</label>
                <span className="text-sm text-gray-500">{settings.llm_top_p}</span>
              </div>
              <input
                type="range"
                name="llm_top_p"
                min="0"
                max="1"
                step="0.05"
                value={settings.llm_top_p}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500">Nucleus sampling threshold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
