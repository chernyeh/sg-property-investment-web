import { useState } from 'react'
import { calculateMortgage, formatCurrency } from '../lib/mortgage'
import { Calculator, Download } from 'lucide-react'

export default function MortgageCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(2500000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [year1Rate, setYear1Rate] = useState(2.75)
  const [year2Rate, setYear2Rate] = useState(3.25)
  const [year3Rate, setYear3Rate] = useState(3.75)
  const [years4Rate, setYears4Rate] = useState(4.25)
  const [loanTenureYears, setLoanTenureYears] = useState(25)
  const [terminationFeePct, setTerminationFeePct] = useState(2.5)

  const result = calculateMortgage({
    purchasePrice,
    downPaymentPct,
    year1Rate,
    year2Rate,
    year3Rate,
    years4Rate,
    loanTenureYears,
    terminationFeePct,
  })

  function exportSchedule() {
    let csv = 'Month,Payment,Principal,Interest,Balance\n'
    result.amortizationSchedule.forEach(row => {
      csv += `${row.month},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`
    })
    
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', 'amortization-schedule.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Mortgage Calculator</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purchase Price (SGD)
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">{formatCurrency(purchasePrice)}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Down Payment</label>
                <span className="text-sm font-bold text-blue-600">{downPaymentPct.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="99"
                step="1"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-2">
                Down: {formatCurrency(result.downPayment)} | Loan: {formatCurrency(result.loanAmount)}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Loan Tenure</label>
                <span className="text-sm font-bold text-blue-600">{loanTenureYears} years</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Early Termination Fee: {terminationFeePct}%
              </label>
              <input
                type="number"
                step="0.1"
                value={terminationFeePct}
                onChange={(e) => setTerminationFeePct(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column - Interest Rate Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Year 1 Rate</label>
                <span className="text-sm font-bold text-blue-600">{year1Rate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={year1Rate}
                onChange={(e) => setYear1Rate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Year 2 Rate</label>
                <span className="text-sm font-bold text-blue-600">{year2Rate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={year2Rate}
                onChange={(e) => setYear2Rate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Year 3 Rate</label>
                <span className="text-sm font-bold text-blue-600">{year3Rate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={year3Rate}
                onChange={(e) => setYear3Rate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Year 4+ Rate</label>
                <span className="text-sm font-bold text-blue-600">{years4Rate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={years4Rate}
                onChange={(e) => setYears4Rate(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Monthly Payment</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.monthlyPayment)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Interest</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(result.totalInterest)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(result.totalCost)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Interest %</p>
          <p className="text-2xl font-bold text-orange-600">
            {((result.totalInterest / result.loanAmount) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Loan Scenarios</h2>
          <button
            onClick={exportSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Scenario</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Paid</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Interest</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Termination Fee</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.scenarios.map((scenario, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{scenario.name}</td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    {formatCurrency(scenario.totalPaid)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600">
                    {formatCurrency(scenario.totalInterest)}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-600">
                    {formatCurrency(scenario.terminationFee)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(scenario.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Amortization Schedule (First 24 Months)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Payment</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Principal</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Interest</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.amortizationSchedule.slice(0, 24).map((row) => (
                <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4 text-center text-gray-700 font-semibold">{row.month}</td>
                  <td className="py-2 px-4 text-right text-gray-900">{formatCurrency(row.payment)}</td>
                  <td className="py-2 px-4 text-right text-green-600">{formatCurrency(row.principal)}</td>
                  <td className="py-2 px-4 text-right text-red-600">{formatCurrency(row.interest)}</td>
                  <td className="py-2 px-4 text-right text-gray-900 font-semibold">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
