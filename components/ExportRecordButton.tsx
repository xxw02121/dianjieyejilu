'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'

type Props = {
    record: any
    desFormula?: any
    hydrogelFormula?: any
    results?: any[]
    filename?: string
}

function escapeCsv(value: any) {
    const str = value === undefined || value === null ? '' : String(value)
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function stringifyCsv(rows: string[][]) {
    return rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
}

export function ExportRecordButton({
    record,
    desFormula,
    hydrogelFormula,
    results,
    filename = 'record.csv',
}: Props) {
    const handleExport = useCallback(() => {
        try {
            const rows: string[][] = []
            rows.push(['分类', '字段', '值'])

            rows.push(['基础信息', '标题', record?.title || ''])
            rows.push(['基础信息', '研究类型', record?.research_type || ''])
            rows.push(['基础信息', '创建时间', record?.created_at || ''])
            rows.push(['基础信息', '标签', Array.isArray(record?.tags) ? record.tags.join('; ') : ''])

            if (desFormula) {
                rows.push(['DES 电解液', 'HBA', desFormula.hba_name || ''])
                rows.push(['DES 电解液', 'HBD', desFormula.hbd_name || ''])
                rows.push(['DES 电解液', '摩尔比', desFormula.molar_ratio || ''])
                rows.push(['DES 电解液', '盐名称', desFormula.salt_name || ''])
                rows.push(['DES 电解液', '盐浓度', desFormula.salt_concentration || ''])
                rows.push([
                    'DES 电解液',
                    '水含量',
                    desFormula.water_content
                        ? `${desFormula.water_content} ${desFormula.water_content_unit || ''}`
                        : '',
                ])
                rows.push([
                    'DES 电解液',
                    '添加剂',
                    Array.isArray(desFormula.additives)
                        ? desFormula.additives.join('; ')
                        : desFormula.additives?.text || '',
                ])
                rows.push(['DES 电解液', '备注', desFormula.notes || ''])
            }

            if (hydrogelFormula) {
                rows.push(['水凝胶', '聚合物类型', hydrogelFormula.polymer_type || ''])
                rows.push(['水凝胶', '交联方式', hydrogelFormula.crosslink_method || ''])
                rows.push(['水凝胶', '备注', hydrogelFormula.notes || ''])
            }

            if (results && results.length) {
                results.forEach((res, idx) => {
                    rows.push([
                        `测试结果${results.length > 1 ? `#${idx + 1}` : ''}`,
                        '结论',
                        res.conclusion || '',
                    ])
                    rows.push([
                        `测试结果${results.length > 1 ? `#${idx + 1}` : ''}`,
                        '失败原因',
                        res.failure_reason || '',
                    ])
                })
            }

            // 预置 UTF-8 BOM 以避免 Excel 打开乱码
            const csv = '\uFEFF' + stringifyCsv(rows)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
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
    }, [desFormula, filename, hydrogelFormula, record, results])

    return (
        <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出表格
        </Button>
    )
}
