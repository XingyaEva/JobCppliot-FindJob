# 简历解析失败问题 - 完整分析报告

**报告时间：** 2026-01-15  
**问题状态：** ✅ 已识别并修复  
**影响范围：** PDF文件上传功能

---

## 📊 问题现象

### 用户反馈
- 上传PDF简历文件后显示 "Failed to fetch"
- 界面显示解析失败，无法继续操作

### 日志错误
```
[LLM] 调用失败: Error: API 错误 (400): 
{
  "error": {
    "message": "<400> InternalError.Algo.InvalidParameter: The image format is illegal and cannot be opened",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_parameter_error"
  }
}

[简历预处理] 执行失败: API 错误 (400)...
```

### 矛盾现象
从日志中发现：
- ❌ 旧接口报错：`image format is illegal`
- ✅ MinerU成功：`[MinerU] 简历结构化完成，ID: mkezonlvyzdsrm7ny, 姓名: 兰兴娅`

---

## 🔍 根本原因分析

### 问题1：API接口选择错误 ⚠️

项目中存在**两套独立的简历解析系统**：

| 系统 | API路径 | 支持格式 | 技术方案 | 状态 |
|-----|---------|---------|---------|------|
| **旧系统** | `/api/resume/parse` | 图片、文本 | qwen-vl-max视觉模型 | ❌ 不支持PDF |
| **新系统** | `/api/resume/mineru/*` | PDF、Word | MinerU文档解析 | ✅ 完全支持 |

**错误链路：**
```
用户上传PDF
    ↓
前端调用 /api/resume/parse (错误的接口)
    ↓
resume-preprocess.ts 将PDF标记为 'application/pdf'
    ↓
传给 qwen-vl-max 视觉模型
    ↓
百炼API拒绝：图片格式非法 ❌
```

### 问题2：技术限制 🔒

**qwen-vl-max 视觉模型的限制：**
- ✅ 支持：PNG, JPG, JPEG, WebP, GIF
- ❌ 不支持：PDF, DOC, DOCX
- ❌ 不支持：`data:application/pdf;base64,...` 格式

**代码问题定位：**
```typescript
// src/agents/resume-preprocess.ts 第74-77行（修复前）
const mimeType = input.fileName?.toLowerCase().endsWith('.pdf') 
  ? 'application/pdf'  // ❌ 这是错误的
  : 'image/png';
const imageUrl = `data:${mimeType};base64,${input.fileData}`;
```

### 问题3：前端超时或接口选择 ⏱️

从成功的MinerU日志可以看到：
```
[wrangler:info] POST /api/resume/mineru/parse 200 OK (73212ms)
```

**潜在问题：**
- MinerU解析需要 **50-70秒**
- 前端可能设置了 **30秒** 默认超时
- 或者前端根本没有调用MinerU接口，而是调用了旧接口

---

## ✅ 解决方案实施

### 修复1：后端明确拒绝PDF（已完成）

**修改文件：** `src/agents/resume-preprocess.ts`

```typescript
if (input.type === 'file') {
  if (!input.fileData) {
    throw new Error('文件模式需要提供 fileData');
  }

  // ⚠️ 警告：此接口仅支持图片格式
  if (input.fileName?.toLowerCase().endsWith('.pdf')) {
    throw new Error('此接口不支持PDF文件，请使用 MinerU API (/api/resume/mineru/upload)');
  }

  // 仅支持图片格式
  const mimeType = 'image/png';
  const imageUrl = `data:${mimeType};base64,${input.fileData}`;
  
  cleanedText = await chatWithImage(
    IMAGE_SYSTEM_PROMPT,
    '请识别这份简历中的所有内容。',
    imageUrl,
    { agentId: 'resume-parse-image' }
  );
}
```

**效果：**
- 立即返回清晰的错误提示
- 引导用户使用正确的API

### 修复2：前端实现建议（待验证）

#### A. PDF上传必须使用MinerU流程

```javascript
async function uploadPDFResume(file) {
  // 步骤1: 上传文件
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isOcr', 'true');
  
  const uploadRes = await fetch('/api/resume/mineru/upload', {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000), // 30秒足够上传
  });
  
  const { batchId, fileName } = await uploadRes.json();
  
  // 步骤2: 轮询解析结果
  const parseRes = await fetch('/api/resume/mineru/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId, fileName }),
    signal: AbortSignal.timeout(120000), // ⚠️ 必须120秒
  });
  
  return await parseRes.json();
}
```

#### B. 根据文件类型选择API

```javascript
async function uploadResume(file) {
  const isPDF = file.name.match(/\.pdf$/i);
  const isWord = file.name.match(/\.docx?$/i);
  const isImage = file.name.match(/\.(png|jpg|jpeg|webp)$/i);
  
  if (isPDF || isWord) {
    // 使用 MinerU
    return await uploadPDFResume(file);
  } else if (isImage) {
    // 使用旧接口
    return await uploadImageResume(file);
  } else {
    throw new Error('不支持的文件格式');
  }
}
```

#### C. 超时配置

```javascript
const API_TIMEOUTS = {
  '/api/resume/mineru/upload': 30000,   // 30秒
  '/api/resume/mineru/parse': 120000,   // 120秒 ⚠️ 关键
  '/api/resume/parse': 30000,            // 30秒
  '/api/job/parse': 60000,               // 60秒
};
```

---

## 📈 验证测试

### 测试用例1：上传PDF文件

```bash
# 使用MinerU API（正确方式）
curl -X POST http://localhost:3000/api/resume/mineru/upload \
  -F "file=@兰兴娅简历.pdf" \
  -F "isOcr=true"

# 预期响应：
# {
#   "success": true,
#   "batchId": "xxx",
#   "fileName": "兰兴娅简历.pdf",
#   "message": "文件上传成功，请轮询解析结果"
# }

# 解析（替换实际的batchId）
curl -X POST http://localhost:3000/api/resume/mineru/parse \
  -H "Content-Type: application/json" \
  -d '{"batchId":"xxx","fileName":"兰兴娅简历.pdf"}' \
  --max-time 120

# 预期响应（50-70秒后）：
# {
#   "success": true,
#   "resumeId": "xxx",
#   "resume": { ... }
# }
```

### 测试用例2：使用旧接口上传PDF（应该被拒绝）

```bash
# 准备Base64编码的PDF
PDF_BASE64=$(base64 -w 0 兰兴娅简历.pdf)

curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"file\",
    \"fileData\": \"$PDF_BASE64\",
    \"fileName\": \"兰兴娅简历.pdf\"
  }"

# 预期响应（立即返回错误）：
# {
#   "success": false,
#   "error": "此接口不支持PDF文件，请使用 MinerU API (/api/resume/mineru/upload)"
# }
```

### 测试用例3：上传图片文件

```bash
# 准备Base64编码的图片
IMG_BASE64=$(base64 -w 0 resume_screenshot.png)

curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"file\",
    \"fileData\": \"$IMG_BASE64\",
    \"fileName\": \"resume.png\"
  }"

# 预期响应（30秒内）：
# {
#   "success": true,
#   "resumeId": "xxx",
#   "resume": { ... }
# }
```

---

## 📊 影响范围评估

### 受影响功能
- ✅ **PDF文件上传** - 已修复，需要前端配合
- ✅ **Word文件上传** - MinerU已支持
- ✅ **图片上传** - 不受影响，继续使用旧接口
- ✅ **文本粘贴** - 不受影响

### 未受影响功能
- JD解析（支持文本、图片、URL）
- 匹配评估
- 面试准备
- 简历优化

---

## 🎯 后续行动计划

### 高优先级 🔴
1. **验证前端实现**
   - [ ] 检查前端是否使用了MinerU API
   - [ ] 确认超时设置是否 ≥ 120秒
   - [ ] 测试PDF上传流程

2. **用户体验优化**
   - [ ] 显示"预计需要1-2分钟"的提示
   - [ ] 添加解析进度条
   - [ ] 区分不同错误类型的提示

### 中优先级 🟡
3. **文档完善**
   - [x] 创建问题分析文档（RESUME_PARSE_FIX.md）
   - [x] 创建快速解决指南（QUICK_FIX_GUIDE.md）
   - [ ] 更新用户使用文档

4. **监控改进**
   - [ ] 添加MinerU解析时长监控
   - [ ] 记录API选择错误次数
   - [ ] 统计解析成功率

### 低优先级 🟢
5. **长期优化**
   - [ ] 考虑废弃旧的图片识别接口
   - [ ] 统一所有文件上传到MinerU
   - [ ] 添加文件格式自动检测和转换

---

## 📚 相关文档

### 新增文档
- `RESUME_PARSE_FIX.md` - 完整的问题分析和解决方案
- `QUICK_FIX_GUIDE.md` - 快速参考指南
- `RESUME_PARSE_ANALYSIS.md` - 本报告（完整分析）

### 代码修改
- `src/agents/resume-preprocess.ts` - 添加PDF拒绝逻辑
- `dist/_worker.js` - 已重新构建

### API文档
- MinerU接口：`src/routes/resume.ts` 第96-338行
- 旧接口：`src/routes/resume.ts` 第340-414行

---

## 📝 技术债务记录

### 当前架构问题
1. **两套系统并存** - 增加维护成本和用户困惑
2. **前端接口选择逻辑** - 需要明确的类型判断
3. **错误提示不统一** - 不同接口的错误格式不同

### 建议改进
1. **统一到MinerU** - 长期目标，所有文件都用MinerU解析
2. **前端类型路由** - 根据文件后缀自动选择API
3. **统一错误格式** - 标准化API响应结构

---

## ✅ 验收标准

### 功能验收
- [x] 后端拒绝PDF使用旧接口
- [x] 错误提示清晰明确
- [x] MinerU接口正常工作
- [ ] 前端使用正确的API
- [ ] 前端超时设置正确
- [ ] 用户可以成功上传PDF

### 性能验收
- [ ] PDF解析时间 < 90秒（90%成功率）
- [ ] 上传接口响应 < 5秒
- [ ] 错误响应 < 1秒

### 体验验收
- [ ] 加载提示清晰（显示预计时间）
- [ ] 错误提示可操作（引导正确操作）
- [ ] 成功率 > 95%

---

## 🎉 总结

### 问题本质
**技术选型与实际需求不匹配**
- 旧接口设计用于图片识别，不支持PDF文档
- 新接口MinerU专门用于文档解析，完全支持PDF
- 前端可能没有正确区分这两种场景

### 解决思路
1. **后端：明确接口能力边界** ✅ 已完成
2. **前端：根据文件类型选择API** ⏳ 待验证
3. **体验：清晰的提示和反馈** ⏳ 待完善

### 当前状态
- ✅ **后端已修复** - 代码已更新并重新部署
- ⏳ **前端待验证** - 需要检查是否使用了正确的API
- ⏳ **体验待优化** - 需要改进加载提示和错误处理

### 预期效果
修复完成后：
- PDF文件上传成功率 > 95%
- 用户清楚知道预计等待时间
- 错误提示能够引导用户正确操作

---

**报告完成时间：** 2026-01-15  
**报告作者：** AI开发助手  
**下次审查：** 前端验证完成后

---

## 附录A：错误代码对照表

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `image format is illegal` | PDF传给视觉模型 | 使用MinerU API |
| `Failed to fetch` | 超时或网络错误 | 增加超时到120秒 |
| `TimeoutError` | 超过设定时间 | 检查服务状态 |
| `文档内容过短` | 解析失败或空文件 | 检查PDF是否有效 |

## 附录B：性能基准

| 操作 | 预期时间 | 超时设置 |
|-----|---------|---------|
| MinerU上传 | 2-5秒 | 30秒 |
| MinerU解析 | 50-70秒 | 120秒 |
| 图片识别 | 3-8秒 | 30秒 |
| 文本处理 | 1-3秒 | 30秒 |
