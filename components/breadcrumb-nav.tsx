"use client";

import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
    id: string | null;
    label: string;
};

export function BreadcrumbNav({ items, onNavigate }: { items: BreadcrumbItem[]; onNavigate?: (id: string | null, index: number) => void; }) {
    return (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {items?.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center gap-1">
                    {index === 0 ? <Home className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}

                    <button className={cn("hover:text-foreground transition-colors", index === items.length - 1 && "text-foreground font-medium")}
                        onClick={() => onNavigate?.(item.id, index)}
                        type="button">
                        {item.label}
                    </button>
                </div>
            ))}
        </nav>
    );
}
