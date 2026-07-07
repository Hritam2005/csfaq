import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background overflow-hidden relative">
      
      {/* Left side: branding/imagery */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-12 lg:flex border-r border-slate-900 relative overflow-hidden">
        {/* Decorative Grid & Glow Overlays */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-500/30 shadow-md"
          >
            <span className="text-2xl font-black text-cyan-400">V</span>
          </motion.div>
          <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            Vicharanashala
          </span>
        </div>
        
        {/* Central Visualization: Floating RAG Card representation */}
        <div className="relative flex items-center justify-center my-8 z-10">
          <motion.div
            animate={{
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Yaksha AI Query Engine</span>
              </div>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-cyan-400 font-bold">Q</span>
                </div>
                <div className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white/90">
                  How do I submit my VINS NOC?
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-950 border border-emerald-800/80 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold">A</span>
                </div>
                <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 text-xs text-emerald-300 flex-1 leading-relaxed">
                  Upload physically signed and stamped PDF via dashboard under Offer Letter tab...
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] text-white/40">
              <span>Confidence Match: 98%</span>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>Encrypted Session</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Footer Brand Info */}
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Unify your collective<br/>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">intelligence securely.</span>
          </h1>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-md">
            Log in to VINS to access your organization's private documents, crowdsourced FAQs, and autonomous AI systems.
          </p>
          <div className="mt-8 text-xs text-slate-600 border-t border-slate-900 pt-4">
            &copy; {new Date().getFullYear()} Vicharanashala Lab. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side: Auth Form Outlet */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32 relative z-10 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/30 dark:to-background">
        {/* Ambient Glows for Right side form */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-[90px] rounded-full pointer-events-none -z-10" />
        
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
