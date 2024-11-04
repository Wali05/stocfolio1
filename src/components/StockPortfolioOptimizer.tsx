"use client"
import { useState } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

interface OptimizationResult {
    expected_return: number;
    risk: number;
    sharpe_ratio: number;
}

export default function StockPortfolioOptimizer() {
  const [stocks, setStocks] = useState([{ ticker: '', weight: '' }])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [results, setResults] = useState<OptimizationResult | null>(null) // Specify the type of results
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const addStock = () => {
    setStocks([...stocks, { ticker: '', weight: '' }])
  }

  const updateStock = (index: number, field: 'ticker' | 'weight', value: string) => {
    const updatedStocks = stocks.map((stock, i) => {
      if (i === index) {
        return { ...stock, [field]: value }
      }
      return stock
    })
    setStocks(updatedStocks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResults(null)

    const tickers = stocks.map(stock => stock.ticker)
    const weights = stocks.map(stock => parseFloat(stock.weight))

    try {
      const response = await fetch('https://stocfolio1-flask.onrender.com/optimize', { // Updated to Render backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers,
          weights,
          start_date: startDate,
          end_date: endDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to optimize portfolio')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('An error occurred while optimizing the portfolio. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 text-gray-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Stock Portfolio Optimizer</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {stocks.map((stock, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor={`ticker-${index}`} className="text-gray-300">Stock Ticker</Label>
                  <Input
                    id={`ticker-${index}`}
                    value={stock.ticker}
                    onChange={(e) => updateStock(index, 'ticker', e.target.value)}
                    placeholder="e.g., AAPL"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`weight-${index}`} className="text-gray-300">Weight (%)</Label>
                  <Input
                    id={`weight-${index}`}
                    value={stock.weight}
                    onChange={(e) => updateStock(index, 'weight', e.target.value)}
                    placeholder="e.g., 25"
                    type="number"
                    min="0"
                    max="100"
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    required
                  />
                </div>
              </div>
            ))}
            <Button type="button" onClick={addStock} variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
              Add Stock
            </Button>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-gray-300">Start Date</Label>
                <Input
                  id="start-date"
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-gray-300">End Date</Label>
                <Input
                  id="end-date"
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Optimize Portfolio'}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {results && (
              <div className="w-full text-left space-y-2">
                <h3 className="text-lg font-semibold">Optimization Results:</h3>
                <p>Expected Return: {(results.expected_return * 100).toFixed(2)}%</p>
                <p>Risk: {(results.risk * 100).toFixed(2)}%</p>
                <p>Sharpe Ratio: {results.sharpe_ratio.toFixed(2)}</p>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
