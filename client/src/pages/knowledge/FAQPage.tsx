import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, HelpCircle, ArrowUpRight, FolderOpen, RefreshCcw, Sliders, Sparkles, ThumbsUp, Flame, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FAQService, FAQ } from '../../services/faqService';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // New states for priority dropdown
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [prioritySearchQuery, setPrioritySearchQuery] = useState('');
  const [highlightedFaqId, setHighlightedFaqId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync category state with searchParams
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  // Query categories
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: FAQService.getCategories
  });

  // Query FAQs
  const { data: faqs, isLoading: isFaqsLoading, error, refetch } = useQuery({
    queryKey: ['faqs', debouncedSearch, selectedCategory],
    queryFn: () => FAQService.getFaqs({
      q: debouncedSearch || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    })
  });

  // Query all FAQs for the Priority Navigator dropdown
  const { data: allFaqs } = useQuery({
    queryKey: ['allFaqsForPriority'],
    queryFn: () => FAQService.getFaqs()
  });

  // Handle click outside for priority dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPriorityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Bucket FAQs into Priority Levels
  const priorityLevels = useMemo(() => {
    if (!allFaqs || allFaqs.length === 0) {
      return { level1: [], level2: [], level3: [] };
    }
    
    // Sort by helpful votes descending
    const sorted = [...allFaqs].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    const total = sorted.length;
    
    // Percentile-based grouping
    // Level 1: Top 30%
    // Level 2: Middle 40%
    // Level 3: Bottom 30%
    const l1Count = Math.max(1, Math.floor(total * 0.3));
    const l2Count = Math.max(1, Math.floor(total * 0.4));
    
    const level1 = sorted.slice(0, l1Count);
    const level2 = sorted.slice(l1Count, l1Count + l2Count);
    const level3 = sorted.slice(l1Count + l2Count);
    
    return { level1, level2, level3 };
  }, [allFaqs]);

  const filterPriorityFaqs = (list: FAQ[]) => {
    if (!prioritySearchQuery) return list;
    return list.filter(faq =>
      faq.question.toLowerCase().includes(prioritySearchQuery.toLowerCase()) ||
      (faq.answer && faq.answer.toLowerCase().includes(prioritySearchQuery.toLowerCase()))
    );
  };

  const handleSelectPriorityFaq = (faq: FAQ) => {
    // Reset filters to show navigated card
    setSelectedCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    
    searchParams.delete('category');
    setSearchParams(searchParams);
    
    setExpandedFaqId(faq._id);
    setHighlightedFaqId(faq._id);
    
    setTimeout(() => {
      setHighlightedFaqId(null);
    }, 2500);

    setTimeout(() => {
      const element = document.getElementById(`faq-card-${faq._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    
    setIsPriorityDropdownOpen(false);
    setPrioritySearchQuery('');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setExpandedFaqId(null);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const toggleFaqExpand = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-950/20 pb-20">
      {/* Search Header Banner */}
      <section className="relative overflow-hidden bg-white dark:bg-background border-b border-gray-150 dark:border-gray-800 py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-10" />
        <div className="container relative mx-auto px-4 max-w-4xl text-center">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4"
          >
            Vicharanashala Help Desk
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8"
          >
            Find quick answers to common queries about Vicharanashala internship, policies, timelines, NOCs, and more.
          </motion.p>

          {/* Large search input */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto shadow-sm"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQ keywords (e.g. NOC, stipend, Rosetta, Spurti)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-base placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white"
            />
          </motion.div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2">Categories</h3>
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-3 lg:pb-0">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`flex items-center text-left gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 whitespace-nowrap lg:whitespace-normal text-left">All FAQs</span>
              </button>
              
              {!isCatsLoading && categories?.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`flex items-center text-left gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === cat._id
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400 font-bold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 whitespace-nowrap lg:whitespace-normal text-left">{cat.name}</span>
                  {cat.analytics?.faqCount !== undefined && (
                    <span className="ml-2 text-xs bg-gray-200/50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-500 font-medium hidden lg:inline-block flex-shrink-0">
                      {cat.analytics.faqCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Accordion / FAQ Area */}
          <main className="lg:col-span-3">
            {/* Priority Quick Navigator Dropdown Panel */}
            <div className="relative mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-250 dark:border-gray-800/80 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-950/30 text-primary-500 rounded-xl">
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                    Priority Quick Finder
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jump directly to questions grouped by vote priority (Levels 1-3)</p>
                </div>
              </div>

              {/* Dropdown Container */}
              <div ref={dropdownRef} className="relative w-full sm:w-80">
                <button
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                  className="flex w-full items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all focus:ring-2 focus:ring-primary-500/20"
                >
                  <span className="flex items-center gap-2">
                    ⚡ Find by Priority
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Overlay */}
                <AnimatePresence>
                  {isPriorityDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-full sm:w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      {/* Search / Filter input */}
                      <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search priority list..."
                            value={prioritySearchQuery}
                            onChange={(e) => setPrioritySearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 dark:text-white outline-none focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                      </div>

                      {/* Priority Groups */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        
                        {/* Level 1: High Priority */}
                        <div className="p-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <Flame className="h-3.5 w-3.5" /> Level 1: High Priority (Top Voted)
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filterPriorityFaqs(priorityLevels.level1).length === 0 ? (
                              <div className="text-center py-2 text-xs text-gray-450">No matching questions</div>
                            ) : (
                              filterPriorityFaqs(priorityLevels.level1).map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handleSelectPriorityFaq(faq)}
                                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors flex justify-between items-start gap-3 group"
                                >
                                  <span className="text-xs text-gray-750 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium line-clamp-2">
                                    {faq.question}
                                  </span>
                                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 bg-red-50/70 dark:bg-red-950/30 px-2 py-0.5 rounded-full font-bold">
                                    <ThumbsUp className="h-2.5 w-2.5" /> {faq.helpfulCount || 0}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Level 2: Medium Priority */}
                        <div className="p-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <Sparkles className="h-3.5 w-3.5" /> Level 2: Medium Priority
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filterPriorityFaqs(priorityLevels.level2).length === 0 ? (
                              <div className="text-center py-2 text-xs text-gray-450">No matching questions</div>
                            ) : (
                              filterPriorityFaqs(priorityLevels.level2).map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handleSelectPriorityFaq(faq)}
                                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors flex justify-between items-start gap-3 group"
                                >
                                  <span className="text-xs text-gray-750 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium line-clamp-2">
                                    {faq.question}
                                  </span>
                                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 px-2 py-0.5 rounded-full font-bold">
                                    <ThumbsUp className="h-2.5 w-2.5" /> {faq.helpfulCount || 0}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Level 3: Low Priority */}
                        <div className="p-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <Award className="h-3.5 w-3.5" /> Level 3: Low Priority
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {filterPriorityFaqs(priorityLevels.level3).length === 0 ? (
                              <div className="text-center py-2 text-xs text-gray-450">No matching questions</div>
                            ) : (
                              filterPriorityFaqs(priorityLevels.level3).map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handleSelectPriorityFaq(faq)}
                                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors flex justify-between items-start gap-3 group"
                                >
                                  <span className="text-xs text-gray-755 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium line-clamp-2">
                                    {faq.question}
                                  </span>
                                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 px-2 py-0.5 rounded-full font-bold">
                                    <ThumbsUp className="h-2.5 w-2.5" /> {faq.helpfulCount || 0}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {isFaqsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:bg-red-950/20 dark:border-red-900/50">
                <p className="text-red-600 dark:text-red-400 font-medium">Failed to retrieve FAQs from database.</p>
                <button onClick={() => refetch()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all">
                  <RefreshCcw className="h-4 w-4" /> Try Again
                </button>
              </div>
            ) : faqs?.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-background">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No questions found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search keywords or browsing other categories.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs?.map((faq) => {
                  const isOpen = expandedFaqId === faq._id;
                  const isHighlighted = highlightedFaqId === faq._id;
                  return (
                    <motion.div
                      layout
                      id={`faq-card-${faq._id}`}
                      key={faq._id}
                      className={`overflow-hidden rounded-2xl border transition-all duration-500 ${
                        isHighlighted
                          ? 'ring-2 ring-primary-500 border-primary-500 shadow-xl bg-primary-50/10 dark:bg-primary-950/15 scale-[1.01]'
                          : isOpen
                            ? 'border-primary-500/50 bg-white dark:bg-background shadow-md shadow-primary-500/5'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaqExpand(faq._id)}
                        className="flex w-full items-center justify-between p-6 text-left"
                      >
                        <div className="pr-4">
                          <span 
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white mb-2"
                            style={{ backgroundColor: faq.category?.color || '#3B82F6' }}
                          >
                            {faq.category?.name}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {faq.question}
                          </h3>
                        </div>
                        <div className={`flex-shrink-0 ml-4 rounded-full p-1.5 transition-transform duration-200 ${
                          isOpen ? 'bg-primary-50 text-primary-600 rotate-180 dark:bg-primary-950/30 dark:text-primary-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        }`}>
                          <ChevronDown className="h-5 w-5" />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                          >
                            <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/10">
                              <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                {faq.answer}
                              </div>
                              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="flex gap-4">
                                  <span>⏱️ {faq.estimatedReadingTime} min read</span>
                                  <span>📊 {faq.helpfulCount} helpful votes</span>
                                </div>
                                <Link
                                  to={`/faqs/${faq._id}`}
                                  className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                  View article details & vote <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

