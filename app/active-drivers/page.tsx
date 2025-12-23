'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  UserIcon,
  TruckIcon,
  IdentificationIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  name: string;
  mcNo: string;
  phone: string;
  truckType: string;
  email?: string;
  active?: boolean;
}

export default function ActiveDriversPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [selectedDriverForEmail, setSelectedDriverForEmail] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
        // Initialize selected drivers with active ones
        const activeDriverIds = data.filter((d: Driver) => d.active === true).map((d: Driver) => d.id);
        setSelectedDrivers(new Set(activeDriverIds));
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadDrivers();
    }
  }, [status, router, loadDrivers]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show only active drivers when no search
      setFilteredDrivers(drivers.filter((d) => d.active === true));
      setSearchResults([]);
      setShowSearchDropdown(false);
    } else {
      const query = searchQuery.toLowerCase();
      const results = drivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(query) ||
          driver.mcNo.toLowerCase().includes(query) ||
          driver.truckType.toLowerCase().includes(query) ||
          driver.phone.toLowerCase().includes(query) ||
          (driver.email && driver.email.toLowerCase().includes(query))
      );
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
      // Keep showing active drivers below
      setFilteredDrivers(drivers.filter((d) => d.active === true));
    }
  }, [searchQuery, drivers]);

  const handleToggleDriver = async (driverId: string, currentActive: boolean) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch('/api/drivers/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, active: !currentActive }),
      });

      if (res.ok) {
        const newSelected = new Set(selectedDrivers);
        if (currentActive) {
          newSelected.delete(driverId);
        } else {
          newSelected.add(driverId);
        }
        setSelectedDrivers(newSelected);
        
        // Update local state
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, active: !currentActive } : d))
        );
      } else {
        alert('Failed to update driver status');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Failed to update driver status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectSearchResult = async (driver: Driver) => {
    // Automatically activate the driver when clicked from search
    if (!driver.active) {
      await handleToggleDriver(driver.id, false);
    }
    // Clear search and close dropdown
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleBulkToggle = async (active: boolean) => {
    if (filteredDrivers.length === 0) return;

    try {
      setUpdatingStatus(true);
      const driverIds = filteredDrivers.map((d) => d.id);
      const res = await fetch('/api/drivers/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverIds, active }),
      });

      if (res.ok) {
        const newSelected = new Set(selectedDrivers);
        filteredDrivers.forEach((driver) => {
          if (active) {
            newSelected.add(driver.id);
          } else {
            newSelected.delete(driver.id);
          }
        });
        setSelectedDrivers(newSelected);
        
        // Update local state
        setDrivers((prev) =>
          prev.map((d) => {
            if (driverIds.includes(d.id)) {
              return { ...d, active };
            }
            return d;
          })
        );
      } else {
        alert('Failed to update driver status');
      }
    } catch (error) {
      console.error('Error bulk updating driver status:', error);
      alert('Failed to update driver status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendEmail = async (driverId: string, email: string) => {
    if (!emailSubject.trim()) {
      alert('Please enter an email subject');
      return;
    }

    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setSendingEmail(true);
      const res = await fetch('/api/drivers/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          email: email.trim(),
          subject: emailSubject.trim(),
        }),
      });

      if (res.ok) {
        alert('Email sent successfully!');
        setEmailSubject('');
        setEmailAddress('');
        setSelectedDriverForEmail(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const openEmailModal = (driver: Driver) => {
    setSelectedDriverForEmail(driver.id);
    setEmailAddress(''); // Don't auto-fill, user will enter broker email
    setEmailSubject('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const activeCount = drivers.filter((d) => d.active === true).length;
  const filteredActiveCount = filteredDrivers.filter((d) => d.active === true).length;

  // Check if search query looks like a name or MC number
  const isSearchQueryValid = searchQuery.trim().length > 0;
  const looksLikeMC = /^\d+$/.test(searchQuery.trim());
  const looksLikeName = searchQuery.trim().split(/\s+/).length >= 1 && searchQuery.trim().length >= 2;
  const shouldShowAddSuggestion = isSearchQueryValid && filteredDrivers.length === 0 && (looksLikeMC || looksLikeName);

  const handleAddNewDriver = async () => {
    try {
      setLoading(true);
      // Create minimal driver with just name or MC number
      const driverData: any = {
        name: looksLikeName ? searchQuery.trim() : 'New Driver',
        mcNo: looksLikeMC ? searchQuery.trim() : '',
        phone: '',
        truckType: 'Box Truck', // Default value
        haulType: 'Short Haul', // Default value
        rpm: '0',
        zipCode: '',
        percentage: '0',
      };

      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });

      if (res.ok) {
        // Reload drivers to show the new one
        await loadDrivers();
        // Clear search to show the newly added driver
        setSearchQuery('');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add driver');
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Failed to add driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-emerald-600" />
                Active Drivers Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {searchQuery.trim() 
                  ? `Search results: ${filteredDrivers.length} driver(s) found`
                  : `${activeCount} active driver${activeCount !== 1 ? 's' : ''} out of ${drivers.length} total`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkToggle(true)}
                disabled={updatingStatus || filteredDrivers.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckIcon className="h-5 w-5" />
                Activate All (Filtered)
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                disabled={updatingStatus || filteredDrivers.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
                Deactivate All (Filtered)
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search drivers by name, MC number, truck type, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on dropdown items
                setTimeout(() => setShowSearchDropdown(false), 200);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => handleSelectSearchResult(driver)}
                    className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {driver.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <TruckIcon className="h-3 w-3" />
                          {driver.truckType}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <IdentificationIcon className="h-3 w-3" />
                          MC: {driver.mcNo}
                        </p>
                      </div>
                      {driver.active === true && (
                        <span className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drivers List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-emerald-600" />
              Active Drivers ({filteredDrivers.length})
              {searchQuery.trim() && (
                <span className="text-xs text-gray-500 ml-2">
                  ({searchResults.length} found in search)
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {filteredDrivers.length === 0 ? (
              searchQuery.trim() === '' ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No active drivers
                  </h3>
                  <p className="text-sm text-gray-500">
                    Search to find drivers and mark them as active
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  {shouldShowAddSuggestion ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <UserIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Driver not found
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        No driver found matching "{searchQuery}"
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Would you like to add this driver?</strong>
                        </p>
                        {looksLikeMC && (
                          <p className="text-xs text-gray-600">
                            MC Number: <span className="font-mono font-semibold">{searchQuery.trim()}</span>
                          </p>
                        )}
                        {looksLikeName && (
                          <p className="text-xs text-gray-600">
                            Name: <span className="font-semibold">{searchQuery.trim()}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleAddNewDriver}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <PlusIcon className="h-5 w-5" />
                        {loading ? 'Adding...' : 'Add New Driver'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        No drivers found matching your search
                      </p>
                    </div>
                  )}
                </div>
              )
            ) : (
              filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 transition-all duration-200 ${
                    driver.active === true ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={driver.active === true}
                          onChange={() => handleToggleDriver(driver.id, driver.active === true)}
                          disabled={updatingStatus}
                          className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {driver.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <TruckIcon className="h-3 w-3" />
                              {driver.truckType}
                            </p>
                          </div>
                        </div>
                        <div className="ml-12 mt-2 space-y-1">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <IdentificationIcon className="h-3 w-3" />
                            MC: {driver.mcNo}
                          </p>
                          {driver.email && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <EnvelopeIcon className="h-3 w-3" />
                              {driver.email}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{driver.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEmailModal(driver)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Send email"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                      {driver.active === true && (
                        <span className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {selectedDriverForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Email to Driver</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver MC Number
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {drivers.find((d) => d.id === selectedDriverForEmail)?.mcNo}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broker Email Address *
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="broker@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Load Details (Subject) *
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter load details for email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    const driver = drivers.find((d) => d.id === selectedDriverForEmail);
                    if (driver) {
                      handleSendEmail(driver.id, emailAddress);
                    }
                  }}
                  disabled={sendingEmail || !emailSubject.trim() || !emailAddress.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => {
                    setSelectedDriverForEmail(null);
                    setEmailSubject('');
                    setEmailAddress('');
                  }}
                  disabled={sendingEmail}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


