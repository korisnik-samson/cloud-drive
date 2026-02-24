import React from "react"
import { File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, Folder, Presentation, } from "lucide-react"

interface FileIconProps {
    type: string
    className?: string
}

export function FileIcon({ type, className = "h-5 w-5" }: FileIconProps) {
    const iconMap: Record<string, React.ReactNode> = {
        folder: <Folder className={`${className} text-primary`}/>,
        document: <FileText className={`${className} text-blue-500`}/>,
        image: <FileImage className={`${className} text-emerald-500`}/>,
        video: <FileVideo className={`${className} text-rose-500`}/>,
        audio: <FileAudio className={`${className} text-amber-500`}/>,
        archive: <FileArchive className={`${className} text-orange-500`}/>,
        code: <FileCode className={`${className} text-cyan-500`}/>,
        spreadsheet: <FileSpreadsheet className={`${className} text-green-500`}/>,
        presentation: <Presentation className={`${className} text-red-500`}/>,
        default: <File className={`${className} text-muted-foreground`}/>,
    }

    return iconMap[type] || iconMap.default
}
