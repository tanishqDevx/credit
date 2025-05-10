"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DailyTransactions } from "@/components/daily-transactions"
import { DailyCharts } from "@/components/daily-charts"

interface DailySummary {
  date: string
  total_sales: number
  total_cash: number
  total_hdfc: number
  total_gpay: number
  total_payment: number
  total_received: number
  total_outstanding: number
  net_cash_flow: number
}

export default function DailyReportPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params) // Unwrap the promise
  const formattedDate = date.replace(/-/g, "/")
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const response = await fetch(`https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/reports/daily/${date}`)
        if (!response.ok) {
          throw new Error("Failed to fetch daily summary")
        }
        const data = await response.json()
        setDailySummary(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load daily summary. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailySummary()
  }, [date, toast])

  const exportDailyReport = () => {
    toast({
      title: "Export started",
      description: `Your daily report for ${formattedDate} is being exported to CSV`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        href="/reports"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to reports
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Daily Report: {formattedDate}</h1>
          <p className="text-muted-foreground">Summary and transactions for this day</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={exportDailyReport}>
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
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
        dailySummary && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Gross sales amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cash Received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_cash.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total cash payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>HDFC Received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_hdfc.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total HDFC payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>GPay Received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_gpay.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total GPay payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_received.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Cash + HDFC + GPay</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New Outstanding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_outstanding.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">New credit given today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailySummary.total_payment.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Net Cash Flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${dailySummary.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{dailySummary.net_cash_flow.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Received - Expenses</p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <DailyTransactions date={date} />
        </TabsContent>
        <TabsContent value="charts" className="mt-4">
          <DailyCharts date={date} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
