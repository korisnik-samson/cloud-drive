"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"
import { Fragment } from "react"

interface BreadcrumbNavProps {
    path: string[]
}

export function BreadcrumbNav({ path }: BreadcrumbNavProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1.5">
                        <Home className="h-4 w-4"/>
                        <span className="sr-only">Home</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {path.map((item, index) => (
                    <Fragment key={item}>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            {index === path.length - 1 ? (
                                <BreadcrumbPage>{item}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
