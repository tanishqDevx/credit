"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CustomerTransactions } from "@/components/customer-transactions"
import { PaymentTimeline } from "@/components/payment-timeline"

interface CustomerCredit {
  customer_name: string
  total_outstanding: number
  first_date: string
  last_date: string
  days_outstanding: number
  status: string
}

export default function CustomerCreditPage({ params }: { params: { customer: string } }) {
  const customerName = decodeURIComponent(params.customer)
  const [creditDetails, setCreditDetails] = useState<CustomerCredit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCreditDetails = async () => {
      try {
        const response = await fetch(`https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/credits/${encodeURIComponent(customerName)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch credit details")
        }
        const data = await response.json()
        setCreditDetails(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customer credit details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreditDetails()
  }, [customerName, toast])

  const getStatusClass = (status: string) => {
    if (status === "Overdue") return "text-red-600"
    if (status === "Warning") return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        href="/credits"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to credits
      </Link>

      {isLoading ? (
        <>
          <div className="mb-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{customerName}</h1>
                <p className="text-muted-foreground">Credit details and transaction history</p>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Export History</span>
              </Button>
            </div>
          </div>

          {creditDetails && (
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Outstanding Balance</CardDescription>
                  <CardTitle className="text-3xl">₹{creditDetails.total_outstanding.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Active since {new Date(creditDetails.first_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Credit Status</CardDescription>
                  <CardTitle className={getStatusClass(creditDetails.status)}>{creditDetails.status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {creditDetails.status === "Good"
                      ? "Payments are on schedule"
                      : creditDetails.status === "Warning"
                        ? "Payment overdue by 30+ days"
                        : "Payment overdue by 90+ days"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last Activity</CardDescription>
                  <CardTitle>{new Date(creditDetails.last_date).toLocaleDateString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Outstanding for {creditDetails.days_outstanding} days
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-auto">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="timeline">Payment Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-4">
              <CustomerTransactions customerName={customerName} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <PaymentTimeline customerName={customerName} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
