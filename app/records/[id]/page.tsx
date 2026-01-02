import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeftIcon, EditIcon, Share2Icon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default async function RecordDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 获取记录详情
    const { data: recordData } = await supabase
        .from('experiment_records')
        .select(`
            *,
            des_formulas(hba_name, hbd_name, molar_ratio, salt_name, water_content, water_content_unit, additives),
            hydrogel_formulas(polymer_type, crosslink_method),
            test_results(conclusion)
        `)
        .eq('id', params.id)
        .single()

    const record = recordData as any

    if (!record) {
        notFound()
    }

    // 获取DES配方
    const { data: desFormula } = await supabase
        .from('des_formulas')
        .select('*')
        .eq('record_id', params.id)
        .single()

    // 获取水凝胶配方
    const { data: hydrogelFormula } = await supabase
        .from('hydrogel_formulas')
        .select('*')
        .eq('record_id', params.id)
        .single()

    // 获取测试结果
    const { data: results } = await supabase
        .from('test_results')
        .select('*')
        .eq('record_id', params.id)

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            返回仪表盘
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/records/${params.id}/edit`}>
                                <EditIcon className="h-4 w-4 mr-2" />
                                编辑
                            </Link>
                        </Button>
                        <Button>
                            <Share2Icon className="h-4 w-4 mr-2" />
                            分享
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* 标题区域 */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{record.title}</h1>
                    <p className="text-muted-foreground">
                        创建于 {formatDateTime(record.created_at)}
                    </p>
                    {record.tags && record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {record.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* DES 配方 */}
                    {desFormula && (
                        <Card>
                            <CardHeader>
                                <CardTitle>DES 电解液配方</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {desFormula.hba_name && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">HBA（氢键受体）</h4>
                                        <p>{desFormula.hba_name}</p>
                                    </div>
                                )}
                                {desFormula.hbd_name && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">HBD（氢键供体）</h4>
                                        <p>{desFormula.hbd_name}</p>
                                    </div>
                                )}
                                {desFormula.molar_ratio && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">摩尔比</h4>
                                        <p>{desFormula.molar_ratio}</p>
                                    </div>
                                )}
                                {desFormula.salt_name && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">盐名称</h4>
                                            <p>{desFormula.salt_name}</p>
                                        </div>
                                        {desFormula.salt_concentration && (
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">盐浓度</h4>
                                                <p>{desFormula.salt_concentration}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {(desFormula.water_content || desFormula.additives) && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {desFormula.water_content && (
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">水含量</h4>
                                                <p>{desFormula.water_content} {desFormula.water_content_unit || 'wt%'}</p>
                                            </div>
                                        )}
                                        {desFormula.additives && (
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">添加剂</h4>
                                                <p>
                                                    {Array.isArray(desFormula.additives)
                                                        ? desFormula.additives.join(', ')
                                                        : (desFormula.additives.text || JSON.stringify(desFormula.additives))
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {desFormula.notes && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">制备备注</h4>
                                        <p className="whitespace-pre-wrap">{desFormula.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* 水凝胶配方 */}
                    {hydrogelFormula && (
                        <Card>
                            <CardHeader>
                                <CardTitle>水凝胶电解质配方</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hydrogelFormula.polymer_type && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">聚合物种类</h4>
                                        <p>{hydrogelFormula.polymer_type}</p>
                                    </div>
                                )}
                                {hydrogelFormula.crosslink_method && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">交联方式</h4>
                                        <p>{hydrogelFormula.crosslink_method}</p>
                                    </div>
                                )}
                                {hydrogelFormula.notes && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">制备备注</h4>
                                        <p className="whitespace-pre-wrap">{hydrogelFormula.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* 测试结果 */}
                    {results && results.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>测试结果</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {results.map((result) => (
                                    <div key={result.id} className="border-l-4 border-primary pl-4">
                                        <p className="font-medium mb-2">结论</p>
                                        <p className="whitespace-pre-wrap">{result.conclusion}</p>
                                        {result.failure_reason && (
                                            <>
                                                <p className="font-medium mt-4 mb-2 text-red-600">失败原因</p>
                                                <p className="whitespace-pre-wrap text-red-600">{result.failure_reason}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
