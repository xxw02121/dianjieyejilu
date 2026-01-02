import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BeakerIcon, LogOutIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { RecordCard } from '@/components/RecordCard'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 检查用户登录状态
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 获取用户的实验记录，同时关联查询配方和结果
    const { data: records } = await supabase
        .from('experiment_records')
        .select(`
            *,
            des_formulas(hba_name, hbd_name, molar_ratio, salt_name, water_content, water_content_unit, additives),
            hydrogel_formulas(polymer_type, crosslink_method),
            test_results(conclusion)
        `)
        .order('created_at', { ascending: false })

    const handleSignOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <BeakerIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">实验记录系统</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {user.email}
                        </span>
                        <form action={handleSignOut}>
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOutIcon className="h-4 w-4 mr-2" />
                                登出
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="container mx-auto px-4 py-8">
                {/* 操作栏 */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">我的实验记录</h2>
                        <p className="text-muted-foreground">
                            共 {records?.length || 0} 条记录
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/records/new">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            新建记录
                        </Link>
                    </Button>
                </div>

                {/* 记录列表 */}
                {!records || records.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BeakerIcon className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">还没有实验记录</p>
                            <p className="text-muted-foreground mb-6">
                                点击"新建记录"开始记录您的第一个实验
                            </p>
                            <Button asChild>
                                <Link href="/records/new">
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    新建记录
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {records.map((record) => (
                            <RecordCard key={record.id} record={record} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
