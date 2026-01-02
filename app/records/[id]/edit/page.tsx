'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

export default function EditRecordPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // 基本信息
    const [title, setTitle] = useState('')
    const [researchType, setResearchType] = useState<'des_electrolyte' | 'hydrogel' | 'other'>('des_electrolyte')
    const [tags, setTags] = useState('')

    // DES 配方
    const [hbaName, setHbaName] = useState('')
    const [hbdName, setHbdName] = useState('')
    const [molarRatio, setMolarRatio] = useState('')
    const [saltName, setSaltName] = useState('')
    const [saltConcentration, setSaltConcentration] = useState('')
    const [waterContent, setWaterContent] = useState('')
    const [waterContentUnit, setWaterContentUnit] = useState('wt%')
    const [additives, setAdditives] = useState('')
    const [desNotes, setDesNotes] = useState('')

    // 水凝胶配方
    const [polymerType, setPolymerType] = useState('')
    const [crosslinkMethod, setCrosslinkMethod] = useState('')
    const [gelNotes, setGelNotes] = useState('')

    // 测试结果
    const [conclusion, setConclusion] = useState('')
    // 注意：简化起见，这里只处理第一条结果记录。完整版应该可以处理多条结果。
    const [resultId, setResultId] = useState<string | null>(null)

    // 配方ID（用于更新）
    const [formulaId, setFormulaId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            try {
                // 1. 获取主记录
                const { data: record, error: recordError } = await supabase
                    .from('experiment_records')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (recordError) throw recordError
                if (!record) throw new Error('记录不存在')

                const r = record as any
                setTitle(r.title)
                setResearchType(r.research_type)
                setTags(r.tags ? r.tags.join(', ') : '')

                // 2. 根据类型获取配方
                if (r.research_type === 'des_electrolyte') {
                    const { data: des, error: desError } = await supabase
                        .from('des_formulas')
                        .select('*')
                        .eq('record_id', params.id)
                        .single()

                    if (des && !desError) {
                        const d = des as any
                        setFormulaId(d.id)
                        setHbaName(d.hba_name || '')
                        setHbdName(d.hbd_name || '')
                        setMolarRatio(d.molar_ratio || '')
                        setSaltName(d.salt_name || '')
                        setSaltConcentration(d.salt_concentration || '')
                        setDesNotes(d.notes || '')
                        setWaterContent(d.water_content ? d.water_content.toString() : '')
                        setWaterContentUnit(d.water_content_unit || 'wt%')

                        // 处理添加剂：如果是对象且有 text 属性，或者数组转字符串
                        if (d.additives) {
                            if (Array.isArray(d.additives)) {
                                setAdditives(d.additives.join(', '))
                            } else if (typeof d.additives === 'object' && (d.additives as any).text) {
                                setAdditives((d.additives as any).text)
                            }
                        }
                    }
                } else if (r.research_type === 'hydrogel') {
                    const { data: gel, error: gelError } = await supabase
                        .from('hydrogel_formulas')
                        .select('*')
                        .eq('record_id', params.id)
                        .single()

                    if (gel && !gelError) {
                        const g = gel as any
                        setFormulaId(g.id)
                        setPolymerType(g.polymer_type || '')
                        setCrosslinkMethod(g.crosslink_method || '')
                        setGelNotes(g.notes || '')
                    }
                }

                // 3. 获取测试结果
                const { data: results, error: resError } = await supabase
                    .from('test_results')
                    .select('*')
                    .eq('record_id', params.id)

                if (results && results.length > 0) {
                    const res = results[0] as any
                    setResultId(res.id)
                    setConclusion(res.conclusion || '')
                }

            } catch (err: any) {
                console.error('加载数据失败', err)
                setError('加载数据失败: ' + err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        try {
            // 1. 更新主记录
            const { error: recordError } = await supabase
                .from('experiment_records')
                .update({
                    title,
                    research_type: researchType,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                })
                .eq('id', params.id)

            if (recordError) throw recordError

            // 2. 更新配方 (Upsert: 有则更新，无则插入)
            if (researchType === 'des_electrolyte') {
                const desData = {
                    record_id: params.id,
                    hba_name: hbaName,
                    hbd_name: hbdName,
                    molar_ratio: molarRatio,
                    salt_name: saltName,
                    salt_concentration: saltConcentration,
                    water_content: waterContent ? parseFloat(waterContent) : null,
                    water_content_unit: waterContentUnit,
                    additives: additives ? { text: additives } : null,
                    notes: desNotes,
                }

                const { error: desError } = formulaId
                    ? await supabase.from('des_formulas').update(desData).eq('id', formulaId)
                    : await supabase.from('des_formulas').insert(desData)

                if (desError) throw desError
            } else if (researchType === 'hydrogel') {
                const gelData = {
                    record_id: params.id,
                    polymer_type: polymerType,
                    crosslink_method: crosslinkMethod,
                    notes: gelNotes,
                }
                const { error: gelError } = formulaId
                    ? await supabase.from('hydrogel_formulas').update(gelData).eq('id', formulaId)
                    : await supabase.from('hydrogel_formulas').insert(gelData)

                if (gelError) throw gelError
            }

            // 3. 更新结果 (Upsert)
            if (conclusion) {
                const resData = {
                    record_id: params.id,
                    conclusion,
                }
                const { error: resultError } = resultId
                    ? await supabase.from('test_results').update(resData).eq('id', resultId)
                    : await supabase.from('test_results').insert(resData)

                if (resultError) throw resultError
            }

            // 成功跳转
            router.push(`/records/${params.id}`)
            router.refresh()

        } catch (err: any) {
            setError(err.message || '保存失败')
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center">加载中...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" asChild>
                        <Link href={`/records/${params.id}`}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            返回详情
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">编辑实验记录</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* 基本信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">实验标题 *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="researchType">研究类型</Label>
                                <Select value={researchType} onValueChange={(value: any) => setResearchType(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="des_electrolyte">DES 电解液</SelectItem>
                                        <SelectItem value="hydrogel">水凝胶电解质</SelectItem>
                                        <SelectItem value="other">其他</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">关键词标签</Label>
                                <Input
                                    id="tags"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 配方信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>配方信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={researchType} onValueChange={(value: any) => setResearchType(value)}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="des_electrolyte">DES 电解液</TabsTrigger>
                                    <TabsTrigger value="hydrogel">水凝胶</TabsTrigger>
                                </TabsList>

                                <TabsContent value="des_electrolyte" className="space-y-4 mt-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hba">HBA（氢键受体）</Label>
                                            <Input
                                                id="hba"
                                                value={hbaName}
                                                onChange={(e) => setHbaName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hbd">HBD（氢键供体）</Label>
                                            <Input
                                                id="hbd"
                                                value={hbdName}
                                                onChange={(e) => setHbdName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="molarRatio">摩尔比</Label>
                                        <Input
                                            id="molarRatio"
                                            value={molarRatio}
                                            onChange={(e) => setMolarRatio(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="salt">盐名称</Label>
                                            <Input
                                                id="salt"
                                                value={saltName}
                                                onChange={(e) => setSaltName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="saltConc">盐浓度</Label>
                                            <Input
                                                id="saltConc"
                                                value={saltConcentration}
                                                onChange={(e) => setSaltConcentration(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="waterContent">水含量</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="waterContent"
                                                    placeholder="数值"
                                                    value={waterContent}
                                                    onChange={(e) => setWaterContent(e.target.value)}
                                                />
                                                <Select value={waterContentUnit} onValueChange={setWaterContentUnit}>
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="wt%">wt%</SelectItem>
                                                        <SelectItem value="mol%">mol%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="additives">添加剂</Label>
                                            <Input
                                                id="additives"
                                                placeholder="例如：尿素 (10%), 甘油"
                                                value={additives}
                                                onChange={(e) => setAdditives(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="desNotes">制备备注</Label>
                                        <Textarea
                                            id="desNotes"
                                            value={desNotes}
                                            onChange={(e) => setDesNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="hydrogel" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="polymer">聚合物种类</Label>
                                        <Input
                                            id="polymer"
                                            value={polymerType}
                                            onChange={(e) => setPolymerType(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="crosslink">交联方式</Label>
                                        <Input
                                            id="crosslink"
                                            value={crosslinkMethod}
                                            onChange={(e) => setCrosslinkMethod(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gelNotes">制备备注</Label>
                                        <Textarea
                                            id="gelNotes"
                                            value={gelNotes}
                                            onChange={(e) => setGelNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* 测试结果 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>测试结果</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="conclusion">结论</Label>
                                <Textarea
                                    id="conclusion"
                                    value={conclusion}
                                    onChange={(e) => setConclusion(e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 提交按钮 */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={saving}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? '保存中...' : '保存更改'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
