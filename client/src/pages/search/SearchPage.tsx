import React, { useState } from 'react';
import { Search as SearchIcon, FileText, Book, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate network latency
    setTimeout(() => setIsSearching(false), 800);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Filter className="h-4 w-4" /> Filters
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
              FAQs
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
              Documents
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Past Conversations
            </label>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <form onSubmit={handleSearch} className="relative mb-8 flex items-center">
          <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all enterprise knowledge..."
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-24 text-base outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white"
          />
          <Button type="submit" size="sm" className="absolute right-2 top-2 h-8" isLoading={isSearching}>
            Search
          </Button>
        </form>

        {/* Results Area */}
        {isSearching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {query.length > 0 ? (
              // Mock Search Results
              <>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Found 3 results for "{query}"</p>
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-primary-500 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                    <Book className="h-4 w-4" /> FAQ Match
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">How do I onboard a new employee?</h3>
                  <p className="text-gray-600 dark:text-gray-300">Submit the IT ticket. Assign the onboarding module via Workday. Ensure all compliance documents are signed prior to Day 1...</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-primary-500 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                    <FileText className="h-4 w-4" /> Document Chunk Match
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Employee_Handbook_2023.pdf</h3>
                  <p className="text-gray-600 dark:text-gray-300">...the formal onboarding process requires verification of identity documents (I-9) within 3 days of the start date...</p>
                </div>
              </>
            ) : (
              // Empty State (Before search)
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <SearchIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">What are you looking for?</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Try searching for "benefits", "PTO", or "VPN setup".</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
