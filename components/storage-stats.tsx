"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileArchive, FileImage, FileText, FileVideo, Music } from "lucide-react"

const storageData = [
    { type: "Images", size: "12.5 GB", percentage: 35, icon: FileImage, color: "bg-emerald-500" },
    { type: "Videos", size: "8.2 GB", percentage: 23, icon: FileVideo, color: "bg-rose-500" },
    { type: "Documents", size: "5.8 GB", percentage: 16, icon: FileText, color: "bg-blue-500" },
    { type: "Audio", size: "3.1 GB", percentage: 9, icon: Music, color: "bg-amber-500" },
    { type: "Archives", size: "2.4 GB", percentage: 7, icon: FileArchive, color: "bg-orange-500" },
]

export function StorageStats() {
    const totalUsed = 32
    const totalCapacity = 100
    const usagePercentage = (totalUsed / totalCapacity) * 100

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{totalUsed} GB used</span>
                        <span className="text-muted-foreground">{totalCapacity} GB</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2"/>
                </div>

                <div className="space-y-3">
                    {storageData.map((item) => (
                        <div key={item.type} className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${item.color}/10`}>
                                <item.icon className={`h-4 w-4 ${item.color.replace("bg-", "text-")}`}/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                                    <span className="text-sm text-muted-foreground">{item.size}</span>
                                </div>
                                <Progress value={item.percentage} className="h-1 mt-1"/>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    Upgrade Storage
                </button>
            </CardContent>
        </Card>
    )
}
