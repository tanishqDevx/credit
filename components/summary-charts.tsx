"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChartData {
  dates: string[]
  sales: number[]
  received: number[]
  expenses: number[]
  outstanding: number[]
  net_cash_flow: number[]
}

export function SummaryCharts({ dateRange }: { dateRange: DateRange | undefined }) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        let url = "https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/reports/charts"

        if (dateRange?.from || dateRange?.to) {
          const params = new URLSearchParams()
          if (dateRange.from) {
            params.append("from_date", dateRange.from.toISOString().split("T")[0])
          }
          if (dateRange.to) {
            params.append("to_date", dateRange.to.toISOString().split("T")[0])
          }
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
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
  }, [dateRange, toast])

  return (
    <Tabs defaultValue="sales">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="received">Received</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
      </TabsList>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      ) : !chartData ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No chart data available for the selected date range</p>
        </div>
      ) : (
        <>
          <TabsContent value="sales" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Line chart visualization would appear here</p>
                    <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                    <p className="text-sm mt-4">Sales over time: {chartData.dates.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Line chart visualization would appear here</p>
                    <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                    <p className="text-sm mt-4">Received payments over time: {chartData.dates.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Bar chart visualization would appear here</p>
                    <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                    <p className="text-sm mt-4">Expenses over time: {chartData.dates.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outstanding" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Line chart visualization would appear here</p>
                    <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                    <p className="text-sm mt-4">Outstanding credits over time: {chartData.dates.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Area chart visualization would appear here</p>
                    <p className="text-sm mt-2">Using Recharts in a real implementation</p>
                    <p className="text-sm mt-4">Net cash flow over time: {chartData.dates.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )}
    </Tabs>
  )
}
