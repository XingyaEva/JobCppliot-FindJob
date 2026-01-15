# 简历解析日志分析 (2026-01-15)

## 📊 当前解析流程时间分析

### 完整流程时间线
```
用户上传文件
  ↓
POST /api/resume/mineru/upload (23.5秒)
  ├─ 步骤1: 申请上传 URL (< 1秒)
  ├─ 步骤2: 上传文件到 MinerU OSS (~20秒)
  └─ 返回 batchId
  ↓
前端轮询 POST /api/resume/mineru/parse (56.8秒)
  ├─ 步骤3: 轮询解析结果 (~50秒)
  ├─ 步骤4: 下载 ZIP (~2秒)
  ├─ 步骤5: Markdown 清理 (<1秒)
  └─ 步骤6: 结构化解析 (~4秒)
  ↓
解析完成，返回简历数据
```

### 实际时间数据
- **上传阶段**: 23,548ms (23.5秒)
- **解析阶段**: 56,758ms (56.8秒)
- **总耗时**: ~80秒

## ⚠️ 发现的问题

### 1. Phase 1.1 参数未生效
**问题**: 日志显示仍在使用旧参数
```
[MinerU] 步骤1: 申请上传 URL... (模型: pipeline, OCR: true)
```

**预期**: 应该使用优化后的参数
```
(模型: vlm, OCR: false)
```

**原因**: `/api/resume/mineru/upload` 接口中的参数设置有误

**影响**: Phase 1.1 优化未真正生效

### 2. FormData 解析错误
**错误日志**:
```
[ERROR] [MinerU] 上传处理失败: TypeError: Parsing a Body as FormData requires a Content-Type header.
```

**原因**: 前端上传时可能未正确设置 Content-Type

**影响**: 部分上传请求失败

### 3. 重复解析
**观察**: 同一个简历被解析了2次
```
[MinerU] 简历结构化完成，ID: mkfjvu2rh3eb2koo0, 姓名: 兰兴娅
[MinerU] 简历结构化完成，ID: mkfjwvtrvg3arx1er, 姓名: 兰兴娅
```

**原因**: 可能是前端重复请求，或者超时后重试导致

**影响**: 浪费资源，用户体验差

### 4. 缺少实时进度反馈
**观察**: 80秒的等待时间，用户无法看到进度

**影响**: 用户焦虑，容易中断操作

## 🎯 优化建议

### 立即修复 (Phase 2.1)

1. **修复参数设置** ✅
   - 在 `/api/resume/mineru/upload` 中强制使用 Phase 1.1 参数
   - 确保 `isOcr: false`, `modelVersion: 'vlm'`

2. **添加实时进度反馈** ✅
   - 实现后端进度存储 (内存 Map)
   - 添加进度 API `/api/resume/progress/:id`
   - 在解析各阶段更新进度

3. **修复 FormData 问题**
   - 前端上传时自动设置正确的 Content-Type
   - 后端添加更详细的错误日志

4. **防止重复解析**
   - 添加解析状态检查
   - 前端禁用重复点击

### Phase 2.2-2.3 (本周完成)

5. **桌面通知**
   - 解析完成时推送通知
   - 点击通知跳转到结果页面

6. **PDF 类型检测**
   - 使用 PDF.js 检测文本层
   - 区分数字 PDF vs 扫描 PDF
   - 给出准确的时间预期

### Phase 3 (下周)

7. **智能路由**
   - 数字 PDF → PyMuPDF (8秒)
   - 扫描 PDF → MinerU (45秒)

## 📈 预期效果

### Phase 1.1 (参数优化)
- **实际速度**: 80秒 → 60秒 (↓25%)
- **状态**: ❌ 未生效，需修复

### Phase 2.1 (实时进度条)
- **感知速度**: 0.1秒 (立即跳转)
- **透明度**: ⭐⭐ → ⭐⭐⭐⭐⭐
- **用户满意度**: +50%

### Phase 3 (智能路由)
- **数字 PDF**: 60秒 → 8秒 (↓87%)
- **扫描 PDF**: 保持 45秒

## 🔍 关键代码位置

### 需要修复的文件
1. `src/routes/resume.ts` - `/mineru/upload` 接口 (Line ~140)
2. `src/routes/resume.ts` - `/mineru/parse` 接口 (Line ~160)
3. `src/index.tsx` - 前端页面 (Line ~2100)

### 新增功能文件
1. `src/routes/resume.ts` - `/progress/:id` API (新增)
2. `src/index.tsx` - 进度条组件 (修改)

## 📌 下一步行动

1. ✅ 完成日志分析
2. 🔄 修复 `/mineru/upload` 参数问题
3. 🔄 实现进度存储和 API
4. ⏳ 实现前端进度条 UI
5. ⏳ 测试完整流程

---

**分析时间**: 2026-01-15  
**分析文件**: PM2 日志 (最近100行)  
**重点关注**: MinerU 解析流程、时间分布、错误信息
