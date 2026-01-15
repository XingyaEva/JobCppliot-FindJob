# 简历解析失败 - 快速解决指南

## 🔴 问题现象
- 上传PDF简历后显示 "Failed to fetch"
- 后端日志报错：`The image format is illegal and cannot be opened`

## ✅ 根本原因
**旧接口 `/api/resume/parse` 不支持PDF格式，只支持图片（PNG/JPG/WebP）**

百炼视觉模型 `qwen-vl-max` 无法处理 `application/pdf` 的Base64数据。

## 🎯 解决方案

### PDF文件 → 使用 MinerU API

```javascript
// 步骤1: 上传
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('isOcr', 'true');

const uploadRes = await fetch('/api/resume/mineru/upload', {
  method: 'POST',
  body: formData,
  signal: AbortSignal.timeout(30000), // 30秒
});

const { batchId, fileName } = await uploadRes.json();

// 步骤2: 解析（重要：120秒超时）
const parseRes = await fetch('/api/resume/mineru/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ batchId, fileName }),
  signal: AbortSignal.timeout(120000), // ⚠️ 必须120秒
});

const result = await parseRes.json();
```

### 图片文件 → 使用旧接口

```javascript
const reader = new FileReader();
reader.onload = async () => {
  const base64 = reader.result.split(',')[1];
  
  await fetch('/api/resume/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'file',
      fileData: base64,
      fileName: imageFile.name,
    }),
  });
};
reader.readAsDataURL(imageFile);
```

## ⚡ 关键要点

| 要点 | 说明 |
|-----|------|
| **超时设置** | MinerU解析需要50-70秒，前端必须设置120秒超时 |
| **文件类型** | PDF/Word → MinerU，PNG/JPG → 旧接口 |
| **错误提示** | 后端已修复，现在会明确告知使用MinerU |
| **加载提示** | 建议显示"预计1-2分钟"的提示 |

## 📋 前端检查清单

- [ ] PDF上传使用 `/api/resume/mineru/*` 接口
- [ ] 解析超时设置 ≥ 120秒
- [ ] 显示加载进度和预计时间
- [ ] 区分不同错误类型（超时/取消/服务错误）

## 🔍 快速测试

```bash
# 测试MinerU上传
curl -X POST http://localhost:3000/api/resume/mineru/upload \
  -F "file=@test.pdf" \
  -F "isOcr=true"

# 测试MinerU解析（替换batchId）
curl -X POST http://localhost:3000/api/resume/mineru/parse \
  -H "Content-Type: application/json" \
  -d '{"batchId":"xxx","fileName":"test.pdf"}' \
  --max-time 120
```

## 📚 详细文档

完整分析和代码示例请查看：`RESUME_PARSE_FIX.md`

---

**状态：** ✅ 后端已修复 (2026-01-15)  
**下一步：** 检查前端是否使用正确的API和超时设置
