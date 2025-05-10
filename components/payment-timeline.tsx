"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface TimelineData {
  date: string
  balance: number
}

interface PaymentMethod {
  method: string
  percentage: number
}

export function PaymentTimeline({ customerName }: { customerName: string }) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/credits/${encodeURIComponent(customerName)}/timeline`)
        if (!response.ok) {
          throw new Error("Failed to fetch timeline data")
        }
        const data = await response.json()
        setTimelineData(data.timeline)
        setPaymentMethods(data.payment_methods)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load payment timeline data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimelineData()
  }, [customerName, toast])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>Visualizing credit balance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : timelineData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">No timeline data available</p>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Chart visualization would appear here</p>
                <p className="text-sm mt-2">Using Recharts in a real implementation</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit Health Indicators</CardTitle>
          <CardDescription>Payment consistency and behavior metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Payment Consistency Score</span>
                  <span className="text-sm font-medium">7/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "70%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on payment regularity and completeness</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Average Days to Pay</span>
                  <span className="text-sm font-medium">15 days</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "85%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average time between sale and payment</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Payment Method Breakdown</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {paymentMethods.length === 0 ? (
                    <div className="col-span-3 text-center py-2 text-muted-foreground">
                      No payment method data available
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.method} className="rounded-lg bg-muted p-2">
                        <div className="text-lg font-bold">{method.percentage}%</div>
                        <div className="text-xs text-muted-foreground">{method.method}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
