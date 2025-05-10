import Link from "next/link"
import { CreditCard, FileSpreadsheet, PieChart, Upload } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DailySummary } from "@/components/daily-summary"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Credit Tracking Dashboard</h1>
        <p className="text-muted-foreground">Upload daily reports and track transactions</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Report</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Daily XLSX</div>
            <p className="text-xs text-muted-foreground">Upload your daily transaction data</p>
            <Button asChild className="w-full mt-4">
              <Link href="/upload">Upload File</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Outstanding</div>
            <p className="text-xs text-muted-foreground">Track customer credits and payments</p>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/credits">View Credits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All Records</div>
            <p className="text-xs text-muted-foreground">View all transaction history</p>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/transactions">View Transactions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Analytics</div>
            <p className="text-xs text-muted-foreground">View reports and statistics</p>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <DailySummary />
    </div>
  )
}
