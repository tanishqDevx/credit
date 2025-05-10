"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Credit {
  customer_name: string
  total_outstanding: number
  first_date: string
  last_date: string
  days_outstanding: number
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([])
  const [filteredCredits, setFilteredCredits] = useState<Credit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("https://sequence-additionally-mouse-unsubscribe.trycloudflare.com/api/credits")
        if (!response.ok) {
          throw new Error("Failed to fetch credits")
        }
        const data = await response.json()
        setCredits(data)
        setFilteredCredits(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load credit data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredits()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCredits(credits)
    } else {
      const filtered = credits.filter((credit) =>
        credit.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCredits(filtered)
    }
  }, [searchQuery, credits])

  const getStatusClass = (days: number) => {
    if (days > 90) return "text-red-800"
    if (days > 30) return "text-yellow-800"
    return "text-green-800"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Outstanding Credits</h1>
        <p className="text-muted-foreground">Track customer credits and payment history</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded border p-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCredits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No outstanding credits found</p>
            </div>
          ) : (
            filteredCredits.map((credit) => (
              <Link
                key={credit.customer_name}
                href={`/credits/${encodeURIComponent(credit.customer_name)}`}
                className="flex items-center justify-between rounded border p-3 hover:bg-muted transition-colors"
              >
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{credit.customer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {parseInt(credit.days_outstanding.toString())} days • Last:{" "}
                    {new Date(credit.last_date).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`ml-4 text-2xl font-semibold ${getStatusClass(credit.days_outstanding)}`}
                >
                  ₹{credit.total_outstanding.toLocaleString()}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
