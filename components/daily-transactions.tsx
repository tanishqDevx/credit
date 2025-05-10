"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function DailyTransactions({ date }: { date: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [transactionType, setTransactionType] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/transactions/date/${date}`)
        if (!response.ok) {
          throw new Error("Failed to fetch daily transactions")
        }
        const data = await response.json()
        setTransactions(data)
        setFilteredTransactions(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load daily transactions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [date, toast])

  useEffect(() => {
    if (transactionType === "all") {
      setFilteredTransactions(transactions)
    } else {
      const filtered = transactions.filter((transaction) => transaction.transaction_type === transactionType)
      setFilteredTransactions(filtered)
    }
  }, [transactionType, transactions])

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 bg-muted/50 flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="font-medium">Daily Transactions</h3>
        <div>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
              <SelectItem value="repayment">Repayments</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-y">
            <tr>
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
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No transactions found for this day
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{transaction.customer_name}</td>
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
  )
}
