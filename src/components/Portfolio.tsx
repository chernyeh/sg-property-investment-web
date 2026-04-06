import { useState, useEffect } from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'

interface PortfolioItem {
  id: string
  projectName: string
  location: string
  purchasePrice: number
  purchaseDate: string
  notes: string
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('property-portfolio')
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load portfolio:', err)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('property-portfolio', JSON.stringify(portfolio))
  }, [portfolio])

  function addProperty() {
    if (!formData.projectName || !formData.location || !formData.purchasePrice) {
      alert('Please fill in all required fields')
      return
    }

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      projectName: formData.projectName,
      location: formData.location,
      purchasePrice: Number(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
    }

    setPortfolio([...portfolio, newItem])
    setFormData({
      projectName: '',
      location: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setShowForm(false)
  }

  function removeProperty(id: string) {
    setPortfolio(portfolio.filter(item => item.id !== id))
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.purchasePrice, 0)
  const avgPrice = portfolio.length > 0 ? totalValue / portfolio.length : 0

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">My Property Portfolio</h1>
              <p className="text-blue-100">Track your investment properties</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card border-2 border-blue-300">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Add New Property</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                placeholder="e.g., Marina Bay Suites"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., District 4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Price (SGD) *</label>
<input
  type="number"
  value={formData.purchasePrice}
  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
  placeholder="2500000"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:[appearance:none] [&]:[-moz-appearance:textfield]"
/>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addProperty}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add to Portfolio
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Total Properties</p>
            <p className="text-3xl font-bold text-blue-600">{portfolio.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-green-600">${(totalValue / 1000000).toFixed(1)}M</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm font-medium">Average Property Price</p>
            <p className="text-3xl font-bold text-purple-600">${(avgPrice / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      )}

      <div className="card">
        {portfolio.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No properties in your portfolio yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first property to get started</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-900">Your Properties</h2>
            <div className="space-y-3">
              {portfolio.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.projectName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">{item.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Purchase Price</p>
                        <p className="font-semibold text-gray-900">${(item.purchasePrice / 1000000).toFixed(2)}M</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Purchase Date</p>
                        <p className="font-semibold text-gray-900">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProperty(item.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
