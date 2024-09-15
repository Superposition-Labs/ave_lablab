"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex"> 
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.superposition className="h-7" />
        <span className="hidden font-bold lg:inline-block">
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/docs"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/docs" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Docs
        </Link>
        
        <Link
          href="/themes"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/themes")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Agents
        </Link>
        <Link
          href="/examples"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/examples")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Services
        </Link>
        <Link
          href="/colors"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/colors")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          AI Communities
        </Link>
      </nav>
    </div>
  )
}
