'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Don't auto-redirect - allow users to view homepage even when logged in
  // They can manually navigate to dashboard if needed

  useEffect(() => {
    // Check if page is fully loaded
    const handleLoad = () => {
      // Wait a bit to ensure smooth transition
      setTimeout(() => setPageLoaded(true), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Also hide loader when video is loaded
  useEffect(() => {
    if (videoLoaded) {
      setTimeout(() => setPageLoaded(true), 300);
    }
  }, [videoLoaded]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 font-sans antialiased">
      {/* Page Loader */}
      {!pageLoaded && (
        <div className="page-loader">
          <div className="loader-spinner"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      )}
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "SkyWhole Logistics",
            "description": "Professional 24/7 dispatching services for owner-operators and small fleets. Top-tier rate negotiation, strategic load planning, and seamless communication.",
            "url": "https://skywholelogistics.us",
            "telephone": "+12014747860",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "serviceType": "Trucking Dispatch Services",
            "openingHours": "Mo-Su 00:00-23:59"
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        {/* Video Loader/Thumbnail */}
        {!videoLoaded && (
          <div className="absolute inset-0 z-5 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="loader-spinner mx-auto mb-4"></div>
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}
        <video 
          loop 
          muted 
          autoPlay 
          playsInline 
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute h-full w-full object-cover z-0 transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          poster="/a1.webp"
        >
          <source src="a.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-2xl animate-fade-in-down">
            Intelligent Dispatch for Modern Trucking.
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl max-w-xl text-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            We handle the backend complexities so you can focus on driving your business forward.
          </p>
          <Link 
            href="#contact" 
            className="mt-6 sm:mt-8 inline-block bg-emerald-500 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base hover:bg-emerald-600 transition-colors cursor-pointer animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            Partner With Us
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs sm:text-sm font-bold uppercase text-emerald-600 tracking-widest animate-fade-in-down">Our Services</h2>
          <p className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>A Partnership Built for Profitability</p>
          <div className="mt-8 sm:mt-12 md:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 text-left animate-stagger">
            <div className="p-6 sm:p-8 bg-white border border-gray-200 animate-fade-in-up">
              <h3 className="text-lg sm:text-xl font-semibold">24/7 Dispatching</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Constant, reliable support. We are your operational partners around the clock, ensuring seamless communication and load management.</p>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-gray-200 animate-fade-in-up">
              <h3 className="text-lg sm:text-xl font-semibold">Top-Tier Rate Negotiation</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">We don't just find loads; we secure the best possible rates. Our expertise directly translates to higher profits for your business.</p>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-gray-200 animate-fade-in-up md:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-semibold">Strategic Load Planning</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Minimize deadhead miles and maximize your time on the road. We plan efficient routes that keep you earning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="animate-slide-in-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Designed for Owner-Operators and Small Fleets</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600">We founded SkyWhole Logistics to be more than just a dispatch service; we are your strategic partner. Our success is measured by yours. We handle the paperwork, negotiations, and planning, freeing you to do what you do best—drive.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Efficiency</h4>
                <p className="text-gray-600 text-sm mt-1">Streamlined operations to reduce your downtime.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Profitability</h4>
                <p className="text-gray-600 text-sm mt-1">Higher paying loads mean a stronger bottom line.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Reliability</h4>
                <p className="text-gray-600 text-sm mt-1">A dedicated team you can count on, 24/7.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Support</h4>
                <p className="text-gray-600 text-sm mt-1">Direct access to your dispatcher when you need it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in-down">Ready to Optimize Your Operations?</h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>Send us a message, and a dispatch specialist will get back to you shortly.</p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('https://formspree.io/f/xldlyjyo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus(''), 4000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(''), 4000);
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 text-left grid gap-4">
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <input
        type="text"
        name="mc_number"
        placeholder="MC Number (Optional)"
        className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <textarea
        name="message"
        placeholder="How can we help?"
        rows={4}
        className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 font-semibold transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
      {status === 'success' && (
        <p className="mt-6 text-base font-medium text-green-600 opacity-100 transition-opacity duration-500">
          ✅ Message Sent!
        </p>
      )}
      {status === 'error' && (
        <p className="mt-6 text-base font-medium text-red-600 opacity-100 transition-opacity duration-500">
          ❌ Error. Please try again.
        </p>
      )}
    </form>
  );
}
