-- ============================================
-- 修复 RLS 策略脚本
-- 解决编辑记录时出现的 "new row violates row-level security policy" 错误
-- ============================================

-- 1. 修复 DES 配方表的策略
DROP POLICY IF EXISTS "用户可以管理自己记录的 DES 配方" ON des_formulas;
DROP POLICY IF EXISTS "View DES Formulas" ON des_formulas;
DROP POLICY IF EXISTS "Insert DES Formulas" ON des_formulas;
DROP POLICY IF EXISTS "Update DES Formulas" ON des_formulas;
DROP POLICY IF EXISTS "Delete DES Formulas" ON des_formulas;

CREATE POLICY "View DES Formulas" ON des_formulas FOR SELECT
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = des_formulas.record_id AND user_id = auth.uid()));

CREATE POLICY "Insert DES Formulas" ON des_formulas FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM experiment_records WHERE id = record_id AND user_id = auth.uid()));

CREATE POLICY "Update DES Formulas" ON des_formulas FOR UPDATE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = des_formulas.record_id AND user_id = auth.uid()));

CREATE POLICY "Delete DES Formulas" ON des_formulas FOR DELETE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = des_formulas.record_id AND user_id = auth.uid()));


-- 2. 修复水凝胶配方表的策略
DROP POLICY IF EXISTS "用户可以管理自己记录的水凝胶配方" ON hydrogel_formulas;

CREATE POLICY "View Hydrogel Formulas" ON hydrogel_formulas FOR SELECT
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = hydrogel_formulas.record_id AND user_id = auth.uid()));

CREATE POLICY "Insert Hydrogel Formulas" ON hydrogel_formulas FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM experiment_records WHERE id = record_id AND user_id = auth.uid()));

CREATE POLICY "Update Hydrogel Formulas" ON hydrogel_formulas FOR UPDATE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = hydrogel_formulas.record_id AND user_id = auth.uid()));

CREATE POLICY "Delete Hydrogel Formulas" ON hydrogel_formulas FOR DELETE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = hydrogel_formulas.record_id AND user_id = auth.uid()));


-- 3. 修复测试结果表的策略
DROP POLICY IF EXISTS "用户可以管理自己记录的测试结果" ON test_results;

CREATE POLICY "View Test Results" ON test_results FOR SELECT
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = test_results.record_id AND user_id = auth.uid()));

CREATE POLICY "Insert Test Results" ON test_results FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM experiment_records WHERE id = record_id AND user_id = auth.uid()));

CREATE POLICY "Update Test Results" ON test_results FOR UPDATE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = test_results.record_id AND user_id = auth.uid()));

CREATE POLICY "Delete Test Results" ON test_results FOR DELETE
USING (EXISTS (SELECT 1 FROM experiment_records WHERE id = test_results.record_id AND user_id = auth.uid()));

-- ============================================
-- 执行完成
-- ============================================
