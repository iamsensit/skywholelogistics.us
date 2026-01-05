'use client';

import Image from 'next/image';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function ConstructionBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-2 sm:py-2.5 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative flex items-center justify-center gap-2 sm:gap-3 px-2">
        <div className="flex items-center gap-1.5 sm:gap-2 animate-pulse flex-shrink-0">
          <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
          <Image 
            src="/logo.png" 
            alt="SkyWhole Logistics" 
            width={20} 
            height={20} 
            className="h-4 w-4 sm:h-5 sm:w-5 object-contain"
          />
        </div>
        <div className="marquee-container whitespace-nowrap flex-1 min-w-0">
          <div className="marquee-content inline-flex items-center gap-3 sm:gap-4">
            <span className="font-semibold text-xs sm:text-sm md:text-base">🚧 Website Under Construction 🚧</span>
            <span className="text-emerald-100">•</span>
            <span className="font-semibold text-xs sm:text-sm md:text-base">We're working hard to improve your experience</span>
            <span className="text-emerald-100">•</span>
            <span className="font-semibold text-xs sm:text-sm md:text-base">🚧 Website Under Construction 🚧</span>
            <span className="text-emerald-100">•</span>
            <span className="font-semibold text-xs sm:text-sm md:text-base">We're working hard to improve your experience</span>
            <span className="text-emerald-100">•</span>
          </div>
        </div>
      </div>
    </div>
  );
}

