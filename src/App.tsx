import { useState } from 'react'
import { BarChart3, Home, TrendingUp, Calculator, Briefcase, DollarSign, LineChart } from 'lucide-react'
import Dashboard from './components/Dashboard'
import ProjectComparison from './components/ProjectComparison'
import InvestmentScreening from './components/InvestmentScreening'
import MortgageCalculator from './components/MortgageCalculator'
import Portfolio from './components/Portfolio'
import RentalYield from './components/RentalYield'
import PriceTrends from './components/PriceTrends'

type Tab = 'dashboard' | 'comparison' | 'screening' | 'mortgage' | 'portfolio' | 'rental' | 'trends'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Singapore Property Analyzer</h1>
              <p className="text-gray-600 text-sm">Investment intelligence platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'comparison'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Compare
            </button>
            <button
              onClick={() => setActiveTab('screening')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'screening'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Screening
            </button>
            <button
              onClick={() => setActiveTab('mortgage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'mortgage'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Mortgage
            </button>
            <button
              onClick={() => setActiveTab('rental')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'rental'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Rental Yield
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'trends'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <LineChart className="w-4 h-4" />
              Price Trends
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'portfolio'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Portfolio
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'comparison' && <ProjectComparison />}
        {activeTab === 'screening' && <InvestmentScreening />}
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'rental' && <RentalYield />}
        {activeTab === 'trends' && <PriceTrends />}
        {activeTab === 'portfolio' && <Portfolio />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Singapore Property Analyzer. Built with React + Supabase.</p>
          <p className="text-xs text-gray-500 mt-2">Data is for analysis purposes. Always verify with official sources.</p>
        </div>
      </footer>
    </div>
  )
}
