"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ChartData {
  payment_methods: {
    method: string
    amount: number
    percentage: number
  }[]
  transaction_types: {
    type: string
    count: number
    percentage: number
  }[]
}

export function DailyCharts({ date }: { date: string }) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/reports/daily/${date}/charts`)
        if (!response.ok) {
          throw new Error("Failed to fetch chart data")
        }
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load chart data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [date, toast])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
          <CardDescription>Breakdown of payment methods used</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !chartData || chartData.payment_methods.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">No payment method data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Pie chart visualization would appear here</p>
                  <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {chartData.payment_methods.map((method) => (
                  <div key={method.method} className="rounded-lg bg-muted p-2">
                    <div className="text-lg font-bold">{method.percentage}%</div>
                    <div className="text-xs text-muted-foreground">{method.method}</div>
                    <div className="text-sm">₹{method.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Type Distribution</CardTitle>
          <CardDescription>Breakdown of transaction types</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !chartData || chartData.transaction_types.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">No transaction type data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Bar chart visualization would appear here</p>
                  <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {chartData.transaction_types.map((type) => (
                  <div key={type.type} className="rounded-lg bg-muted p-2">
                    <div className="text-lg font-bold">{type.percentage}%</div>
                    <div className="text-xs text-muted-foreground capitalize">{type.type}</div>
                    <div className="text-sm">{type.count} transactions</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
