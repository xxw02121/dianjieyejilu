import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BeakerIcon, FileTextIcon, Share2Icon, ShieldCheckIcon } from 'lucide-react'

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 如果已登录，跳转到仪表盘
    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* 导航栏 */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <BeakerIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">水系锌电实验记录系统</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost">
                            <Link href="/login">登录</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">注册</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 主内容 */}
            <main className="container mx-auto px-4 py-16">
                {/* 标题区域 */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">专为水系锌离子电池研究设计</h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        DES 电解液与水凝胶配方的结构化记录管理系统
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg">
                            <Link href="/register">立即开始</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/login">已有账号？登录</Link>
                        </Button>
                    </div>
                </div>

                {/* 功能特性 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <Card>
                        <CardHeader>
                            <FileTextIcon className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>结构化记录</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                专业的配方模板，涵盖 HBA/HBD、摩尔比、含水量、盐浓度等关键参数
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Share2Icon className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>便捷分享</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                一键生成公网分享链接，支持密码保护和过期时间设置
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <ShieldCheckIcon className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>数据安全</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                基于 Supabase 的权限管理，确保数据隐私和安全性
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <BeakerIcon className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>多设备同步</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                手机、平板、电脑随时访问，数据云端同步
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* 使用场景 */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-6 text-center">适用场景</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">📝 DES 电解液配方</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• HBA/HBD 组分记录</li>
                                <li>• 摩尔比与含水量</li>
                                <li>• 锌盐浓度与添加剂</li>
                                <li>• 制备条件与表征</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🧪 水凝胶电解质</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• 聚合物种类与含量</li>
                                <li>• 交联方式与参数</li>
                                <li>• 溶剂体系配比</li>
                                <li>• 凝胶性能表征</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">⚡ 电化学测试</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• CV/GCD/EIS 参数</li>
                                <li>• 电池组装条件</li>
                                <li>• 测试结果记录</li>
                                <li>• 附件图片上传</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* 页脚 */}
            <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
                <p>© 2026 水系锌电实验记录系统 | 为科研工作者设计</p>
            </footer>
        </div>
    )
}
