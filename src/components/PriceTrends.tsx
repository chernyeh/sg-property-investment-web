import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'
import { TrendingUp } from 'lucide-react'

interface Transaction {
  transaction_date: string
  price: number
  property_id: string
}

export default function PriceTrends() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [transactions, setTransactions] = useState<Map<string, Transaction[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getProperties()
      setProperties(data)
      if (data.length > 0) {
        setSelectedProperties([data[0].id])
        loadTransactions([data[0].id])
      }
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadTransactions(propIds: string[]) {
    try {
      const transMap = new Map<string, Transaction[]>()
      
      for (const propId of propIds) {
        const response = await fetch(
          `https://shsoigspjfkdyqgqptri.supabase.co/rest/v1/transactions?property_id=eq.${propId}&order=transaction_date.asc`,
          {
            headers: {
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc29pZ3NwamZrZHlnZ3FwdHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwODMwMDAwLCJleHAiOjE5MjU2OTMwMDAwfQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc29pZ3NwamZrZHlnZ3FwdHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwODMwMDAwLCJleHAiOjE5MjU2OTMwMDAwfQ'
            }
          }
        )
        const data = await response.json()
        transMap.set(propId, data)
      }
      
      setTransactions(transMap)
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  function toggleProperty(propId: string) {
    const newSelected = selectedProperties.includes(propId)
      ? selectedProperties.filter(p => p !== propId)
      : [...selectedProperties, propId]
    
    if (newSelected.length > 0) {
      setSelectedProperties(newSelected)
      loadTransactions(newSelected)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading price trends...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Price Trends (5-Year History)</h2>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Properties to Compare (up to 5)
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {properties.slice(0, 40).map(prop => (
            <button
              key={prop.id}
              onClick={() => toggleProperty(prop.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                selectedProperties.includes(prop.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${selectedProperties.length >= 5 && !selectedProperties.includes(prop.id) ? 'opacity-50' : ''}`}
            >
              {prop.project_name.substring(0, 15)}...
            </button>
          ))}
        </div>

        {selectedProperties.length === 0 && (
          <p className="text-gray-600 text-center py-8">Select a property to view trends</p>
        )}
      </div>

      {selectedProperties.length > 0 && (
        <>
          {selectedProperties.map((propId) => {
            const prop = properties.find(p => p.id === propId)
            const txns = transactions.get(propId) || []

            if (!prop || txns.length === 0) return null

            return (
              <div key={propId} className="card">
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  {prop.project_name} - 5-Year Price History
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-gray-600 text-sm font-medium">Earliest Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(txns[0].price / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{txns[0].transaction_date}</p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <p className="text-gray-600 text-sm font-medium">Latest Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(txns[txns.length - 1].price / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{txns[txns.length - 1].transaction_date}</p>
                  </div>

                  <div className={`border-l-4 p-4 rounded ${
                    txns[txns.length - 1].price >= txns[0].price
                      ? 'bg-green-50 border-green-600'
                      : 'bg-red-50 border-red-600'
                  }`}>
                    <p className="text-gray-600 text-sm font-medium">5-Year Change</p>
                    <p className={`text-2xl font-bold ${
                      txns[txns.length - 1].price >= txns[0].price
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {txns[txns.length - 1].price >= txns[0].price ? '+' : ''}
                      {(((txns[txns.length - 1].price - txns[0].price) / txns[0].price) * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                    <p className="text-gray-600 text-sm font-medium">Annual Growth</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(((Math.pow(txns[txns.length - 1].price / txns[0].price, 1/5) - 1) * 100)).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Change from Start</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((tx, i) => {
                        const change = ((tx.price - txns[0].price) / txns[0].price) * 100
                        return (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{tx.transaction_date}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">
                              ${(tx.price / 1000000).toFixed(2)}M
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-block px-3 py-1 rounded font-semibold text-xs ${
                                change > 0 ? 'bg-green-100 text-green-800' :
                                change < 0 ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {change > 0 ? '+' : ''}{change.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
