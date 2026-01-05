'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TRUCK_TYPES = [
  'Box Truck',
  'Reefer Truck',
  'Dry Van',
  'Flatbed Truck',
  'Hotshot Truck',
  'Power Only',
  'Tanker Truck',
  'Step Deck / Drop Deck',
  'Lowboy Trailer',
  'Car Hauler',
  'Other'
];

const EQUIPMENT_OPTIONS = [
  'Lift Gate',
  'Pallet Jack',
  'Straps',
  'Tracking Device',
  'Ramps',
  'E Tracks'
];

const SETUP_COMPANIES = [
  'TQL',
  'CH Robinson',
  'Highway Setup'
];

const SPECIAL_EQUIPMENT = [
  'Twic Cards',
  'Hazmat Card',
  'PPE Equipment'
];

function DriverFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    mcNo: '',
    phone: '',
    truckType: '',
    dimensions: {
      height: '',
      long: '',
      wide: '',
      doorClearance: ''
    },
    equipment: [] as string[],
    haulType: '',
    setupCompanies: [] as string[],
    specialEquipment: [] as string[],
    rpm: '',
    zipCode: '',
    percentage: '',
    cdlNumber: '',
    cdlExpiration: '',
    cdlState: '',
    licenseNumber: '',
    licenseExpiration: '',
    licenseState: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiration: '',
    insuranceCoverage: '',
    email: '',
    address: '',
    city: '',
    state: '',
    yearsOfExperience: '',
  });

  const [showDimensions, setShowDimensions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const loadDriver = async () => {
      if (editId && status === 'authenticated') {
        try {
          const res = await fetch('/api/drivers');
          if (res.ok) {
            const drivers = await res.json();
            const driver = drivers.find((d: any) => d.id === editId);
            if (driver) {
              setFormData({
                name: driver.name || '',
                mcNo: driver.mcNo || '',
                phone: driver.phone || '',
                truckType: driver.truckType || '',
                dimensions: driver.dimensions || { height: '', long: '', wide: '', doorClearance: '' },
                equipment: driver.equipment || [],
                haulType: driver.haulType || '',
                setupCompanies: driver.setupCompanies || [],
                specialEquipment: driver.specialEquipment || [],
                rpm: driver.rpm || '',
                zipCode: driver.zipCode || '',
                percentage: driver.percentage || '',
                cdlNumber: driver.cdlNumber || '',
                cdlExpiration: driver.cdlExpiration ? new Date(driver.cdlExpiration).toISOString().split('T')[0] : '',
                cdlState: driver.cdlState || '',
                licenseNumber: driver.licenseNumber || '',
                licenseExpiration: driver.licenseExpiration ? new Date(driver.licenseExpiration).toISOString().split('T')[0] : '',
                licenseState: driver.licenseState || '',
                insuranceProvider: driver.insuranceProvider || '',
                insurancePolicyNumber: driver.insurancePolicyNumber || '',
                insuranceExpiration: driver.insuranceExpiration ? new Date(driver.insuranceExpiration).toISOString().split('T')[0] : '',
                insuranceCoverage: driver.insuranceCoverage || '',
                email: driver.email || '',
                address: driver.address || '',
                city: driver.city || '',
                state: driver.state || '',
                yearsOfExperience: driver.yearsOfExperience || '',
              });
              setShowDimensions(!!driver.dimensions && Object.values(driver.dimensions).some((v: any) => v));
            }
          }
        } catch (error) {
          console.error('Error loading driver:', error);
        }
      } else if (!editId && status === 'authenticated') {
        // Pre-fill from URL params if creating new driver
        const nameParam = searchParams.get('name');
        const mcNoParam = searchParams.get('mcNo');
        if (nameParam || mcNoParam) {
          setFormData(prev => ({
            ...prev,
            name: nameParam || prev.name,
            mcNo: mcNoParam || prev.mcNo,
          }));
        }
      }
    };
    if (status === 'authenticated') {
      loadDriver();
    }
  }, [editId, status, searchParams]);

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
    if (field.startsWith('dimensions.')) {
      const dimField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCheckboxChange = (field: 'equipment' | 'setupCompanies' | 'specialEquipment', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        [field]: updated
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: editId || undefined,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/drivers');
      } else {
        alert(data.error || 'Failed to save driver');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error saving driver:', error);
      alert('Failed to save driver. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/drivers" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block cursor-pointer">
            ← Back to Drivers
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {editId ? 'Edit Driver' : 'New Driver'}
          </h1>
          <p className="text-sm text-gray-500">SkyWhole Logistics</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Driver name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    MC No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mcNo}
                    onChange={(e) => handleInputChange('mcNo', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="MC Number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Truck Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.truckType}
                    onChange={(e) => handleInputChange('truckType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select type</option>
                    {TRUCK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Dimensions</h2>
                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  {showDimensions ? 'Hide' : 'Show'}
                </button>
              </div>
              {showDimensions && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Height</label>
                    <input
                      type="text"
                      value={formData.dimensions.height}
                      onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Length</label>
                    <input
                      type="text"
                      value={formData.dimensions.long}
                      onChange={(e) => handleInputChange('dimensions.long', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Width</label>
                    <input
                      type="text"
                      value={formData.dimensions.wide}
                      onChange={(e) => handleInputChange('dimensions.wide', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Door Clearance</label>
                    <input
                      type="text"
                      value={formData.dimensions.doorClearance}
                      onChange={(e) => handleInputChange('dimensions.doorClearance', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Equipment & Services */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Equipment & Services</h2>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Equipment</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EQUIPMENT_OPTIONS.map(equip => (
                    <label key={equip} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(equip)}
                        onChange={() => handleCheckboxChange('equipment', equip)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-700">{equip}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Haul Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="haulType"
                      value="Long Haul"
                      checked={formData.haulType === 'Long Haul'}
                      onChange={(e) => handleInputChange('haulType', e.target.value)}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-700">Long Haul</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="haulType"
                      value="Short Haul"
                      checked={formData.haulType === 'Short Haul'}
                      onChange={(e) => handleInputChange('haulType', e.target.value)}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-700">Short Haul</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Setup Companies</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SETUP_COMPANIES.map(company => (
                    <label key={company} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.setupCompanies.includes(company)}
                        onChange={() => handleCheckboxChange('setupCompanies', company)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-700">{company}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Special Equipment</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIAL_EQUIPMENT.map(equip => (
                    <label key={equip} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialEquipment.includes(equip)}
                        onChange={() => handleCheckboxChange('specialEquipment', equip)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-700">{equip}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Financial Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    RPM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rpm}
                    onChange={(e) => handleInputChange('rpm', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Rate per mile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Zip code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.percentage}
                    onChange={(e) => handleInputChange('percentage', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Percentage"
                  />
                </div>
              </div>
            </div>

            {/* Driver Credentials */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Driver Credentials</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    CDL Number
                  </label>
                  <input
                    type="text"
                    value={formData.cdlNumber}
                    onChange={(e) => handleInputChange('cdlNumber', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="CDL Number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    CDL Expiration
                  </label>
                  <input
                    type="date"
                    value={formData.cdlExpiration}
                    onChange={(e) => handleInputChange('cdlExpiration', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    CDL State
                  </label>
                  <input
                    type="text"
                    value={formData.cdlState}
                    onChange={(e) => handleInputChange('cdlState', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="License Number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    License Expiration
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiration}
                    onChange={(e) => handleInputChange('licenseExpiration', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    License State
                  </label>
                  <input
                    type="text"
                    value={formData.licenseState}
                    onChange={(e) => handleInputChange('licenseState', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Insurance Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Insurance Company"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Policy Number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Insurance Expiration
                  </label>
                  <input
                    type="date"
                    value={formData.insuranceExpiration}
                    onChange={(e) => handleInputChange('insuranceExpiration', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Coverage Amount
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceCoverage}
                    onChange={(e) => handleInputChange('insuranceCoverage', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., $1,000,000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="driver@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/drivers"
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}

export default function DriverForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <DriverFormContent />
    </Suspense>
  );
}

