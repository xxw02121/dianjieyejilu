'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface RecordCardProps {
    record: {
        id: string
        title: string
        created_at: string
        research_type: string
        tags: string[] | null
        des_formulas?: any[]
        hydrogel_formulas?: any[]
        test_results?: any[]
    }
}

export function RecordCard({ record }: RecordCardProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // 阻止跳转
        e.stopPropagation()

        setIsDeleting(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('experiment_records')
                .delete()
                .eq('id', record.id)

            if (error) throw error

            router.refresh()
        } catch (error) {
            console.error('删除失败:', error)
            alert('删除失败，请重试')
        } finally {
            setIsDeleting(false)
        }
    }

    // 提取显示信息
    const getPreviewInfo = () => {
        // DES 配方预览
        if (record.research_type === 'des_electrolyte' && record.des_formulas?.[0]) {
            const f = record.des_formulas[0]
            const parts = []

            // 基础配方 HBA:HBD
            if (f.hba_name && f.hbd_name) parts.push(`${f.hba_name}:${f.hbd_name}`)
            if (f.molar_ratio) parts.push(`(${f.molar_ratio})`)

            // 盐
            if (f.salt_name) parts.push(`+ ${f.salt_name}`)

            // 水含量
            if (f.water_content) parts.push(`+ ${f.water_content}${f.water_content_unit || 'wt%'} H₂O`)

            // 添加剂
            if (f.additives) {
                if (Array.isArray(f.additives) && f.additives.length > 0) {
                    parts.push(`+ ${f.additives.join(', ')}`)
                } else if (typeof f.additives === 'object' && f.additives.text) {
                    parts.push(`+ ${f.additives.text}`)
                }
            }

            return parts.join(' ')
        }

        // 水凝胶配方预览
        if (record.research_type === 'hydrogel' && record.hydrogel_formulas?.[0]) {
            const f = record.hydrogel_formulas[0]
            const parts = []
            if (f.polymer_type) parts.push(f.polymer_type)
            if (f.crosslink_method) parts.push(`(${f.crosslink_method})`)
            return parts.join(' ')
        }

        return '点击查看详情'
    }

    // 提取结果预览
    const getResultPreview = () => {
        if (record.test_results?.[0]?.conclusion) {
            return record.test_results[0].conclusion
        }
        return null
    }

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative group">
            <Link href={`/records/${record.id}`} className="block h-full">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-2 text-lg pr-8">{record.title}</CardTitle>
                        {record.research_type && (
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2  ${record.research_type === 'des_electrolyte' ? 'bg-blue-100 text-blue-700' :
                                record.research_type === 'hydrogel' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {record.research_type === 'des_electrolyte' ? 'DES' :
                                    record.research_type === 'hydrogel' ? '水凝胶' : '其他'}
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        {formatDateTime(record.created_at)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 配方预览区 */}
                    <div className="mb-3 p-2 bg-slate-50 rounded-md text-sm text-slate-700">
                        <div className="font-semibold text-xs text-slate-500 mb-1">配方</div>
                        <div className="line-clamp-2">{getPreviewInfo()}</div>
                    </div>

                    {/* 结论预览区 */}
                    {getResultPreview() && (
                        <div className="mb-3 p-2 bg-orange-50 rounded-md text-sm text-orange-800">
                            <div className="font-semibold text-xs text-orange-500 mb-1">结论</div>
                            <div className="line-clamp-2">{getResultPreview()}</div>
                        </div>
                    )}

                    {/* 标签 */}
                    {record.tags && record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {record.tags.slice(0, 3).map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-0.5 rounded-md border text-muted-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                            {record.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                    +{record.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Link>

            {/* 删除按钮 - 浮动在右上角 */}
            <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="h-8 w-8 p-0 shadow-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <Trash2Icon className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认删除这条记录吗？</AlertDialogTitle>
                            <AlertDialogDescription>
                                此操作无法撤销。这将永久删除该实验记录及其所有关联数据（配方、结果、附件）。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>取消</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? '删除中...' : '确认删除'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    )
}
