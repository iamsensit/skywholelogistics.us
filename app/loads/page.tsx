'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  TruckIcon, 
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface Load {
  id: string;
  fromLocation: string;
  toLocation: string;
  dimension: string;
  weight: string;
  rate: string;
  pickupTime: string;
  dropOffTime: string;
}

export default function LoadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadLoads();
    }
  }, [status, router]);

  const loadLoads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/loads');
      if (res.ok) {
        const data = await res.json();
        setLoads(data);
        if (data.length > 0 && !selectedLoad) {
          setSelectedLoad(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (load: Load) => {
    router.push(`/load-form?id=${load.id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this load?')) {
      try {
        const res = await fetch(`/api/loads?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await loadLoads();
          if (selectedLoad?.id === id) {
            setSelectedLoad(null);
          }
        } else {
          alert('Failed to delete load. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting load:', error);
        alert('Failed to delete load. Please try again.');
      }
    }
  };

  const filteredLoads = loads.filter(load =>
    load.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.toLocation.toLowerCase().includes(searchQuery.toLowerCase())
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
                <TruckIcon className="h-8 w-8 text-emerald-600" />
                Load Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">Manage your loads and track shipments</p>
            </div>
            <Link
              href="/load-form"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <PlusIcon className="h-5 w-5" />
              Add Load
            </Link>
          </div>

          {/* Search Bar */}
          {loads.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search loads by location..."
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

        {loads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-100 p-4">
                <TruckIcon className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No loads yet</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding your first load</p>
            <Link
              href="/load-form"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Load
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Load List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-emerald-600" />
                    All Loads ({filteredLoads.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {filteredLoads.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500">No loads found matching your search</p>
                    </div>
                  ) : (
                    filteredLoads.map((load) => (
                      <div
                        key={load.id}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          selectedLoad?.id === load.id
                            ? 'bg-emerald-50 border-l-4 border-l-emerald-600'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedLoad(load)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <TruckIcon className="h-6 w-6 text-emerald-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {load.fromLocation}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  <ArrowsRightLeftIcon className="h-3 w-3" />
                                  {load.toLocation}
                                </p>
                              </div>
                            </div>
                            <div className="ml-12 mt-2 space-y-1">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CurrencyDollarIcon className="h-3 w-3" />
                                Rate: {load.rate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(load);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Edit load"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(load.id);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete load"
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

            {/* Load Details */}
            <div className="lg:col-span-2">
              {selectedLoad ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <TruckIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Load Details
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <ArrowsRightLeftIcon className="h-4 w-4" />
                            {selectedLoad.fromLocation} → {selectedLoad.toLocation}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(selectedLoad)}
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
                      {/* Route Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-emerald-600" />
                          Route Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">From Location</p>
                              <p className="text-sm font-medium text-gray-900">{selectedLoad.fromLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">To Location</p>
                              <p className="text-sm font-medium text-gray-900">{selectedLoad.toLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Load Specifications */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <ScaleIcon className="h-4 w-4 text-emerald-600" />
                          Load Specifications
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <ScaleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Dimension</p>
                              <p className="text-sm font-medium text-gray-900">{selectedLoad.dimension}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <ScaleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Weight</p>
                              <p className="text-sm font-medium text-gray-900">{selectedLoad.weight}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Rate</p>
                              <p className="text-sm font-medium text-gray-900">{selectedLoad.rate}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="space-y-4 md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-emerald-600" />
                          Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Pickup Time</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(selectedLoad.pickupTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Drop Off Time</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(selectedLoad.dropOffTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-gray-100 p-4">
                      <TruckIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a load</h3>
                  <p className="text-sm text-gray-500">Choose a load from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

