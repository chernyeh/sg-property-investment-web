import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'
import { TrendingUp } from 'lucide-react'

interface Transaction {
  transaction_date: string
  price: number
  property_id: string
}

interface PropertyWithTransactions extends Property {
  transactions?: Transaction[]
}

export default function PriceTrends() {
  const [properties, setProperties] = useState<PropertyWithTransactions[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
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
        setSelectedPropertyId(data[0].id)
        loadTransactions(data[0].id)
      }
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadTransactions(propId: string) {
    try {
      const response = await fetch(
        `https://shsoigspjfkdyqgqptri.supabase.co/rest/v1/transactions?property_id=eq.${propId}&order=transaction_date.asc`,
        {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc29pZ3NwamZrZHlnZ3FwdHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwODMwMDAwLCJleHAiOjE5MjU2OTMwMDAwfQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc29pZ3NwamZrZHlnZ3FwdHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwODMwMDAwLCJleHAiOjE5MjU2OTMwMDAwfQ'
          }
        }
      )
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
    }
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

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
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Price Trends</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value)
              loadTransactions(e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.project_name} - ${(prop.recent_price / 1000000).toFixed(2)}M
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProperty && transactions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            {selectedProperty.project_name} - Price History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-gray-600 text-sm font-medium">Earliest Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(transactions[0].price / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">{transactions[0].transaction_date}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-gray-600 text-sm font-medium">Latest Price</p>
              <p className="text-2xl font-bold text-green-600">
                ${(transactions[transactions.length - 1].price / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">{transactions[transactions.length - 1].transaction_date}</p>
            </div>
            <div className={`border-l-4 p-4 rounded ${
              transactions[transactions.length - 1].price >= transactions[0].price
                ? 'bg-green-50 border-green-600'
                : 'bg-red-50 border-red-600'
            }`}>
              <p className="text-gray-600 text-sm font-medium">Change</p>
              <p className={`text-2xl font-bold ${
                transactions[transactions.length - 1].price >= transactions[0].price
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transactions[transactions.length - 1].price >= transactions[0].price ? '+' : ''}
                {(((transactions[transactions.length - 1].price - transactions[0].price) / transactions[0].price) * 100).toFixed(2)}%
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
                {transactions.map((tx, idx) => {
                  const change = ((tx.price - transactions[0].price) / transactions[0].price) * 100
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
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
      )}

      {transactions.length === 0 && (
        <div className="card text-center py-12 bg-gray-50">
          <p className="text-gray-600">No transaction history available for this property</p>
        </div>
      )}
    </div>
  )
}
