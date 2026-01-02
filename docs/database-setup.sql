-- ============================================
-- 水系锌电实验记录系统 - 数据库初始化脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建实验记录主表
CREATE TABLE IF NOT EXISTS experiment_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  research_type TEXT CHECK (research_type IN ('des_electrolyte', 'hydrogel', 'other')),
  tags TEXT[],
  visibility TEXT CHECK (visibility IN ('private', 'shared')) DEFAULT 'private',
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  share_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建 DES 电解液配方表
CREATE TABLE IF NOT EXISTS des_formulas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_id UUID REFERENCES experiment_records(id) ON DELETE CASCADE NOT NULL,
  hba_name TEXT,
  hba_purity TEXT,
  hba_supplier TEXT,
  hbd_name TEXT,
  hbd_purity TEXT,
  hbd_supplier TEXT,
  molar_ratio TEXT,
  water_content NUMERIC,
  water_content_unit TEXT CHECK (water_content_unit IN ('wt%', 'mol%')),
  salt_name TEXT,
  salt_concentration TEXT,
  additives JSONB,
  preparation_temp TEXT,
  stirring_time TEXT,
  appearance TEXT,
  viscosity TEXT,
  notes TEXT
);

-- 5. 创建水凝胶配方表
CREATE TABLE IF NOT EXISTS hydrogel_formulas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_id UUID REFERENCES experiment_records(id) ON DELETE CASCADE NOT NULL,
  polymer_type TEXT,
  polymer_content TEXT,
  crosslink_method TEXT,
  crosslink_agent TEXT,
  solvent_system TEXT,
  salt_concentration TEXT,
  preparation_steps TEXT,
  gel_properties TEXT,
  notes TEXT
);

-- 6. 创建测试条件表
CREATE TABLE IF NOT EXISTS test_conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_id UUID REFERENCES experiment_records(id) ON DELETE CASCADE NOT NULL,
  battery_type TEXT,
  cathode_material TEXT,
  cathode_loading TEXT,
  anode_material TEXT,
  separator TEXT,
  electrolyte_amount TEXT,
  test_items JSONB,
  observations TEXT
);

-- 7. 创建测试结果表
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_id UUID REFERENCES experiment_records(id) ON DELETE CASCADE NOT NULL,
  capacity NUMERIC,
  retention NUMERIC,
  coulombic_efficiency NUMERIC,
  conclusion TEXT NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建附件表
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  record_id UUID REFERENCES experiment_records(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_records_user_id ON experiment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_share_token ON experiment_records(share_token);
CREATE INDEX IF NOT EXISTS idx_attachments_record_id ON attachments(record_id);

-- 10. 启用 Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE des_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydrogel_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 11. 创建 RLS 策略 - profiles 表
DROP POLICY IF EXISTS "用户可以查看和更新自己的资料" ON profiles;
CREATE POLICY "用户可以查看和更新自己的资料"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- 12. 创建 RLS 策略 - experiment_records 表
DROP POLICY IF EXISTS "用户可以查看自己的记录" ON experiment_records;
CREATE POLICY "用户可以查看自己的记录"
  ON experiment_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以创建自己的记录" ON experiment_records;
CREATE POLICY "用户可以创建自己的记录"
  ON experiment_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以更新自己的记录" ON experiment_records;
CREATE POLICY "用户可以更新自己的记录"
  ON experiment_records FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以删除自己的记录" ON experiment_records;
CREATE POLICY "用户可以删除自己的记录"
  ON experiment_records FOR DELETE
  USING (auth.uid() = user_id);

-- 13. 创建 RLS 策略 - 配方和结果表（通过 record_id 关联主表权限）
DROP POLICY IF EXISTS "用户可以管理自己记录的 DES 配方" ON des_formulas;
CREATE POLICY "用户可以管理自己记录的 DES 配方"
  ON des_formulas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiment_records
      WHERE id = des_formulas.record_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己记录的水凝胶配方" ON hydrogel_formulas;
CREATE POLICY "用户可以管理自己记录的水凝胶配方"
  ON hydrogel_formulas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiment_records
      WHERE id = hydrogel_formulas.record_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己记录的测试条件" ON test_conditions;
CREATE POLICY "用户可以管理自己记录的测试条件"
  ON test_conditions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiment_records
      WHERE id = test_conditions.record_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己记录的测试结果" ON test_results;
CREATE POLICY "用户可以管理自己记录的测试结果"
  ON test_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiment_records
      WHERE id = test_results.record_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己记录的附件" ON attachments;
CREATE POLICY "用户可以管理自己记录的附件"
  ON attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiment_records
      WHERE id = attachments.record_id
      AND user_id = auth.uid()
    )
  );

-- 14. 创建自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_experiment_records_updated_at ON experiment_records;
CREATE TRIGGER update_experiment_records_updated_at
  BEFORE UPDATE ON experiment_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 执行完成！
-- ============================================
-- 在 Supabase Dashboard 中：
-- 1. 点击左侧 "Table Editor" 确认 7 张表已创建
-- 2. 点击 "Storage" 创建 "experiment-attachments" 存储桶
