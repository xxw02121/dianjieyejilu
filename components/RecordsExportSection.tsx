'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExportRecordButton } from '@/components/ExportRecordButton'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { RecordCard } from '@/components/RecordCard'

type Props = {
    records: any[]
}

export function RecordsExportSection({ records }: Props) {
    const [selected, setSelected] = useState<Set<string>>(new Set())

    useEffect(() => {
        setSelected(new Set(records.map((r) => r.id)))
    }, [records])

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === records.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(records.map((r) => r.id)))
        }
    }

    const selectedItems = useMemo(
        () =>
            records
                .filter((r) => selected.has(r.id))
                .map((r) => ({
                    record: r,
                    desFormula: r.des_formulas,
                    hydrogelFormula: r.hydrogel_formulas,
                    results: r.test_results,
                })),
        [records, selected]
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={toggleAll}>
                    {selected.size === records.length ? '取消全选' : '全选'}
                </Button>
                <span className="text-sm text-muted-foreground">
                    已选 {selected.size}/{records.length}
                </span>
                <ExportRecordButton
                    items={selectedItems}
                    filename="records.tsv"
                    disabled={selectedItems.length === 0}
                />
                <Button size="sm" asChild>
                    <Link href="/records/new">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        新建记录
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {records.map((record) => {
                    const checked = selected.has(record.id)
                    return (
                        <div key={record.id} className="relative">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 rounded-md p-1 shadow-sm">
                                <Checkbox checked={checked} onCheckedChange={() => toggle(record.id)} />
                            </div>
                            <RecordCard record={record} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
