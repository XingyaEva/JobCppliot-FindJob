# 简历解析失败问题 - 问题分析与解决方案总结

> **问题报告时间：** 2026-01-15  
> **处理状态：** ✅ 后端已修复，前端待验证  
> **优先级：** P0 - 影响核心功能

---

## 一、问题描述

### 用户反馈
用户上传PDF简历文件时，界面显示 **"Failed to fetch"** 错误，无法完成简历解析。

### 错误日志
```
[LLM] 调用失败: Error: API 错误 (400): 
The image format is illegal and cannot be opened

[简历预处理] 执行失败: API 错误 (400)...
```

---

## 二、根本原因

### 🎯 核心问题：API接口选择错误

项目中存在两套简历解析系统：

| 系统 | API | 支持格式 | 技术方案 | 状态 |
|-----|-----|---------|---------|------|
| **旧系统** | `/api/resume/parse` | PNG/JPG/文本 | qwen-vl-max | ❌ 不支持PDF |
| **新系统** | `/api/resume/mineru/*` | PDF/Word | MinerU | ✅ 完全支持 |

### 🔍 技术细节

**问题代码（已修复前）：**
```typescript
// src/agents/resume-preprocess.ts
const mimeType = input.fileName?.toLowerCase().endsWith('.pdf') 
  ? 'application/pdf'  // ❌ qwen-vl-max不支持此格式
  : 'image/png';
const imageUrl = `data:${mimeType};base64,${input.fileData}`;
```

**百炼模型限制：**
- `qwen-vl-max` 仅支持：PNG, JPG, JPEG, WebP, GIF
- 不支持：PDF, DOC, DOCX
- 不支持：`data:application/pdf;base64,...` 格式

---

## 三、解决方案

### ✅ 已完成：后端修复

**修改文件：** `src/agents/resume-preprocess.ts`

```typescript
if (input.type === 'file') {
  // 明确拒绝PDF
  if (input.fileName?.toLowerCase().endsWith('.pdf')) {
    throw new Error('此接口不支持PDF文件，请使用 MinerU API (/api/resume/mineru/upload)');
  }
  
  // 仅支持图片格式
  const mimeType = 'image/png';
  const imageUrl = `data:${mimeType};base64,${input.fileData}`;
  // ...
}
```

**效果：**
- ✅ 立即返回清晰的错误提示
- ✅ 引导用户使用正确的MinerU API
- ✅ 避免浪费API调用配额

### ⏳ 待验证：前端实现

**PDF上传正确流程：**

```javascript
async function uploadPDFResume(file) {
  // 步骤1: 上传文件（30秒超时）
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isOcr', 'true');
  
  const uploadRes = await fetch('/api/resume/mineru/upload', {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
  
  const { batchId, fileName } = await uploadRes.json();
  
  // 步骤2: 解析结果（⚠️ 必须120秒超时）
  const parseRes = await fetch('/api/resume/mineru/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId, fileName }),
    signal: AbortSignal.timeout(120000), // 关键！
  });
  
  return await parseRes.json();
}
```

---

## 四、验证测试

### ✅ 测试结果

运行 `./test_resume_parse.sh` 验证：

```
✓ 服务正常运行
✓ 正确拒绝PDF并提示使用MinerU
✓ MinerU接口可正常访问
✓ 文本模式正常工作
```

### 🧪 手动测试命令

```bash
# 测试1：旧接口拒绝PDF
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{"type":"file","fileData":"JVBERi0x","fileName":"test.pdf"}'

# 预期响应：
# {"success":false,"error":"此接口不支持PDF文件，请使用 MinerU API (/api/resume/mineru/upload)"}

# 测试2：MinerU上传（需要真实PDF）
curl -X POST http://localhost:3000/api/resume/mineru/upload \
  -F "file=@your_resume.pdf" \
  -F "isOcr=true"

# 测试3：MinerU解析（替换batchId）
curl -X POST http://localhost:3000/api/resume/mineru/parse \
  -H "Content-Type: application/json" \
  -d '{"batchId":"xxx","fileName":"your_resume.pdf"}' \
  --max-time 120
```

---

## 五、前端检查清单

### 必须验证的项目

- [ ] **API选择逻辑**
  - PDF/Word文件 → 使用 `/api/resume/mineru/*`
  - PNG/JPG图片 → 可使用 `/api/resume/parse`
  
- [ ] **超时设置**
  - MinerU上传：30秒
  - MinerU解析：**120秒**（⚠️ 关键）
  - 旧接口：30秒
  
- [ ] **用户体验**
  - 显示"预计需要1-2分钟"的提示
  - 显示解析进度条
  - 区分不同错误类型的提示
  
- [ ] **错误处理**
  - 超时错误 → 提示可能原因和重试
  - 格式错误 → 提示支持的格式
  - 网络错误 → 提示检查网络

---

## 六、API使用指南

### 📋 推荐方案

| 文件类型 | 推荐API | 超时设置 | 说明 |
|---------|---------|---------|------|
| **PDF** | MinerU | 120秒 | 必须使用 |
| **Word** | MinerU | 120秒 | 推荐使用 |
| **图片** | 旧接口 | 30秒 | 支持PNG/JPG |
| **文本** | 旧接口 | 30秒 | 粘贴文本 |

### 🔄 API流程对比

**MinerU流程（PDF/Word）：**
```
上传文件 → MinerU OSS → 后台解析（50-70秒）→ 轮询结果 → 结构化
```

**旧接口流程（图片/文本）：**
```
Base64编码 → 视觉模型识别（3-8秒）→ 结构化
```

---

## 七、相关文档

### 📚 详细文档

1. **RESUME_PARSE_ANALYSIS.md** - 完整的技术分析报告
   - 问题现象、根本原因、解决方案
   - 验证测试、后续行动、技术债务

2. **QUICK_FIX_GUIDE.md** - 快速参考指南
   - 问题描述、解决方案代码示例
   - 前端检查清单、测试命令

3. **RESUME_PARSE_FIX.md** - 详细的实现方案
   - 前端完整代码示例
   - 用户体验优化建议
   - 调试方法和工具

### 🔧 代码文件

- `src/agents/resume-preprocess.ts` - 简历预处理Agent（已修复）
- `src/routes/resume.ts` - 简历API路由
  - 第103行：MinerU上传接口
  - 第173行：MinerU解析接口
  - 第345行：旧解析接口
- `src/core/mineru-client.ts` - MinerU客户端
- `test_resume_parse.sh` - 自动化测试脚本

---

## 八、后续行动

### 🔴 高优先级

1. **验证前端实现**（本周完成）
   - 检查PDF上传是否使用MinerU API
   - 确认超时设置是否≥120秒
   - 测试完整的PDF上传流程

2. **用户体验优化**（本周完成）
   - 添加"预计1-2分钟"的加载提示
   - 显示解析进度条
   - 优化错误提示文案

### 🟡 中优先级

3. **监控和日志**（下周完成）
   - 记录MinerU解析时长
   - 统计API选择错误次数
   - 监控解析成功率

4. **文档更新**（下周完成）
   - 更新用户使用文档
   - 添加常见问题FAQ
   - 录制操作演示视频

### 🟢 长期优化

5. **架构统一**（Q1规划）
   - 评估是否将所有文件统一到MinerU
   - 废弃旧的图片识别接口
   - 简化前端接口选择逻辑

---

## 九、总结

### ✅ 已解决
- 后端明确拒绝PDF使用错误的API
- 添加清晰的错误提示和引导
- 创建完整的文档和测试脚本

### ⏳ 待验证
- 前端是否使用了正确的MinerU API
- 超时设置是否满足要求（120秒）
- 用户体验是否足够友好

### 🎯 预期效果
修复完成后：
- PDF上传成功率 > 95%
- 用户知道预计等待时间
- 错误提示能引导正确操作
- 平均解析时间 < 90秒

---

**最后更新：** 2026-01-15  
**下次审查：** 前端验证完成后  
**负责人：** 开发团队

---

## 联系方式

如有问题请查看：
- 项目文档：`/home/user/webapp/`
- Git提交：`git log --oneline --grep="简历解析"`
- 服务日志：`pm2 logs job-copilot`

**测试脚本：** `./test_resume_parse.sh`
