"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, ChevronRight } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { useToast } from "@/components/ui/use-toast"

interface DailyReport {
  date: string
  total_sales: number
  total_received: number
  total_expenses: number
  net_cash_flow: number
}

export function DailyReportsList({ dateRange }: { dateRange: DateRange | undefined }) {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        let url = "https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/reports/daily"

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
          throw new Error("Failed to fetch daily reports")
        }
        const data = await response.json()
        setReports(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load daily reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [dateRange, toast])

  return (
    <div className="space-y-1">
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Loading daily reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No daily reports found for the selected date range</p>
        </div>
      ) : (
        reports.map((report) => (
          <Link
            key={report.date}
            href={`/reports/daily/${report.date}`}
            className="flex items-center justify-between p-3 rounded-md hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{new Date(report.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  Sales: ₹{report.total_sales.toLocaleString()} • Received: ₹{report.total_received.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-sm font-medium ${report.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{report.net_cash_flow.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
