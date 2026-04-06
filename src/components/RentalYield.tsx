import { useEffect, useState } from 'react'
import { getPropertiesWithYield, PropertyWithYield } from '../lib/supabase'
import { TrendingUp } from 'lucide-react'

export default function RentalYield() {
  const [properties, setProperties] = useState<PropertyWithYield[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [minBedrooms, setMinBedrooms] = useState(0)
  const [minSqft, setMinSqft] = useState(0)
  const [selectedBedroom, setSelectedBedroom] = useState<number | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getPropertiesWithYield()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort by yield
  const filtered = properties
    .filter(p => p.rental && p.annualYield! > 0)
    .filter(p => p.rental!.bedrooms >= minBedrooms)
    .filter(p => p.size_sqft >= minSqft)
    .filter(p => selectedBedroom === null || p.rental!.bedrooms === selectedBedroom)
    .sort((a, b) => (b.annualYield || 0) - (a.annualYield || 0))

  const avgYield = filtered.length > 0
    ? filtered.reduce((sum, p) => sum + (p.annualYield || 0), 0) / filtered.length
    : 0

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading rental data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadProperties}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Rental Yield Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Bedrooms: {minBedrooms}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Sqft: {minSqft.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={minSqft}
              onChange={(e) => setMinSqft(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Bedrooms
            </label>
            <select
              value={selectedBedroom === null ? '' : selectedBedroom}
              onChange={(e) => setSelectedBedroom(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Matching Properties</p>
          <p className="text-3xl font-bold text-green-600">{filtered.length}</p>
        </div>
        <div className="card bg-emerald-50 border-l-4 border-emerald-600">
          <p className="text-gray-600 text-sm font-medium">Average Yield</p>
          <p className="text-3xl font-bold text-emerald-600">{avgYield.toFixed(2)}%</p>
        </div>
        <div className="card bg-teal-50 border-l-4 border-teal-600">
          <p className="text-gray-600 text-sm font-medium">Highest Yield</p>
          <p className="text-3xl font-bold text-teal-600">
            {filtered.length > 0 ? (filtered[0].annualYield || 0).toFixed(2) : 0}%
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Properties by Yield ({filtered.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">BR</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sqft</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Purchase Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly Rent</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual Rent</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Yield</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 font-medium">{property.project_name}</td>
                  <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                    {property.rental?.bedrooms || '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {property.size_sqft.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    ${(property.recent_price / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    ${property.rental?.monthly_rent.toLocaleString() || '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    ${property.rental?.annual_rent.toLocaleString() || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      property.annualYield! > 4 ? 'bg-green-100 text-green-800' :
                      property.annualYield! > 2.5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.annualYield?.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 py-8">No properties match your criteria</p>
        )}
      </div>
    </div>
  )
}
