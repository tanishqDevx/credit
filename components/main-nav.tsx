"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, FileSpreadsheet, Home, Menu, PieChart, Upload, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <CreditCard className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Credit Tracker</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/upload" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Upload
            </Link>
            <Link
              href="/credits"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/credits") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Credits
            </Link>
            <Link
              href="/transactions"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/transactions" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Transactions
            </Link>
            <Link
              href="/reports"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/reports") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Reports
            </Link>
          </nav>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav onClose={() => setOpen(false)} pathname={pathname} />
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
          <CreditCard className="h-6 w-6" />
          <span className="font-bold">Credit Tracker</span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <Button variant="outline" size="sm" className="ml-auto">
            Log out
          </Button>
        </div>
      </div>
    </header>
  )
}

function MobileNav({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  return (
    <div className="grid gap-2 py-6">
      <div className="flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
          <CreditCard className="h-6 w-6" />
          <span className="font-bold">Credit Tracker</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="grid gap-1 px-2">
        <Link
          href="/"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            pathname === "/" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/upload"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            pathname === "/upload"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Upload className="h-5 w-5" />
          Upload
        </Link>
        <Link
          href="/credits"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            pathname.startsWith("/credits")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <CreditCard className="h-5 w-5" />
          Credits
        </Link>
        <Link
          href="/transactions"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            pathname === "/transactions"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          Transactions
        </Link>
        <Link
          href="/reports"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            pathname.startsWith("/reports")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <PieChart className="h-5 w-5" />
          Reports
        </Link>
      </div>
    </div>
  )
}
