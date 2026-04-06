export interface MortgageInput {
  purchasePrice: number
  downPaymentPct: number
  year1Rate: number
  year2Rate: number
  year3Rate: number
  years4Rate: number
  loanTenureYears: number
  terminationFeePct: number
}

export interface AmortizationMonth {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface ScenarioResult {
  name: string
  exitYear: number | null
  totalPaid: number
  totalInterest: number
  terminationFee: number
  remainingBalance: number
  breakeven: boolean
}

export interface MortgageResult {
  loanAmount: number
  downPayment: number
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  amortizationSchedule: AmortizationMonth[]
  scenarios: ScenarioResult[]
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const {
    purchasePrice,
    downPaymentPct,
    year1Rate,
    year2Rate,
    year3Rate,
    years4Rate,
    loanTenureYears,
    terminationFeePct,
  } = input

  const downPayment = purchasePrice * (downPaymentPct / 100)
  const loanAmount = purchasePrice - downPayment
  const totalMonths = loanTenureYears * 12

  // Build amortization schedule with variable rates
  const schedule: AmortizationMonth[] = []
  let balance = loanAmount
  let totalInterestPaid = 0

  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12)
    
    // Determine interest rate based on year
    let monthlyRate: number
    if (year === 1) {
      monthlyRate = year1Rate / 100 / 12
    } else if (year === 2) {
      monthlyRate = year2Rate / 100 / 12
    } else if (year === 3) {
      monthlyRate = year3Rate / 100 / 12
    } else {
      monthlyRate = years4Rate / 100 / 12
    }

    // Calculate fixed monthly payment
    const remainingMonths = totalMonths - month + 1
    const monthlyPayment = monthlyRate > 0 
      ? balance * monthlyRate / (1 - Math.pow(1 + monthlyRate, -remainingMonths))
      : balance / remainingMonths

    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    
    balance -= principalPayment
    totalInterestPaid += interestPayment

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    })
  }

  const avgMonthlyPayment = schedule.length > 0 
    ? schedule.reduce((sum, m) => sum + m.payment, 0) / schedule.length 
    : 0

  // Calculate scenarios
  const scenarios: ScenarioResult[] = []

  // Scenario 1: Full payoff
  scenarios.push({
    name: 'Full 25-year payoff',
    exitYear: null,
    totalPaid: schedule.reduce((sum, m) => sum + m.payment, 0),
    totalInterest: totalInterestPaid,
    terminationFee: 0,
    remainingBalance: 0,
    breakeven: true
  })

  // Scenario 2: Refinance at Year 5
  const year5Month = Math.min(60, schedule.length)
  if (year5Month < schedule.length) {
    const year5Balance = schedule[year5Month - 1].balance
    scenarios.push({
      name: 'Refinance at Year 5',
      exitYear: 5,
      totalPaid: schedule.slice(0, year5Month).reduce((sum, m) => sum + m.payment, 0),
      totalInterest: schedule.slice(0, year5Month).reduce((sum, m) => sum + m.interest, 0),
      terminationFee: 0,
      remainingBalance: year5Balance,
      breakeven: true
    })
  }

  // Scenario 3: Early exit year 3
  const year3Month = Math.min(36, schedule.length)
  if (year3Month < schedule.length) {
    const year3Balance = schedule[year3Month - 1].balance
    const exitFee = year3Balance * (terminationFeePct / 100)
    scenarios.push({
      name: 'Exit at Year 3',
      exitYear: 3,
      totalPaid: schedule.slice(0, year3Month).reduce((sum, m) => sum + m.payment, 0) + exitFee,
      totalInterest: schedule.slice(0, year3Month).reduce((sum, m) => sum + m.interest, 0),
      terminationFee: exitFee,
      remainingBalance: year3Balance,
      breakeven: false
    })
  }

  // Scenario 4: Early exit year 10
  const year10Month = Math.min(120, schedule.length)
  if (year10Month < schedule.length) {
    const year10Balance = schedule[year10Month - 1].balance
    const exitFee = year10Balance * (terminationFeePct / 100)
    scenarios.push({
      name: 'Exit at Year 10',
      exitYear: 10,
      totalPaid: schedule.slice(0, year10Month).reduce((sum, m) => sum + m.payment, 0) + exitFee,
      totalInterest: schedule.slice(0, year10Month).reduce((sum, m) => sum + m.interest, 0),
      terminationFee: exitFee,
      remainingBalance: year10Balance,
      breakeven: true
    })
  }

  return {
    loanAmount,
    downPayment,
    monthlyPayment: avgMonthlyPayment,
    totalInterest: totalInterestPaid,
    totalCost: loanAmount + totalInterestPaid,
    amortizationSchedule: schedule,
    scenarios
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

