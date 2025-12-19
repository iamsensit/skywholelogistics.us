'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Don't auto-redirect - allow users to view homepage even when logged in
  // They can manually navigate to dashboard if needed

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 font-sans antialiased">
      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <video 
          loop 
          muted 
          autoPlay 
          playsInline 
          className="absolute h-full w-full object-cover z-0"
        >
          <source src="a.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-left text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold max-w-2xl">
            Intelligent Dispatch for Modern Trucking.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl text-gray-200">
            We handle the backend complexities so you can focus on driving your business forward.
          </p>
          <Link 
            href="#contact" 
            className="mt-8 inline-block bg-emerald-500 text-white font-semibold px-8 py-3 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            Partner With Us
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-sm font-bold uppercase text-emerald-600 tracking-widest">Our Services</h2>
          <p className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">A Partnership Built for Profitability</p>
          <div className="mt-16 grid gap-8 md:grid-cols-3 text-left">
            <div className="p-8 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold">24/7 Dispatching</h3>
              <p className="mt-2 text-gray-600">Constant, reliable support. We are your operational partners around the clock, ensuring seamless communication and load management.</p>
            </div>
            <div className="p-8 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold">Top-Tier Rate Negotiation</h3>
              <p className="mt-2 text-gray-600">We don't just find loads; we secure the best possible rates. Our expertise directly translates to higher profits for your business.</p>
            </div>
            <div className="p-8 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold">Strategic Load Planning</h3>
              <p className="mt-2 text-gray-600">Minimize deadhead miles and maximize your time on the road. We plan efficient routes that keep you earning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Designed for Owner-Operators and Small Fleets</h2>
            <p className="mt-4 text-lg text-gray-600">We founded SkyWhole Logistics to be more than just a dispatch service; we are your strategic partner. Our success is measured by yours. We handle the paperwork, negotiations, and planning, freeing you to do what you do best—drive.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
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
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to Optimize Your Operations?</h2>
          <p className="mt-4 text-lg text-gray-600">Send us a message, and a dispatch specialist will get back to you shortly.</p>
          <ContactForm />
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
        className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <input
        type="text"
        name="mc_number"
        placeholder="MC Number (Optional)"
        className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <textarea
        name="message"
        placeholder="How can we help?"
        rows={4}
        className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-md font-semibold transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
