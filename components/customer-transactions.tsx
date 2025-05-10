"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

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

export function CustomerTransactions({ customerName }: { customerName: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/transactions/customer/${encodeURIComponent(customerName)}`,
        )
        if (!response.ok) {
          throw new Error("Failed to fetch customer transactions")
        }
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customer transactions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [customerName, toast])

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No transactions found for this customer
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
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
