'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <Image src="/logo.png" alt="SkyWhole Logistics" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className="text-lg sm:text-xl font-semibold text-white tracking-tight">SkyWhole Logistics</span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 max-w-md">
              Professional 24/7 dispatching services for owner-operators and small fleets. 
              We handle the backend complexities so you can focus on driving your business forward.
            </p>
            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <a 
                href="tel:+12014747860" 
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group"
              >
                <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:animate-pulse" />
                <span className="break-all">(201) 474-7860</span>
              </a>
              <a 
                href="mailto:booking@skywholelogistics.us" 
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <EnvelopeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="break-all text-xs sm:text-sm">booking@skywholelogistics.us</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#services" className="hover:text-emerald-400 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">24/7 Dispatching</li>
              <li className="text-gray-400">Rate Negotiation</li>
              <li className="text-gray-400">Load Planning</li>
              <li className="text-gray-400">Fleet Management</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {currentYear} SkyWhole Logistics. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-gray-500">
            <Link href="/#contact" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#contact" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

