'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  UserIcon, 
  TruckIcon, 
  PhoneIcon, 
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  name: string;
  mcNo: string;
  phone: string;
  truckType: string;
  dimensions?: {
    height?: string;
    long?: string;
    wide?: string;
    doorClearance?: string;
  };
  equipment: string[];
  haulType: string;
  setupCompanies: string[];
  specialEquipment: string[];
  rpm: string;
  zipCode: string;
  percentage: string;
  cdlNumber?: string;
  cdlExpiration?: string;
  cdlState?: string;
  licenseNumber?: string;
  licenseExpiration?: string;
  licenseState?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: string;
  insuranceCoverage?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  yearsOfExperience?: string;
}

export default function DriversPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
        setSelectedDriver((prev) => {
          if (data.length > 0 && !prev) {
            return data[0];
          }
          return prev;
        });
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

  const handleEdit = (driver: Driver) => {
    router.push(`/driver-form?id=${driver.id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      try {
        const res = await fetch(`/api/drivers?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await loadDrivers();
          if (selectedDriver?.id === id) {
            setSelectedDriver(null);
          }
        } else {
          alert('Failed to delete driver. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Failed to delete driver. Please try again.');
      }
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.mcNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.truckType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-emerald-600" />
                Driver Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">Manage your driver fleet and track their information</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/load-form"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <PlusIcon className="h-5 w-5" />
                Add Load
              </Link>
              <Link
                href="/driver-form"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <PlusIcon className="h-5 w-5" />
                Add Driver
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          {drivers.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search drivers by name, MC number, or truck type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {drivers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-100 p-4">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers yet</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding your first driver to the fleet</p>
            <Link
              href="/driver-form"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Driver
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Driver List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-emerald-600" />
                    All Drivers ({filteredDrivers.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {filteredDrivers.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500">No drivers found matching your search</p>
                    </div>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          selectedDriver?.id === driver.id
                            ? 'bg-emerald-50 border-l-4 border-l-emerald-600'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <div className="flex items-start justify-between">
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
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(driver);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Edit driver"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(driver.id);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete driver"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Driver Details */}
            <div className="lg:col-span-2">
              {selectedDriver ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <UserIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {selectedDriver.name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <IdentificationIcon className="h-4 w-4" />
                            MC Number: {selectedDriver.mcNo}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(selectedDriver)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-emerald-600" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="text-sm font-medium text-gray-900">{selectedDriver.phone}</p>
                            </div>
                          </div>
                          {selectedDriver.email && (
                            <div className="flex items-start gap-3">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.email}</p>
                              </div>
                            </div>
                          )}
                          {(selectedDriver.address || selectedDriver.city || selectedDriver.state) && (
                            <div className="flex items-start gap-3">
                              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {[selectedDriver.address, selectedDriver.city, selectedDriver.state, selectedDriver.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <TruckIcon className="h-4 w-4 text-emerald-600" />
                          Vehicle Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Truck Type</p>
                              <p className="text-sm font-medium text-gray-900">{selectedDriver.truckType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Haul Type</p>
                              <p className="text-sm font-medium text-gray-900">{selectedDriver.haulType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Rate Per Mile</p>
                              <p className="text-sm font-medium text-gray-900">${selectedDriver.rpm}</p>
                            </div>
                          </div>
                          {selectedDriver.zipCode && (
                            <div className="flex items-start gap-3">
                              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Service Area</p>
                                <p className="text-sm font-medium text-gray-900">Zip: {selectedDriver.zipCode}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Credentials */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                          Credentials & Insurance
                        </h3>
                        <div className="space-y-3">
                          {selectedDriver.cdlNumber ? (
                            <div className="flex items-start gap-3">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">CDL Number</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.cdlNumber}</p>
                                {selectedDriver.cdlState && (
                                  <p className="text-xs text-gray-500">State: {selectedDriver.cdlState}</p>
                                )}
                                {selectedDriver.cdlExpiration && (
                                  <p className="text-xs text-gray-500">Expires: {new Date(selectedDriver.cdlExpiration).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">CDL Number</p>
                                <p className="text-sm font-medium text-gray-400">Not provided</p>
                              </div>
                            </div>
                          )}
                          {selectedDriver.licenseNumber ? (
                            <div className="flex items-start gap-3">
                              <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">License Number</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.licenseNumber}</p>
                                {selectedDriver.licenseState && (
                                  <p className="text-xs text-gray-500">State: {selectedDriver.licenseState}</p>
                                )}
                                {selectedDriver.licenseExpiration && (
                                  <p className="text-xs text-gray-500">Expires: {new Date(selectedDriver.licenseExpiration).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">License Number</p>
                                <p className="text-sm font-medium text-gray-400">Not provided</p>
                              </div>
                            </div>
                          )}
                          {selectedDriver.insuranceProvider ? (
                            <div className="flex items-start gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Insurance Provider</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.insuranceProvider}</p>
                                {selectedDriver.insurancePolicyNumber && (
                                  <p className="text-xs text-gray-500">Policy: {selectedDriver.insurancePolicyNumber}</p>
                                )}
                                {selectedDriver.insuranceExpiration && (
                                  <p className="text-xs text-gray-500">Expires: {new Date(selectedDriver.insuranceExpiration).toLocaleDateString()}</p>
                                )}
                                {selectedDriver.insuranceCoverage && (
                                  <p className="text-xs text-gray-500">Coverage: {selectedDriver.insuranceCoverage}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Insurance Provider</p>
                                <p className="text-sm font-medium text-gray-400">Not provided</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-emerald-600" />
                          Additional Information
                        </h3>
                        <div className="space-y-3">
                          {selectedDriver.percentage && (
                            <div className="flex items-start gap-3">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Commission Percentage</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.percentage}%</p>
                              </div>
                            </div>
                          )}
                          {selectedDriver.yearsOfExperience && (
                            <div className="flex items-start gap-3">
                              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Years of Experience</p>
                                <p className="text-sm font-medium text-gray-900">{selectedDriver.yearsOfExperience}</p>
                              </div>
                            </div>
                          )}
                          {selectedDriver.equipment && selectedDriver.equipment.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Equipment</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedDriver.equipment.map((eq, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedDriver.setupCompanies && selectedDriver.setupCompanies.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Setup Companies</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedDriver.setupCompanies.map((company, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {company}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedDriver.specialEquipment && selectedDriver.specialEquipment.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Special Equipment</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedDriver.specialEquipment.map((equip, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {equip}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-gray-100 p-4">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a driver</h3>
                  <p className="text-sm text-gray-500">Choose a driver from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

