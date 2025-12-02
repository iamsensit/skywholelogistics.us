'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadDriver();
    }
  }, [status, router, params.id]);

  const loadDriver = async () => {
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const drivers = await res.json();
        const foundDriver = drivers.find((d: any) => d.id === params.id);
        if (foundDriver) {
          setDriver(foundDriver);
        }
      }
    } catch (error) {
      console.error('Error loading driver:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Driver not found</h2>
          <Link
            href="/drivers"
            className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Back to Drivers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Drivers
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">{driver.name}</h1>
            <Link
              href={`/driver-form?id=${driver.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
              Edit
            </Link>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">MC Number</p>
                  <p className="text-base font-medium text-gray-900">{driver.mcNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-base font-medium text-gray-900">{driver.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Truck Type</p>
                  <p className="text-base font-medium text-gray-900">{driver.truckType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Haul Type</p>
                  <p className="text-base font-medium text-gray-900">{driver.haulType}</p>
                </div>
                {driver.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{driver.email}</p>
                  </div>
                )}
                {driver.yearsOfExperience && (
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="text-base font-medium text-gray-900">{driver.yearsOfExperience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(driver.address || driver.city || driver.state || driver.zipCode) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Street Address</p>
                      <p className="text-base font-medium text-gray-900">{driver.address}</p>
                    </div>
                  )}
                  {driver.city && (
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="text-base font-medium text-gray-900">{driver.city}</p>
                    </div>
                  )}
                  {driver.state && (
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="text-base font-medium text-gray-900">{driver.state}</p>
                    </div>
                  )}
                  {driver.zipCode && (
                    <div>
                      <p className="text-sm text-gray-500">Zip Code</p>
                      <p className="text-base font-medium text-gray-900">{driver.zipCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipment */}
            {driver.equipment && driver.equipment.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Equipment</h2>
                <div className="flex flex-wrap gap-2">
                  {driver.equipment.map((item: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Setup Companies */}
            {driver.setupCompanies && driver.setupCompanies.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Setup Companies</h2>
                <div className="flex flex-wrap gap-2">
                  {driver.setupCompanies.map((company: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Equipment */}
            {driver.specialEquipment && driver.specialEquipment.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Special Equipment</h2>
                <div className="flex flex-wrap gap-2">
                  {driver.specialEquipment.map((item: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Financial */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">RPM (Rate per Mile)</p>
                  <p className="text-base font-medium text-gray-900">{driver.rpm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="text-base font-medium text-gray-900">{driver.percentage}</p>
                </div>
              </div>
            </div>

            {/* CDL Information */}
            {(driver.cdlNumber || driver.cdlState) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">CDL Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {driver.cdlNumber && (
                    <div>
                      <p className="text-sm text-gray-500">CDL Number</p>
                      <p className="text-base font-medium text-gray-900">{driver.cdlNumber}</p>
                    </div>
                  )}
                  {driver.cdlExpiration && (
                    <div>
                      <p className="text-sm text-gray-500">CDL Expiration</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(driver.cdlExpiration).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {driver.cdlState && (
                    <div>
                      <p className="text-sm text-gray-500">CDL State</p>
                      <p className="text-base font-medium text-gray-900">{driver.cdlState}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* License Information */}
            {(driver.licenseNumber || driver.licenseState) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">License Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {driver.licenseNumber && (
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="text-base font-medium text-gray-900">{driver.licenseNumber}</p>
                    </div>
                  )}
                  {driver.licenseExpiration && (
                    <div>
                      <p className="text-sm text-gray-500">License Expiration</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(driver.licenseExpiration).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {driver.licenseState && (
                    <div>
                      <p className="text-sm text-gray-500">License State</p>
                      <p className="text-base font-medium text-gray-900">{driver.licenseState}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insurance Information */}
            {(driver.insuranceProvider || driver.insurancePolicyNumber) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver.insuranceProvider && (
                    <div>
                      <p className="text-sm text-gray-500">Insurance Provider</p>
                      <p className="text-base font-medium text-gray-900">{driver.insuranceProvider}</p>
                    </div>
                  )}
                  {driver.insurancePolicyNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Policy Number</p>
                      <p className="text-base font-medium text-gray-900">{driver.insurancePolicyNumber}</p>
                    </div>
                  )}
                  {driver.insuranceExpiration && (
                    <div>
                      <p className="text-sm text-gray-500">Expiration Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(driver.insuranceExpiration).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {driver.insuranceCoverage && (
                    <div>
                      <p className="text-sm text-gray-500">Coverage</p>
                      <p className="text-base font-medium text-gray-900">{driver.insuranceCoverage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dimensions */}
            {driver.dimensions && Object.values(driver.dimensions).some((v: any) => v) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dimensions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {driver.dimensions.height && (
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="text-base font-medium text-gray-900">{driver.dimensions.height}</p>
                    </div>
                  )}
                  {driver.dimensions.long && (
                    <div>
                      <p className="text-sm text-gray-500">Length</p>
                      <p className="text-base font-medium text-gray-900">{driver.dimensions.long}</p>
                    </div>
                  )}
                  {driver.dimensions.wide && (
                    <div>
                      <p className="text-sm text-gray-500">Width</p>
                      <p className="text-base font-medium text-gray-900">{driver.dimensions.wide}</p>
                    </div>
                  )}
                  {driver.dimensions.doorClearance && (
                    <div>
                      <p className="text-sm text-gray-500">Door Clearance</p>
                      <p className="text-base font-medium text-gray-900">{driver.dimensions.doorClearance}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

