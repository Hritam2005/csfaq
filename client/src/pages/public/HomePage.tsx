import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Map, Star, Award, Trophy } from 'lucide-react';
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
              { week: 'Week 1-2', icon: Map, title: 'Bronze (Phase 1)', desc: 'A short training period at the start, planned around what you already know. Mentors may skip this if you are already comfortable with the basics.' },
              { week: 'Week 3-6', icon: Star, title: 'Silver (Phase 2)', desc: 'The main work. You contribute to a real open-source project under a Vicharanashala mentor. Finishing Bronze and Silver completes your internship.' },
              { week: 'Week 7-8', icon: Award, title: 'Gold (Phase 3)', desc: 'A recognition awarded during Silver if your contribution stands on its own as a meaningful feature, not just a small fix.' },
              { week: 'Post-Internship', icon: Trophy, title: 'Platinum (Phase 4)', desc: 'A standing invitation to come back and visit the lab — a short trip — any time during the year after your internship ends.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-10 md:pl-16"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[25px] top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-gray-50 bg-primary-100 shadow-sm dark:border-gray-900 dark:bg-primary-900/50">
                  <feat.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-background">
                  <div className="mb-2 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {feat.week}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{feat.desc}</p>
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
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50 dark:text-white">
                {isAuthenticated ? "Go to Dashboard" : "Access Platform"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
