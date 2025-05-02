"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShallow } from 'zustand/react/shallow';
// import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const { user, isLoading } = useAuthStore(useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
  })));
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
    setIsVisible(true);
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-md transition-transform duration-300 group-hover:scale-110">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white transform transition-transform duration-300 ease-in-out group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <h1 className="text-xl font-bold text-gray-900 dark:text-white">Omni<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent transition-all duration-300 ease-in-out">lytics</span></h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="#features" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">Features</Link>
              <Link href="#pricing" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">Pricing</Link>
              <Link href="#about" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">About</Link>
            </nav>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                 <Link href="/auth" className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-800 transition-colors duration-200">Log in</Link>
                 <Link href="/auth" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className={`flex flex-col justify-center rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Unify Your Social Media Analytics</h2>
             <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">Track, analyze, and optimize your social media performance across Instagram, YouTube, LinkedIn, and Twitter/X with real-time insights and AI-powered recommendations.</p>
             <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
               <Link href="/auth" className="rounded-md bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg">Get Started</Link>
               <Link href="#features" className="rounded-md border border-gray-300 bg-white px-6 py-3 text-center text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors duration-200">Learn more</Link>
            </div>
          </div>
          <div className={`relative rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800 transition-all duration-1000 ease-out transform delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                   <svg className="mb-4 h-16 w-16 text-blue-500 dark:text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                   <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Preview</h3>
                   <p className="mt-2 text-gray-600 dark:text-gray-300">Visualize your social performance across all platforms in one place.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div id="features" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-16 dark:from-indigo-800 dark:to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white opacity-30 animate-blob"></div>
          <div className="absolute left-1/3 top-1/4 h-60 w-60 rounded-full bg-indigo-300 opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 h-32 w-32 rounded-full bg-blue-300 opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="overflow-hidden rounded-2xl bg-white/10 p-8 backdrop-blur-sm shadow-xl transform transition-all duration-700 hover:scale-[1.01]">
             <div className="text-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Take Control of Your Social Media Presence</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">Omnilytics helps you manage content, track engagement, and grow your audience with AI-powered insights.</p>
                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                   <div className="rounded-xl bg-white/20 p-6 text-left backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-white/25 hover:shadow-lg">
                     <div className="mb-4 inline-flex rounded-full bg-blue-500/20 p-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                     </div>
                     <h3 className="text-xl font-bold text-white">Unified Analytics</h3>
                     <p className="mt-2 text-blue-100">Track performance metrics across all platforms in one dashboard.</p>
                   </div>
                   <div className="rounded-xl bg-white/20 p-6 text-left backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-white/25 hover:shadow-lg">
                     <div className="mb-4 inline-flex rounded-full bg-blue-500/20 p-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <h3 className="text-xl font-bold text-white">AI Insights</h3>
                     <p className="mt-2 text-blue-100">Get content suggestions and optimization tips based on your audience.</p>
                   </div>
                   <div className="rounded-xl bg-white/20 p-6 text-left backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-white/25 hover:shadow-lg">
                     <div className="mb-4 inline-flex rounded-full bg-blue-500/20 p-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                     <h3 className="text-xl font-bold text-white">Content Planning</h3>
                     <p className="mt-2 text-blue-100">Organize and visualize your upcoming social media content.</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      <div id="pricing" className="bg-white dark:bg-gray-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-base font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Pricing</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">Choose Your Plan</p>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">Start with our free tier to analyze YouTube and Instagram, or upgrade for full platform coverage.</p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
             <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
               <div className="p-8">
                 <h3 className="text-lg font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Free Tier</h3>
                 <p className="mt-4 flex items-baseline"><span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">$0</span><span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-300">/mo</span></p>
                 <p className="mt-6 text-gray-500 dark:text-gray-300">Perfect for beginners, content creators, and small businesses focusing on free platforms.</p>
                 <ul className="mt-8 space-y-4">
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">YouTube Analytics</span> - Full access</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Instagram Insights</span> - Complete data</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Basic AI Assistance</span> - Tips</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">Up to 2 connected accounts</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">7-day data history</p></li>
                   <li className="flex items-start opacity-50"><div className="flex-shrink-0"><svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">Twitter/X integration (Premium)</p></li>
                   <li className="flex items-start opacity-50"><div className="flex-shrink-0"><svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">LinkedIn integration (Premium)</p></li>
                 </ul>
               </div>
               <div className="flex flex-1 flex-col justify-end rounded-b-2xl bg-gray-50 p-8 dark:bg-gray-700">
                 <Link href="/auth" className="block w-full rounded-md bg-blue-600 px-6 py-3 text-center text-base font-medium text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Get Started Free</Link>
               </div>
             </div>
             <div className="relative flex flex-col rounded-2xl border-2 border-blue-600 bg-white shadow-xl dark:border-indigo-500 dark:bg-gray-800 transform transition-all duration-500 hover:scale-105">
               <div className="absolute -top-5 right-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">Most Popular</div>
               <div className="p-8">
                 <h3 className="text-lg font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Premium</h3>
                 <p className="mt-4 flex items-baseline"><span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">$20</span><span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-300">/mo</span></p>
                 <p className="mt-6 text-gray-500 dark:text-gray-300">Ideal for professional marketers, agencies, and businesses managing multiple platforms.</p>
                 <ul className="mt-8 space-y-4">
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">All Free Tier Features</span></p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Twitter/X Integration</span> - Full access</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">LinkedIn Integration</span> - Full access</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">Up to 20 connected accounts</p></li>                  
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Advanced AI Assistance</span></p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">Unlimited data history</p></li>
                   <li className="flex items-start"><div className="flex-shrink-0"><svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><p className="ml-3 text-base text-gray-700 dark:text-gray-300">Priority support</p></li>
                 </ul>
               </div>
               <div className="flex flex-1 flex-col justify-end rounded-b-2xl bg-gray-50 p-8 dark:bg-gray-700">
                 <Link href="/auth" className="block w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-center text-base font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-700 dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700 transform transition-all duration-200">Try Premium Free</Link>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div id="about" className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-base font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">About Me</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Why Choose Omnilytics?</p>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">Built by a developer who understands the power of simplicity, AI, and clean design in solving modern social media challenges.</p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">🧠 My Story</h3>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">In 2025, I set out to solve a problem I kept seeing firsthand: social media tools were either too basic to be useful, or too expensive for small teams and creators.</p>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">As a developer passionate about design, UX, and backend architecture, I created Omnilytics, a platform that gives powerful analytics and AI-backed insights without the enterprise fluff. This isn&apos;t built by a VC-funded team. It&apos;s crafted with intention, by someone who understands real workflows.</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">🛠 My Approach</h3>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">Omnilytics is built around three principles: clarity, speed, and value.</p>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">Every line of code is written to give users a better understanding of their performance, not just numbers. I combined real-time data with OpenAI&apos;s intelligence layer to provide actionable, context-aware insights that actually help you grow.</p>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">It&apos;s not about more — it&apos;s about what matters.</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">💻 My Stack</h3>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">Omnilytics is built using:</p>
              <ul className="mt-4 space-y-2 text-base text-gray-600 dark:text-gray-300">
                <li>• Next.js 15 + Tailwind CSS</li>
                <li>• Firebase (Auth, Firestore, Functions)</li>
                <li>• Zustand for State Management</li>
                <li>• OpenAI for AI Features</li>
                <li>• Recharts for Visualizations</li>
              </ul>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">Crafted with care, focusing on performance and user experience.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"><span className="sr-only">GitHub</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Omnilytics. All rights reserved.</p>
          </div>
        </div>
      </footer>

       <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes blob { /* ... blob keyframes ... */ }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
