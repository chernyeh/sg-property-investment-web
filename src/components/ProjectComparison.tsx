import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'
import { Search, X } from 'lucide-react'

export default function ProjectComparison() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCards, setSelectedCards] = useState<Property[]>([])
  const [sortBy, setSortBy] = useState<'price' | 'yield' | 'location' | 'newest'>('price')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getProperties()
      setAllProperties(data)
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  function getSortedProperties() {
    let filtered = allProperties
      .filter(p => 
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
      )

    filtered.sort((a, b) => {
      if (sortBy === 'price') return a.recent_price - b.recent_price
      if (sortBy === 'yield') return b.size_sqft - a.size_sqft
      if (sortBy === 'location') return a.district - b.district
      if (sortBy === 'newest') return new Date(b.recent_date).getTime() - new Date(a.recent_date).getTime()
      return 0
    })

    return filtered
  }

  function togglePropertySelection(prop: Property) {
    if (selectedCards.some(p => p.id === prop.id)) {
      setSelectedCards(selectedCards.filter(p => p.id !== prop.id))
    } else if (selectedCards.length < 5) {
      setSelectedCards([...selectedCards, prop])
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading properties...</p>
      </div>
    )
  }

  const sortedProperties = getSortedProperties()

  return (
    <div className="space-y-6">
      {/* Search & Sort */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Property Comparison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="price">Sort: Lowest Price</option>
            <option value="yield">Sort: Largest Size</option>
            <option value="location">Sort: By District</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        <p className="text-sm text-gray-600">
          Selected: {selectedCards.length}/5 properties
        </p>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProperties.slice(0, 20).map(prop => {
          const isSelected = selectedCards.some(p => p.id === prop.id)
          return (
            <div
              key={prop.id}
              onClick={() => togglePropertySelection(prop)}
              className={`card cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'hover:shadow-lg'
              } ${selectedCards.length >= 5 && !isSelected ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{prop.project_name}</h3>
                  <p className="text-xs text-gray-500">{prop.location} (D{prop.district})</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">${(prop.recent_price / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold">{prop.size_sqft.toLocaleString()} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price/Sqft:</span>
                  <span className="font-semibold">${Math.round(prop.recent_price / prop.size_sqft)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenure:</span>
                  <span className={`font-semibold px-2 py-1 rounded text-xs ${
                    prop.tenure === 'Freehold'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {prop.tenure}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-sm">{prop.property_type}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Selected Properties</h3>
            <button
              onClick={() => setSelectedCards([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {selectedCards.map(prop => (
              <div
                key={prop.id}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="font-semibold">{prop.project_name}</span>
                <button
                  onClick={() => setSelectedCards(selectedCards.filter(p => p.id !== prop.id))}
                  className="hover:bg-blue-200 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[140px]">Metric</th>
                    {selectedCards.map((prop, idx) => (
                      <th key={idx} className="text-center py-4 px-6 font-semibold text-gray-900 min-w-[160px]">
                        {prop.project_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', key: 'recent_price', format: (v: any) => `$${(v / 1000000).toFixed(2)}M` },
                    { label: 'Size (sqft)', key: 'size_sqft', format: (v: any) => v.toLocaleString() },
                    { label: 'Price/Sqft', key: 'price_sqft', format: (v: any) => `$${v}` },
                    { label: 'District', key: 'district', format: (v: any) => `D${v}` },
                    { label: 'Location', key: 'location', format: (v: any) => v },
                    { label: 'Type', key: 'property_type', format: (v: any) => v },
                    { label: 'Tenure', key: 'tenure', format: (v: any) => v },
                    { label: 'Age (years)', key: 'age', format: (v: any) => v },
                    { label: 'TOP Date', key: 'top_date', format: (v: any) => v ? new Date(v).toLocaleDateString('en-SG') : 'N/A' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-semibold text-gray-700 sticky left-0 bg-white z-10">{row.label}</td>
                      {selectedCards.map((prop, pidx) => {
                        const value = row.key === 'price_sqft' 
                          ? Math.round(prop.recent_price / prop.size_sqft)
                          : (prop as any)[row.key]
                        return (
                          <td key={pidx} className="py-4 px-6 text-center text-gray-900 font-medium">
                            {row.format(value)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
