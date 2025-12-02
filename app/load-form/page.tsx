'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function LoadFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    dimension: '',
    weight: '',
    rate: '',
    pickupTime: '',
    dropOffTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const loadLoad = async () => {
      if (editId && status === 'authenticated') {
        try {
          const res = await fetch('/api/loads');
          if (res.ok) {
            const loads = await res.json();
            const load = loads.find((l: any) => l.id === editId);
            if (load) {
              setFormData({
                fromLocation: load.fromLocation || '',
                toLocation: load.toLocation || '',
                dimension: load.dimension || '',
                weight: load.weight || '',
                rate: load.rate || '',
                pickupTime: load.pickupTime ? new Date(load.pickupTime).toISOString().slice(0, 16) : '',
                dropOffTime: load.dropOffTime ? new Date(load.dropOffTime).toISOString().slice(0, 16) : '',
              });
            }
          }
        } catch (error) {
          console.error('Error loading load:', error);
        }
      }
    };
    if (status === 'authenticated') {
      loadLoad();
    }
  }, [editId, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: editId || undefined,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/loads');
      } else {
        alert(data.error || 'Failed to save load');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error saving load:', error);
      alert('Failed to save load. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/loads" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block cursor-pointer">
            ← Back to Loads
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {editId ? 'Edit Load' : 'New Load'}
          </h1>
          <p className="text-sm text-gray-500">SkyWhole Logistics</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          {/* Route Information */}
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Route Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  From Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fromLocation}
                  onChange={(e) => handleInputChange('fromLocation', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Pickup location"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  To Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.toLocation}
                  onChange={(e) => handleInputChange('toLocation', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Delivery location"
                />
              </div>
            </div>
          </div>

          {/* Load Details */}
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Load Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Dimension <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dimension}
                  onChange={(e) => handleInputChange('dimension', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 48x40x96"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Weight <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 5000 lbs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Rate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., $1500"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Pickup Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Drop Off Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dropOffTime}
                  onChange={(e) => handleInputChange('dropOffTime', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/loads"
              className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoadForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <LoadFormContent />
    </Suspense>
  );
}

