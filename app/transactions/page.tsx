"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"

interface Transaction {
  id: number
  date: string
  customer_name: string
  sales: number
  cash: number
  hdfc: number
  gpay: number
  payment: number
  transaction_type: string
  outstanding: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const data = await response.json()
        setTransactions(data)
        setFilteredTransactions(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transaction data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [toast])

  useEffect(() => {
    let filtered = [...transactions]

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((transaction) =>
        transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by transaction type
    if (transactionType !== "all") {
      filtered = filtered.filter((transaction) => transaction.transaction_type === transactionType)
    }

    // Filter by date range
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= fromDate
      })
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate <= toDate
      })
    }

    setFilteredTransactions(filtered)
  }, [searchQuery, transactionType, dateRange, transactions])

  const exportTransactions = () => {
    // In a real app, this would generate a CSV file
    toast({
      title: "Export started",
      description: "Your transactions are being exported to CSV",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Transactions</h1>
          <p className="text-muted-foreground">View and filter all transaction records</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={exportTransactions}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Transaction Type</label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="repayment">Repayments</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Sales</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Cash</th>
                <th className="px-4 py-3 text-right text-sm font-medium">HDFC</th>
                <th className="px-4 py-3 text-right text-sm font-medium">GPay</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Payment</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/credits/${encodeURIComponent(transaction.customer_name)}`}
                        className="text-primary hover:underline"
                      >
                        {transaction.customer_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{transaction.transaction_type}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {transaction.sales > 0 ? `₹${transaction.sales.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {transaction.cash > 0 ? `₹${transaction.cash.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {transaction.hdfc > 0 ? `₹${transaction.hdfc.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {transaction.gpay > 0 ? `₹${transaction.gpay.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {transaction.payment > 0 ? `₹${transaction.payment.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {transaction.outstanding > 0 ? `₹${transaction.outstanding.toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
