import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
  Map, Star, Award, Trophy, Sparkles, BookOpen, 
  Users, Zap, ArrowRight, TrendingUp, 
  ShieldCheck, Brain, Lightbulb, GraduationCap, Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pt-24 pb-28 dark:from-gray-950 dark:via-blue-950/30 dark:to-background">
        {/* Abstract Background Ambient Gradients (Zero JS / Zero Resource Load) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-emerald-500/20 dark:from-cyan-500/20 dark:via-blue-600/20 dark:to-emerald-500/20 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-1/3 right-5 sm:right-20 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-400/15 dark:via-cyan-500/15 dark:to-transparent blur-[110px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 text-sm font-semibold mb-6 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Crowd-Sourced Intelligence & Education Design</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white leading-tight"
          >
            {greeting}{isAuthenticated && user ? `, ${(user.fullName || user.name)?.split(' ')[0]}` : ''}!<br/>
            Welcome to <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent font-black">Vicharanashala</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal"
          >
            A transformative research lab engagement at IIT Ropar. Experience decentralized knowledge curation where every question answered accelerates peer learning and unlocks your internship progression.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a href="#essence">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 hover:from-blue-800 hover:via-indigo-700 hover:to-emerald-700 dark:from-cyan-500 dark:via-blue-600 dark:to-emerald-600 dark:hover:from-cyan-400 dark:hover:via-blue-500 dark:hover:to-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Explore Learning Engine
              </Button>
            </a>
            {!isAuthenticated ? (
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-blue-200 dark:border-cyan-800 hover:bg-blue-50/50 dark:hover:bg-cyan-950/50 transition-all">
                  Sign In to Portal
                </Button>
              </Link>
            ) : (
              <Link to={user?.role?.toLowerCase().includes('admin') ? "/admin/dashboard" : "/dashboard"}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-blue-200 dark:border-cyan-800 hover:bg-blue-50/50 dark:hover:bg-cyan-950/50 transition-all">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Abstract Knowledge Showcase Grid (Lightweight, pure CSS aesthetics) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left"
          >
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-blue-500/50 dark:border-gray-800/80 dark:bg-gray-900/60 dark:hover:border-cyan-400/50">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125" />
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/50 p-3 text-blue-700 dark:from-cyan-950/80 dark:to-blue-950/50 dark:text-cyan-300 ring-1 ring-blue-500/20 dark:ring-cyan-400/30 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crowd-Sourced FAQ Base</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                No more repetitive queries. Search instant community-verified answers on onboarding, stipends, Git workflows, and IIT Ropar research protocols.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-cyan-950/60 dark:text-cyan-300">#Rosetta</span>
                <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-blue-950/60 dark:text-blue-300">#NOC</span>
                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">#Stipend</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-emerald-500/50 dark:border-gray-800/80 dark:bg-gray-900/60 dark:hover:border-emerald-400/50">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125" />
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/50 p-3 text-emerald-700 dark:from-emerald-950/80 dark:to-teal-950/50 dark:text-emerald-300 ring-1 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gamified Dashboard</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Track your active learning journey in real-time. Earn Spurti Points for answering peer questions and monitor your milestone progression from Bronze to Platinum.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live Progress & Activity Sync
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-indigo-500/50 dark:border-gray-800/80 dark:bg-gray-900/60 dark:hover:border-blue-400/50">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-indigo-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125" />
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100/50 p-3 text-indigo-700 dark:from-blue-950/80 dark:to-indigo-950/50 dark:text-blue-300 ring-1 ring-indigo-500/20 dark:ring-blue-400/30 shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Peer & Mentor Synthesis</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Collaborative research thrives on collective discourse. Upvote helpful solutions, propose clarifications, and receive official mentor endorsements.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-blue-400">
                <ShieldCheck className="h-4 w-4" /> Mentor Verified Accuracy
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Abstract Essence of Learning & FAQ Section (Education Design Artistry) */}
      <section id="essence" className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-blue-50/20 dark:from-background dark:via-gray-900/50 dark:to-background border-y border-blue-100/60 dark:border-gray-800/80 overflow-hidden">
        <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 dark:bg-cyan-500/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-400/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 dark:bg-cyan-950/60 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800/50 text-xs font-bold uppercase tracking-wider mb-3">
              <Brain className="h-3.5 w-3.5" /> Abstract Education Architecture
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How Questions Catalyze Collective Growth
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
              In a research environment, questions are not hurdles—they are building blocks. Our platform transforms individual curiosity into enduring institutional wisdom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="group relative p-7 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-400/50 dark:hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/60 dark:from-amber-950/80 dark:to-yellow-950/50 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black text-blue-100 dark:text-gray-800 group-hover:text-blue-500/20 dark:group-hover:text-cyan-400/20 transition-colors">01</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The Query Spark</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                When an intern encounters a roadblock in their open-source contribution, they initiate a structured inquiry, tagging key research domains and tools.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative p-7 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-400/50 dark:hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-cyan-950/80 dark:to-blue-950/50 text-blue-600 dark:text-cyan-400 ring-1 ring-blue-500/30 dark:ring-cyan-400/30">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black text-indigo-100 dark:text-gray-800 group-hover:text-indigo-500/20 dark:group-hover:text-blue-400/20 transition-colors">02</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Crowd Curation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Peers and mentors contribute solutions, upvoting high-fidelity answers. This peer-review mechanism filters noise and validates actionable knowledge.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative p-7 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-950/80 dark:to-teal-950/50 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 dark:ring-emerald-400/30">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black text-emerald-100 dark:text-gray-800 group-hover:text-emerald-500/20 dark:group-hover:text-emerald-400/20 transition-colors">03</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wisdom Crystallization</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Resolved discussions are immortalized in the searchable FAQ repository, enriching the lab's learning progress and rewarding contributors with Spurti badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="timeline" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-background dark:via-gray-950 dark:to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Internship Roadmap & Gamified Progression</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">VINS is structured as four distinct milestone phases. Each phase unlocked reflects deeper research autonomy and contribution excellence.</p>
          </div>
          
          <div className="relative border-l-2 border-blue-200 dark:border-cyan-800/60 ml-3 md:mx-auto md:max-w-4xl space-y-12">
            {[
              { week: 'Week 1-2', icon: Map, title: 'Bronze (Phase 1)', badgeColor: 'from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500', bgGlow: 'from-amber-500/5 to-transparent', desc: 'A focused onboarding and training period tailored to your existing baseline. Familiarize yourself with lab protocols, Git conventions, and foundational tools.' },
              { week: 'Week 3-6', icon: Star, title: 'Silver (Phase 2)', badgeColor: 'from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500', bgGlow: 'from-blue-500/5 to-transparent', desc: 'The active core. You contribute directly to real open-source repositories under mentor guidance. Completing Bronze and Silver successfully fulfills your core internship mandate.' },
              { week: 'Week 7-8', icon: Award, title: 'Gold (Phase 3)', badgeColor: 'from-amber-500 via-yellow-500 to-emerald-600 dark:from-yellow-400 dark:via-amber-400 dark:to-emerald-400', bgGlow: 'from-amber-500/5 to-transparent', desc: 'A special recognition awarded during Silver if your contribution stands on its own as a robust, independent architectural feature or substantial research output.' },
              { week: 'Post-Internship', icon: Trophy, title: 'Platinum (Phase 4)', badgeColor: 'from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400', bgGlow: 'from-emerald-500/5 to-transparent', desc: 'An exclusive standing invitation to visit the Vicharanashala Lab at IIT Ropar in person—an enriching collaborative trip any time during the academic year.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-10 md:pl-16 group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[25px] top-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-100 shadow-md dark:border-background dark:bg-cyan-950 ring-2 ring-blue-500/20 dark:ring-cyan-400/30 group-hover:scale-110 transition-transform">
                  <feat.icon className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                </div>
                
                <div className={`rounded-2xl border border-gray-200/80 bg-gradient-to-br ${feat.bgGlow} bg-white dark:bg-gray-900/80 p-6 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-blue-500/40 dark:border-gray-800/80 dark:group-hover:border-cyan-400/40`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-cyan-950/80 dark:text-cyan-300 border border-blue-200/50 dark:border-cyan-800/50">
                      {feat.week}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${feat.badgeColor} shadow-sm`}>
                      <Award className="h-3.5 w-3.5" /> {feat.title.split(' ')[0]} Milestone
                    </span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 py-20 dark:from-blue-950 dark:via-indigo-950 dark:to-emerald-950 border-y border-blue-500/20 dark:border-cyan-500/20 shadow-2xl">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-6 backdrop-blur-md border border-white/20 shadow-sm">
            <Zap className="h-4 w-4 text-yellow-300 animate-pulse" /> Unlock Your Educational Journey
          </div>
          <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl tracking-tight">Ready to begin your journey?</h2>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto font-normal">Join the Vicharanashala Lab for Education Design today. Engage with mentors, ask insightful questions, and make your mark.</p>
          <div className="mt-8">
            <Link to={isAuthenticated ? (user?.role?.toLowerCase().includes('admin') ? "/admin/dashboard" : "/dashboard") : "/login"}>
              <Button size="lg" className="h-13 px-9 text-base font-bold bg-white text-blue-800 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 dark:text-blue-950">
                {isAuthenticated ? "Go to Dashboard" : "Access Platform"} <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

