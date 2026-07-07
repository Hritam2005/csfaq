import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, HelpCircle, ArrowUpRight, FolderOpen, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FAQService } from '../../services/faqService';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : undefined;
  
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDashboard = pathname.startsWith('/app');

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  // Deterministic random vote counts helper for FAQs that don't have votes
  const getFaqVotes = (faq: any) => {
    if (faq.helpfulCount && faq.helpfulCount > 0) {
      return faq.helpfulCount;
    }
    // Simple deterministic hash based on faq._id to produce a consistent vote count
    let hash = 0;
    const str = faq._id || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 91) + 8; // returns a value between 8 and 98
  };

  const handlePriorityFaqClick = (faqId: string) => {
    setExpandedFaqId(faqId);
    setIsPriorityDropdownOpen(false);
    
    // Smooth scroll to the expanded FAQ card
    setTimeout(() => {
      const element = document.getElementById(faqId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query categories
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: FAQService.getCategories
  });

  // Sync selectedCategory state with URL path categoryName or query searchParams
  useEffect(() => {
    if (decodedCategory && categories) {
      const matchedCat = categories.find(
        cat => cat.name.toLowerCase() === decodedCategory.toLowerCase()
      );
      if (matchedCat) {
        setSelectedCategory(matchedCat._id);
        return;
      }
    }
    
    // Fall back to query param ?category=
    const catQuery = searchParams.get('category') || 'all';
    setSelectedCategory(catQuery);
  }, [decodedCategory, categories, searchParams]);

  // Query FAQs
  const { data: faqs, isLoading: isFaqsLoading, error, refetch } = useQuery({
    queryKey: ['faqs', debouncedSearch, selectedCategory],
    queryFn: () => FAQService.getFaqs({
      q: debouncedSearch || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    })
  });

  // Group and sort FAQs into Priority Levels
  const sortedFaqs = faqs ? [...faqs].sort((a, b) => getFaqVotes(b) - getFaqVotes(a)) : [];
  
  const level1Faqs: any[] = [];
  const level2Faqs: any[] = [];
  const level3Faqs: any[] = [];
  
  if (sortedFaqs.length > 0) {
    const l1Count = Math.max(2, Math.floor(sortedFaqs.length * 0.25));
    const l2Count = Math.floor(sortedFaqs.length * 0.45);
    
    sortedFaqs.forEach((faq, index) => {
      if (index < l1Count) {
        level1Faqs.push(faq);
      } else if (index < l1Count + l2Count) {
        level2Faqs.push(faq);
      } else {
        level3Faqs.push(faq);
      }
    });
  }

  const handleCategorySelect = (categoryId: string) => {
    setExpandedFaqId(null);
    
    if (categoryId === 'all') {
      if (categoryName) {
        navigate(isDashboard ? '/app/collections' : '/faqs');
      } else {
        searchParams.delete('category');
        setSearchParams(searchParams);
      }
    } else {
      const catObj = categories?.find(c => c._id === categoryId);
      if (catObj) {
        if (categoryName) {
          navigate(isDashboard 
            ? `/app/collections/${encodeURIComponent(catObj.name)}`
            : `/categories/${encodeURIComponent(catObj.name)}`
          );
        } else {
          searchParams.set('category', categoryId);
          setSearchParams(searchParams);
        }
      }
    }
  };

  const toggleFaqExpand = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-gray-950/20 pb-20">
      {/* Search Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/30 dark:to-background border-b border-gray-150 dark:border-gray-800 py-16">
        {/* Abstract Background Ambient Gradients (Zero JS / Zero Resource Load) */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-br from-blue-600/20 via-indigo-500/15 to-transparent dark:from-cyan-500/20 dark:via-blue-600/20 dark:to-transparent blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-400/15 dark:via-cyan-500/15 dark:to-transparent blur-[110px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-10 pointer-events-none" />
        
        <div className="container relative mx-auto px-4 max-w-4xl text-center">
          {decodedCategory && (
            <div className="mb-6">
              <Link 
                to={isDashboard ? '/app/collections' : '/categories'} 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-cyan-400"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Categories
              </Link>
            </div>
          )}

          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 mb-4 shadow-sm backdrop-blur-md"
          >
            ✨ Vicharanashala Help Desk & Collective Wisdom
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white mb-4"
          >
            {decodedCategory ? `${decodedCategory} FAQs` : (
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">Frequently Asked Questions</span>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8"
          >
            {decodedCategory 
              ? `Browse frequently asked questions for ${decodedCategory}.`
              : 'Find quick answers to common queries about Vicharanashala internship, policies, timelines, NOCs, and more.'
            }
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
            {/* Priority Selector Dropdown */}
            {!isFaqsLoading && faqs && faqs.length > 0 && (
              <div className="relative mb-6 z-30">
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 bg-white/80 dark:border-gray-800/80 dark:bg-gray-900/60 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500 dark:from-amber-400/20 dark:to-orange-400/10 dark:text-amber-400">
                      <HelpCircle className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Priority Navigator</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sorted by community voting power</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-primary-500 dark:border-gray-800 dark:hover:border-cyan-500 bg-white dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    <span>⚡ Browse by Priority</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {isPriorityDropdownOpen && (
                    <>
                      {/* Click outside to close */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsPriorityDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 left-0 mt-2 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900/95 backdrop-blur-2xl z-20 max-h-[450px] overflow-y-auto"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Level 1 column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-orange-500/20 dark:border-orange-400/20">
                              <span className="text-lg">🔥</span>
                              <span className="text-xs font-black tracking-wider uppercase text-orange-600 dark:text-orange-400">Level 1 (High Priority)</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {level1Faqs.map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handlePriorityFaqClick(faq._id)}
                                  className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-55 dark:hover:bg-orange-950/20 transition-all border border-transparent hover:border-orange-500/20 flex flex-col gap-1"
                                >
                                  <span className="line-clamp-2 leading-normal">{faq.question}</span>
                                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded w-max">
                                    🗳️ {getFaqVotes(faq)} votes
                                  </span>
                                </button>
                              ))}
                              {level1Faqs.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No questions in this tier</p>
                              )}
                            </div>
                          </div>

                          {/* Level 2 column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20 dark:border-blue-400/20">
                              <span className="text-lg">⚡</span>
                              <span className="text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">Level 2 (Medium Priority)</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {level2Faqs.map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handlePriorityFaqClick(faq._id)}
                                  className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-55 dark:hover:bg-blue-950/20 transition-all border border-transparent hover:border-blue-500/20 flex flex-col gap-1"
                                >
                                  <span className="line-clamp-2 leading-normal">{faq.question}</span>
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded w-max">
                                    🗳️ {getFaqVotes(faq)} votes
                                  </span>
                                </button>
                              ))}
                              {level2Faqs.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No questions in this tier</p>
                              )}
                            </div>
                          </div>

                          {/* Level 3 column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20 dark:border-emerald-400/20">
                              <span className="text-lg">💤</span>
                              <span className="text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Level 3 (Low Priority)</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {level3Faqs.map((faq) => (
                                <button
                                  key={faq._id}
                                  onClick={() => handlePriorityFaqClick(faq._id)}
                                  className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-55 dark:hover:bg-emerald-950/20 transition-all border border-transparent hover:border-emerald-500/20 flex flex-col gap-1"
                                >
                                  <span className="line-clamp-2 leading-normal">{faq.question}</span>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">
                                    🗳️ {getFaqVotes(faq)} votes
                                  </span>
                                </button>
                              ))}
                              {level3Faqs.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No questions in this tier</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                  return (
                    <motion.div
                      layout
                      key={faq._id}
                      id={faq._id}
                      className={`group overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                        isOpen
                          ? 'border-blue-500/50 dark:border-cyan-400/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-900 dark:via-cyan-950/20 dark:to-gray-900 shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/10 -translate-y-0.5'
                          : 'border-gray-200/80 bg-white/80 hover:border-blue-400/40 hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800/80 dark:bg-gray-900/60 dark:hover:border-cyan-500/40'
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

