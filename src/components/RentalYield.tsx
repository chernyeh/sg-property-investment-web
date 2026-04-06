import { useEffect, useState } from 'react'
import { getPropertiesWithYield, Property } from '../lib/supabase'
import { DollarSign, Filter } from 'lucide-react'

interface PropertyWithYield extends Property {
  rental?: any
  annualYield?: number
  monthlyYield?: number
}

export default function RentalYield() {
  const [properties, setProperties] = useState<PropertyWithYield[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithYield[]>([])
  const [loading, setLoading] = useState(true)
  const [tenureFilter, setTenureFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'yield' | 'price' | 'top'>('yield')

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    filterAndSort()
  }, [properties, tenureFilter, sortBy])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getPropertiesWithYield()
      setProperties(data)
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSort() {
    let filtered = [...properties]

    // Filter by tenure
    if (tenureFilter !== 'all') {
      filtered = filtered.filter(p => p.tenure === tenureFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'yield') {
        return (b.annualYield || 0) - (a.annualYield || 0)
      } else if (sortBy === 'price') {
        return a.recent_price - b.recent_price
      } else if (sortBy === 'top') {
        const dateA = new Date(a.top_date || '').getTime() || 0
        const dateB = new Date(b.top_date || '').getTime() || 0
        return dateB - dateA
      }
      return 0
    })

    setFilteredProperties(filtered)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading rental yield data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Rental Yield Analysis</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Tenure
            </label>
            <select
              value={tenureFilter}
              onChange={(e) => setTenureFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tenures</option>
              <option value="Freehold">Freehold</option>
              <option value="99-Year">99-Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="yield">Highest Yield</option>
              <option value="price">Lowest Price</option>
              <option value="top">Newest TOP</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-semibold text-center">
              {filteredProperties.length} Properties
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Property</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Tenure</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">TOP Date</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual Rent</th>
              <th className="text-right py-3 px-4 font-semibold text-green-700">Annual Yield</th>
              <th className="text-right py-3 px-4 font-semibold text-green-700">Monthly Yield</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((prop, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">
                  <div>
                    <p className="font-semibold">{prop.project_name}</p>
                    <p className="text-xs text-gray-500">{prop.location} (D{prop.district})</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded font-semibold text-xs ${
                    prop.tenure === 'Freehold'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {prop.tenure}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {prop.top_date ? new Date(prop.top_date).toLocaleDateString('en-SG') : 'N/A'}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  ${(prop.recent_price / 1000000).toFixed(2)}M
                </td>
                <td className="py-3 px-4 text-right text-gray-700">
                  ${(prop.rental?.annual_rent / 1000).toFixed(0)}K
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded font-bold ${
                    (prop.annualYield || 0) > 4
                      ? 'bg-green-100 text-green-800'
                      : (prop.annualYield || 0) > 3
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(prop.annualYield || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-700 font-semibold">
                  {(prop.monthlyYield || 0).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProperties.length === 0 && (
        <div className="card text-center py-12 bg-gray-50">
          <p className="text-gray-600">No properties match your filters</p>
        </div>
      )}
    </div>
  )
}
