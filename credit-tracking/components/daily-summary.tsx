"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface DailySummary {
  date: string
  total_sales: number
  total_received: number
  total_outstanding: number
  total_expenses: number
  net_cash_flow: number
}

export function DailySummary() {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchLatestSummary = async () => {
      try {
        const response = await fetch("https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/reports/latest")
        if (!response.ok) {
          throw new Error("Failed to fetch latest summary")
        }
        const data = await response.json()
        setSummary(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load latest summary data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestSummary()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Daily Summary</CardTitle>
          <CardDescription>Loading latest data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Daily Summary</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Upload your first daily report to see summary statistics
          </p>
          <Button asChild className="w-full">
            <Link href="/upload">Upload Report</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formattedDate = new Date(summary.date).toLocaleDateString()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Latest Daily Summary</CardTitle>
          <CardDescription>For {formattedDate}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={`/reports/daily/${summary.date}`}>
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sales</p>
            <p className="text-xl font-bold">₹{summary.total_sales.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Received</p>
            <p className="text-xl font-bold">₹{summary.total_received.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
            <p className="text-xl font-bold">₹{summary.total_outstanding.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold">₹{summary.total_expenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
            <p className={`text-xl font-bold ${summary.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{summary.net_cash_flow.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
