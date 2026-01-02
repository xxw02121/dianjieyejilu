'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'

type Props = {
    data: any
    filename?: string
}

export function ExportRecordButton({ data, filename = 'record.json' }: Props) {
    const handleExport = useCallback(() => {
        try {
            const payload = JSON.stringify(data, null, 2)
            const blob = new Blob([payload], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('导出记录失败', err)
            alert('导出失败，请稍后再试')
        }
    }, [data, filename])

    return (
        <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出
        </Button>
    )
}
