"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { DailyReportsList } from "@/components/daily-reports-list"
import { SummaryCharts } from "@/components/summary-charts"

interface SummaryStats {
  total_sales: number
  total_received: number
  total_outstanding: number
  total_expenses: number
  net_cash_flow: number
  date_range: {
    from: string
    to: string
  }
}

export default function ReportsPage() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSummaryStats = async () => {
      setIsLoading(true)
      try {
        let url = "https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/reports/summary"

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
          throw new Error("Failed to fetch summary statistics")
        }
        const data = await response.json()
        setSummaryStats(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load summary statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummaryStats()
  }, [dateRange, toast])

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Reports & Analytics</h1>
          <p className="text-muted-foreground">View summary statistics and daily reports</p>
        </div>
        <div>
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        summaryStats && (
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{summaryStats.total_sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Gross sales amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{summaryStats.total_received.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Cash + HDFC + GPay</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Outstanding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{summaryStats.total_outstanding.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Credit given to customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{summaryStats.total_expenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Net Cash Flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${summaryStats.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{summaryStats.net_cash_flow.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Received - Expenses</p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Summary Charts</CardTitle>
            <CardDescription>Visual representation of your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryCharts dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Reports</CardTitle>
          <CardDescription>View detailed reports for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyReportsList dateRange={dateRange} />
        </CardContent>
      </Card>
    </div>
  )
}
