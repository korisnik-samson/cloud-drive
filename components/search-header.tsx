"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Bell, Menu, Moon, Search, Sun } from "lucide-react"
import { useState } from "react"

interface SearchHeaderProps {
    onMenuClick?: () => void
}

export function SearchHeader({ onMenuClick }: SearchHeaderProps) {
    const [theme, setTheme] = useState<"light" | "dark">("light")

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
    }

    return (
        <header className="flex items-center gap-4 h-16 px-4 md:px-6 border-b border-border/50 bg-background">
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5"/>
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search files and folders..."
                        className="pl-10 bg-muted/50 border-transparent focus:border-border focus:bg-background"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === "light" ? (
                        <Moon className="h-5 w-5"/>
                    ) : (
                        <Sun className="h-5 w-5"/>
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="h-5 w-5"/>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
