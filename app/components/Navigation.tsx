'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  TruckIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderShadow(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const isAuthenticated = status === 'authenticated';
  const isDashboardPage = pathname?.startsWith('/drivers') || 
                         pathname?.startsWith('/driver-form') ||
                         pathname?.startsWith('/loads') ||
                         pathname?.startsWith('/load-form') ||
                         pathname?.startsWith('/active-drivers');

  // Show public navigation if not authenticated OR not on dashboard pages
  if (!isAuthenticated || !isDashboardPage) {
    return (
      <header 
        className={`bg-white sticky top-0 left-0 w-full z-40 transition-shadow duration-300 border-b border-gray-100 ${
          headerShadow ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900 cursor-pointer flex items-center gap-2.5">
              <TruckIcon className="h-6 w-6 text-emerald-600" />
              <span className="tracking-tight">SkyWhole Logistics</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-6 ml-4 pl-6 border-l border-gray-200">
                <a 
                  href="tel:+12013660319" 
                  className="text-sm text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span className="font-medium">+1 (201) 366-0319</span>
                </a>
                {isAuthenticated && (
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/drivers"
                      className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </nav>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
           <div className="px-4 py-4 space-y-3">
               {isAuthenticated ? (
                 <>
                   <Link
                     href="/drivers"
                     className="block text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
                     onClick={() => setMobileMenuOpen(false)}
                   >
                     Dashboard
                   </Link>
                   <button
                     onClick={() => {
                       setMobileMenuOpen(false);
                       signOut({ callbackUrl: '/' });
                     }}
                     className="block text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer w-full text-left"
                   >
                     Sign Out
                   </button>
                 </>
               ) : null}
             </div>
          </div>
        )}
      </header>
    );
  }

  // Dashboard navigation
  return (
    <header 
      className={`bg-white sticky top-0 left-0 w-full z-40 transition-shadow duration-300 border-b border-gray-100 ${
        headerShadow ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-semibold text-gray-900 cursor-pointer flex items-center gap-2.5">
            <TruckIcon className="h-6 w-6 text-emerald-600" />
            <span className="tracking-tight">SkyWhole Logistics</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {/* Dropdown Menu */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <span>Menu</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <Link
                      href="/drivers"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        pathname === '/drivers' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                      }`}
                    >
                      <UserIcon className="h-4 w-4" />
                      Drivers
                    </Link>
                    <Link
                      href="/loads"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        pathname === '/loads' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                      }`}
                    >
                      <TruckIcon className="h-4 w-4" />
                      Loads
                    </Link>
                    <Link
                      href="/active-drivers"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        pathname === '/active-drivers' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                      }`}
                    >
                      <UserIcon className="h-4 w-4" />
                      Active Drivers
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/driver-form"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        pathname?.startsWith('/driver-form') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                      }`}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Driver
                    </Link>
                    <Link
                      href="/load-form"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        pathname?.startsWith('/load-form') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                      }`}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Load
                    </Link>
                  </div>
              )}
            </div>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserCircleIcon className="h-5 w-5" />
                <span>{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/drivers"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              Drivers
            </Link>
            <Link
              href="/loads"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TruckIcon className="h-4 w-4" />
              Loads
            </Link>
            <Link
              href="/active-drivers"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              Active Drivers
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              href="/driver-form"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusIcon className="h-4 w-4" />
              Add Driver
            </Link>
            <Link
              href="/load-form"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusIcon className="h-4 w-4" />
              Add Load
            </Link>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <UserCircleIcon className="h-5 w-5" />
                <span>{session?.user?.name}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

