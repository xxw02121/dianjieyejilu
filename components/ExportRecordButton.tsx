'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'

type ExportItem = {
    record: any
    desFormula?: any
    hydrogelFormula?: any
    results?: any[]
}

type Props = {
    items: ExportItem[]
    filename?: string
    disabled?: boolean
}

function escapeCell(value: any) {
    const str = value === undefined || value === null ? '' : String(value)
    if (/["\t\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function stringifyTsv(rows: string[][]) {
    return rows.map((row) => row.map(escapeCell).join('\t')).join('\r\n')
}

function toUtf16LeBytes(str: string) {
    const buffer = new Uint8Array(str.length * 2)
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        buffer[i * 2] = code & 0xff
        buffer[i * 2 + 1] = code >> 8
    }
    return buffer
}

export function ExportRecordButton({ items, filename = 'records.tsv', disabled }: Props) {
    const handleExport = useCallback(() => {
        try {
            const rows: string[][] = []
            rows.push([
                '标题',
                '研究类型',
                '创建时间',
                '标签',
                'HBA',
                'HBD',
                '摩尔比',
                '盐名称',
                '盐浓度',
                '水含量',
                '添加剂',
                'DES 备注',
                '聚合物类型',
                '交联方式',
                '水凝胶备注',
                '测试结论',
                '失败原因',
            ])

            items.forEach((item) => {
                const record = item.record
                const desSource = item.desFormula || record?.des_formulas
                const hydrogelSource = item.hydrogelFormula || record?.hydrogel_formulas
                const resSource = item.results || record?.test_results || []

                const des = Array.isArray(desSource) ? desSource[0] : desSource
                const hydrogel = Array.isArray(hydrogelSource) ? hydrogelSource[0] : hydrogelSource
                const resList = Array.isArray(resSource) ? resSource : []

                const conclusions = Array.isArray(resList)
                    ? resList.map((r: any) => r?.conclusion).filter(Boolean).join('\n')
                    : ''
                const failures = Array.isArray(resList)
                    ? resList.map((r: any) => r?.failure_reason).filter(Boolean).join('\n')
                    : ''

                rows.push([
                    record?.title || '',
                    record?.research_type || '',
                    record?.created_at || '',
                    Array.isArray(record?.tags) ? record.tags.join('; ') : '',
                    des?.hba_name || '',
                    des?.hbd_name || '',
                    des?.molar_ratio || '',
                    des?.salt_name || '',
                    des?.salt_concentration || '',
                    des?.water_content ? `${des.water_content} ${des.water_content_unit || ''}` : '',
                    Array.isArray(des?.additives)
                        ? des.additives.join('; ')
                        : des?.additives?.text || '',
                    des?.notes || '',
                    hydrogel?.polymer_type || '',
                    hydrogel?.crosslink_method || '',
                    hydrogel?.notes || '',
                    conclusions,
                    failures,
                ])
            })

            const tsv = '\uFEFF' + stringifyTsv(rows)
            const encoded = toUtf16LeBytes(tsv)
            const blob = new Blob([encoded], { type: 'text/tab-separated-values;charset=utf-16le;' })
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
    }, [filename, items])

    return (
        <Button variant="outline" onClick={handleExport} disabled={disabled || items.length === 0}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出表格
        </Button>
    )
}
