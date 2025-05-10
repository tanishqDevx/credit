import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TransactionHistory({ customerId }: { customerId: string }) {
  // In a real app, we would fetch the transaction history based on the customer ID
  const transactions = MOCK_TRANSACTIONS.filter((t) => t.customerId === customerId)

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 bg-muted/50 flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="font-medium">Transaction History</h3>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Filter
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-y">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Cash</th>
              <th className="px-4 py-3 text-right text-sm font-medium">HDFC</th>
              <th className="px-4 py-3 text-right text-sm font-medium">GPay</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">{transaction.date}</td>
                <td className="px-4 py-3 text-sm capitalize">{transaction.type}</td>
                <td className="px-4 py-3 text-sm text-right">
                  {transaction.amount > 0 ? `₹${transaction.amount.toLocaleString()}` : "-"}
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
                <td className="px-4 py-3 text-sm text-right font-medium">₹{transaction.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MOCK_TRANSACTIONS = [
  {
    id: "1-1",
    customerId: "1",
    date: "2023-07-05",
    type: "sale",
    amount: 130300,
    cash: 50000,
    hdfc: 20000,
    gpay: 0,
    balance: 60300,
  },
  {
    id: "1-2",
    customerId: "1",
    date: "2023-07-12",
    type: "payment",
    amount: 0,
    cash: 20000,
    hdfc: 0,
    gpay: 10000,
    balance: 30300,
  },
  {
    id: "1-3",
    customerId: "1",
    date: "2023-07-20",
    type: "sale",
    amount: 50000,
    cash: 10000,
    hdfc: 0,
    gpay: 10000,
    balance: 60300,
  },
  {
    id: "2-1",
    customerId: "2",
    date: "2023-08-12",
    type: "sale",
    amount: 75000,
    cash: 20000,
    hdfc: 10000,
    gpay: 0,
    balance: 45000,
  },
  {
    id: "2-2",
    customerId: "2",
    date: "2023-08-25",
    type: "payment",
    amount: 0,
    cash: 0,
    hdfc: 0,
    gpay: 0,
    balance: 45000,
  },
  {
    id: "3-1",
    customerId: "3",
    date: "2023-06-18",
    type: "sale",
    amount: 98500,
    cash: 10000,
    hdfc: 10000,
    gpay: 0,
    balance: 78500,
  },
  {
    id: "3-2",
    customerId: "3",
    date: "2023-07-05",
    type: "payment",
    amount: 0,
    cash: 10000,
    hdfc: 0,
    gpay: 0,
    balance: 68500,
  },
  {
    id: "3-3",
    customerId: "3",
    date: "2023-08-01",
    type: "payment",
    amount: 0,
    cash: 0,
    hdfc: 0,
    gpay: 10000,
    balance: 78500,
  },
]
