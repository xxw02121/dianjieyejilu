'use client'

import { useState } from 'react'
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

export default function NewRecordPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()

        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        try {
            // 1. 创建实验记录
            const { data: recordData, error: recordError } = await supabase
                .from('experiment_records')
                .insert({
                    user_id: user.id,
                    title,
                    research_type: researchType,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                } as any)
                .select()
                .single()

            const record = recordData as any

            if (recordError) throw recordError

            // 2. 根据类型插入配方数据
            if (researchType === 'des_electrolyte' && (hbaName || hbdName)) {
                const { error: desError } = await supabase
                    .from('des_formulas')
                    .insert({
                        record_id: record.id,
                        hba_name: hbaName,
                        hbd_name: hbdName,
                        molar_ratio: molarRatio,
                        salt_name: saltName,
                        salt_concentration: saltConcentration,
                        water_content: waterContent ? parseFloat(waterContent) : null,
                        water_content_unit: waterContentUnit,
                        additives: additives ? { text: additives } : null,
                        notes: desNotes,
                    } as any)
                if (desError) throw desError
            }

            if (researchType === 'hydrogel' && (polymerType || crosslinkMethod)) {
                const { error: gelError } = await supabase
                    .from('hydrogel_formulas')
                    .insert({
                        record_id: record.id,
                        polymer_type: polymerType,
                        crosslink_method: crosslinkMethod,
                        notes: gelNotes,
                    } as any)
                if (gelError) throw gelError
            }

            // 3. 插入测试结果
            if (conclusion) {
                const { error: resultError } = await supabase
                    .from('test_results')
                    .insert({
                        record_id: record.id,
                        conclusion,
                    } as any)
                if (resultError) throw resultError
            }

            // 成功后跳转到详情页
            router.push(`/records/${record.id}`)
        } catch (err: any) {
            setError(err.message || '创建记录失败，请重试')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            返回仪表盘
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">新建实验记录</h1>

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
                            <CardDescription>实验的基本描述信息</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">实验标题 *</Label>
                                <Input
                                    id="title"
                                    placeholder="例如：ChCl:EG (1:2) + 2M ZnSO4 电解液性能测试"
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
                                <Label htmlFor="tags">关键词标签（用逗号分隔）</Label>
                                <Input
                                    id="tags"
                                    placeholder="例如：ZnSO4, ChCl, EG, 抑氢"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 配方信息（根据类型显示） */}
                    <Card>
                        <CardHeader>
                            <CardTitle>配方信息</CardTitle>
                            <CardDescription>详细的配方参数</CardDescription>
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
                                                placeholder="例如：ChCl"
                                                value={hbaName}
                                                onChange={(e) => setHbaName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hbd">HBD（氢键供体）</Label>
                                            <Input
                                                id="hbd"
                                                placeholder="例如：EG, 尿素, 甘油"
                                                value={hbdName}
                                                onChange={(e) => setHbdName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="molarRatio">摩尔比（HBA:HBD）</Label>
                                        <Input
                                            id="molarRatio"
                                            placeholder="例如：1:2"
                                            value={molarRatio}
                                            onChange={(e) => setMolarRatio(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="salt">盐名称</Label>
                                            <Input
                                                id="salt"
                                                placeholder="例如：ZnSO4, Zn(TFSI)2"
                                                value={saltName}
                                                onChange={(e) => setSaltName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="saltConc">盐浓度</Label>
                                            <Input
                                                id="saltConc"
                                                placeholder="例如：2 M"
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
                                            placeholder="制备条件、颜色、黏度等观察"
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
                                            placeholder="例如：PAM, PVA, 海藻酸钠"
                                            value={polymerType}
                                            onChange={(e) => setPolymerType(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="crosslink">交联方式</Label>
                                        <Input
                                            id="crosslink"
                                            placeholder="例如：物理交联、化学交联、冻融"
                                            value={crosslinkMethod}
                                            onChange={(e) => setCrosslinkMethod(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gelNotes">制备备注</Label>
                                        <Textarea
                                            id="gelNotes"
                                            placeholder="制备步骤、凝胶性能、含水率等"
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
                            <CardDescription>实验结论与观察</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="conclusion">结论（一句话总结）*</Label>
                                <Textarea
                                    id="conclusion"
                                    placeholder="例如：该电解液具有良好的离子电导率，抑氢效果明显"
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
                            disabled={loading}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? '保存中...' : '保存记录'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
