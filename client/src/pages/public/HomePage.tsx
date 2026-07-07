import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Map, Star, Award, Trophy, Medal } from 'lucide-react';
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
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 dark:bg-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white"
          >
            {greeting}{isAuthenticated && user ? `, ${(user.fullName || user.name)?.split(' ')[0]}` : ''}!<br/>
            Welcome to <span className="text-primary-600">Vicharanashala</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400"
          >
            A two-month, full-time engagement at the Vicharanashala Lab, a research lab at IIT Ropar. Work on a real open-source project under a mentor, after a short training phase tailored to where you already are.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex justify-center gap-4"
          >
            <a href="#timeline">
              <Button size="lg" className="h-12 px-8 text-base">View Roadmap</Button>
            </a>
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">Sign In</Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="timeline" className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Internship Roadmap & Journey</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">VINS is structured as four phases. Each one is marked by a badge — a small token of where you are in the journey.</p>
          </div>
          
          <div className="relative border-l-2 border-primary-200 dark:border-primary-800 ml-3 md:mx-auto md:max-w-4xl space-y-12">
            {[
              { 
                week: 'Week 1-2', 
                icon: Map, 
                title: 'Bronze (Phase 1)', 
                desc: 'A short training period at the start, planned around what you already know. Mentors may skip this if you are already comfortable with the basics.',
                colorClass: 'from-[#995D22] to-[#CD7F32]',
                textLightClass: 'text-[#CD7F32] bg-[#CD7F32]/10 dark:bg-[#CD7F32]/20 dark:text-[#E6B78E]',
                dotHoverBg: 'group-hover:bg-[#CD7F32] group-hover:border-[#CD7F32]'
              },
              { 
                week: 'Week 3-6', 
                icon: Star, 
                title: 'Silver (Phase 2)', 
                desc: 'The main work. You contribute to a real open-source project under a Vicharanashala mentor. Finishing Bronze and Silver completes your internship.',
                colorClass: 'from-[#8A8A8A] to-[#C0C0C0]',
                textLightClass: 'text-[#707070] bg-[#C0C0C0]/20 dark:bg-[#C0C0C0]/10 dark:text-[#C0C0C0]',
                dotHoverBg: 'group-hover:bg-[#C0C0C0] group-hover:border-[#C0C0C0]'
              },
              { 
                week: 'Week 7-8', 
                icon: Award, 
                title: 'Gold (Phase 3)', 
                desc: 'A recognition awarded during Silver if your contribution stands on its own as a meaningful feature, not just a small fix.',
                colorClass: 'from-[#C5A300] to-[#FFD700]',
                textLightClass: 'text-[#B59500] bg-[#FFD700]/10 dark:bg-[#FFD700]/20 dark:text-[#FFE34D]',
                dotHoverBg: 'group-hover:bg-[#FFD700] group-hover:border-[#FFD700]'
              },
              { 
                week: 'Post-Internship', 
                icon: Trophy, 
                title: 'Platinum (Phase 4)', 
                desc: 'A standing invitation to come back and visit the lab — a short trip — any time during the year after your internship ends.',
                colorClass: 'from-[#6C94B3] to-[#B9D3E0]',
                textLightClass: 'text-[#4A7290] bg-[#B9D3E0]/20 dark:bg-[#B9D3E0]/10 dark:text-[#93BCD8]',
                dotHoverBg: 'group-hover:bg-[#B9D3E0] group-hover:border-[#B9D3E0]'
              }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative pl-10 md:pl-16"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[25px] top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-gray-50 bg-primary-100 shadow-sm dark:border-gray-900 dark:bg-primary-900/50 transition-all duration-500 ${feat.dotHoverBg}`}>
                  <feat.icon className="h-5 w-5 text-primary-600 dark:text-primary-400 transition-all duration-500 group-hover:text-white group-hover:rotate-[360deg]" />
                </div>
                
                {/* Card Container */}
                <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-lg dark:border-gray-800 dark:bg-background overflow-hidden">
                  {/* Sweep Background Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feat.colorClass} transition-transform duration-500 ease-out origin-left scale-x-0 group-hover:scale-x-100`} />
                  
                  {/* Content (Z-indexed) */}
                  <div className="relative z-10">
                    <div className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${feat.textLightClass} group-hover:bg-white/20 group-hover:text-white`}>
                      {feat.week}
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-500 group-hover:text-white">
                        {feat.title}
                      </h3>
                      
                      {/* Sweep In Medal Icon */}
                      <Medal className="h-8 w-8 text-white opacity-0 scale-50 transition-all duration-500 ease-out transform group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-[360deg] shrink-0 ml-2" />
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed transition-colors duration-500 group-hover:text-white/90">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20 dark:bg-primary-900">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to begin your journey?</h2>
          <p className="mt-4 text-primary-100 text-lg">Join the Vicharanashala Lab for Education Design today.</p>
          <div className="mt-8">
            <Link to={isAuthenticated ? (user?.role?.toLowerCase().includes('admin') ? "/admin/dashboard" : "/dashboard") : "/login"}>
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                {isAuthenticated ? "Go to Dashboard" : "Access Platform"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
