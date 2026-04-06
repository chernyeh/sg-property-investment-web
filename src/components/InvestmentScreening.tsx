import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'
import { Filter } from 'lucide-react'

export default function InvestmentScreening() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [minPrice, setMinPrice] = useState(1000000)
  const [maxPrice, setMaxPrice] = useState(10000000)
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([])
  const [propertyType, setPropertyType] = useState('')

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getProperties()
      setAllProperties(data)
      applyFilters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  function applyFilters(properties: Property[]) {
    let filtered = properties

    filtered = filtered.filter(p => p.recent_price >= minPrice && p.recent_price <= maxPrice)

    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(p => selectedDistricts.includes(p.district))
    }

    if (propertyType) {
      filtered = filtered.filter(p => p.property_type === propertyType)
    }

    setFilteredProperties(filtered)
  }

  function handleFilterChange() {
    applyFilters(allProperties)
  }

  const districts = Array.from({ length: 28 }, (_, i) => i + 1)
  const propertyTypes = ['Condo', 'HDB', 'Landed', 'Commercial']

  const avgPrice = allProperties.length > 0
    ? allProperties.reduce((sum, p) => sum + p.recent_price, 0) / allProperties.length
    : 0
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const avgPrice = allProperties.length > 0
    ? allProperties.reduce((sum, p) => sum + (p.recent_price / p.size_sqft), 0) / allProperties.length
    : 0

  const deals = filteredProperties.filter(p => {
    const psf = p.recent_price / p.size_sqft
    return psf < avgPsf * 0.9
  }).sort((a, b) => {
    const aScore = (a.recent_price / a.size_sqft) / avgPsf
    const bScore = (b.recent_price / b.size_sqft) / avgPsf
    return aScore - bScore
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading market data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Screening Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price (SGD)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(Number(e.target.value))
                handleFilterChange()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price (SGD)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value))
                handleFilterChange()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value)
                handleFilterChange()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Districts (Click to filter)
          </label>
          <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
            {districts.map(district => (
              <button
                key={district}
                onClick={() => {
                  setSelectedDistricts(prev =>
                    prev.includes(district)
                      ? prev.filter(d => d !== district)
                      : [...prev, district]
                  )
                  handleFilterChange()
                }}
                className={`py-2 px-2 rounded text-sm font-semibold transition-colors ${
                  selectedDistricts.includes(district)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                D{district}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Matching Properties</p>
          <p className="text-3xl font-bold text-blue-600">{filteredProperties.length}</p>
        </div>
        <div className="card bg-green-50 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Deals Found</p>
          <p className="text-3xl font-bold text-green-600">{deals.length}</p>
        </div>
        <div className="card bg-amber-50 border-l-4 border-amber-600">
          <p className="text-gray-600 text-sm font-medium">Average Price/Sqft</p>
          <p className="text-3xl font-bold text-amber-600">${avgPsf.toFixed(0)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Filtered Results ({filteredProperties.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">District</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price/Sqft</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">vs Avg</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => {
                const psf = property.recent_price / property.size_sqft
                const psfDiff = ((psf / avgPsf) - 1) * 100
                return (
                  <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{property.project_name}</td>
                    <td className="py-3 px-4 text-center text-gray-700">D{property.district}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                      ${(property.recent_price / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ${psf.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded font-semibold text-xs ${
                        psfDiff < -10 ? 'bg-green-100 text-green-800' :
                        psfDiff < 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {psfDiff > 0 ? '+' : ''}{psfDiff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
          <p className="text-center text-gray-600 py-8">No properties match your filters</p>
        )}
      </div>
    </div>
  )
}
