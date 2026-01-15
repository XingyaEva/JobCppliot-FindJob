# Job Copilot - 最新测试地址

## 🌐 在线访问地址

**最新测试环境：**
```
https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai
```

**访问时间：** 2026-01-15  
**服务状态：** ✅ 运行中

---

## 🎯 重点测试功能

### 1. 简历解析（PDF上传）

**测试步骤：**
1. 访问首页 → 点击"简历管理"
2. 上传PDF格式的简历
3. 观察解析过程（预计1-2分钟）
4. 检查解析结果是否完整

**预期结果：**
- ✅ PDF文件成功上传
- ✅ 显示"正在解析，预计需要1-2分钟"提示
- ✅ 解析成功，提取姓名、联系方式、工作经历等
- ✅ 无"Failed to fetch"错误

**如果遇到错误：**
- 查看错误提示是否引导使用MinerU API
- 检查浏览器控制台是否有超时错误
- 确认等待时间是否足够（至少2分钟）

---

## 📋 完整功能列表

### Phase 1-6 已完成功能

1. **岗位解析** ✅
   - 支持图片、文本、URL三种输入方式
   - 自动提取岗位信息和要求
   - A/B维度深度分析

2. **简历管理** ✅
   - 支持PDF、Word、图片、文本输入
   - 自动结构化解析
   - 能力标签提取

3. **匹配评估** ✅
   - 多维度匹配分析
   - 优势与差距识别
   - 面试建议生成

4. **面试准备** ✅
   - 自我介绍生成
   - 项目经历推荐
   - 常见问题和PREP回答

5. **简历优化** ✅
   - 关键词注入
   - 差距弥补建议
   - 亮点强化

6. **模型评测** ✅
   - A/B测试对比
   - 成本优化
   - 性能监控

---

## 🔧 最新修复（2026-01-15）

### 简历解析PDF支持

**问题：** PDF上传失败，显示"Failed to fetch"  
**修复：** 
- ✅ 后端明确拒绝PDF使用错误接口
- ✅ 添加清晰的MinerU引导提示
- ⏳ 前端需确认使用正确API和120秒超时

**相关文档：**
- [问题总结](./RESUME_PARSE_SUMMARY.md)
- [快速指南](./QUICK_FIX_GUIDE.md)
- [完整分析](./RESUME_PARSE_ANALYSIS.md)

---

## 🧪 API测试端点

### 简历解析 - MinerU API（推荐用于PDF）

```bash
# 1. 上传PDF
curl -X POST https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/resume/mineru/upload \
  -F "file=@your_resume.pdf" \
  -F "isOcr=true"

# 2. 解析结果（替换batchId和fileName）
curl -X POST https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/resume/mineru/parse \
  -H "Content-Type: application/json" \
  -d '{"batchId":"your-batch-id","fileName":"your_resume.pdf"}' \
  --max-time 120
```

### 简历解析 - 旧API（仅支持图片和文本）

```bash
# 文本模式
curl -X POST https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "张三\n手机：138xxxx8888\n邮箱：zhangsan@email.com..."
  }'
```

### 岗位解析

```bash
# 文本模式
curl -X POST https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/job/parse \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "AI产品经理\nABC公司\n职责：...\n要求：..."
  }'
```

### 获取数据

```bash
# 获取简历列表
curl https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/resumes

# 获取岗位列表
curl https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/jobs
```

---

## 📱 浏览器调试

### 打开开发者工具

**Chrome/Edge：** `F12` 或 `Ctrl+Shift+I`  
**Firefox：** `F12` 或 `Ctrl+Shift+K`  
**Safari：** `Option+Command+I`

### 监控网络请求

1. 打开开发者工具 → Network标签
2. 上传简历文件
3. 观察API请求：
   - `/api/resume/mineru/upload` - 应该在5秒内完成
   - `/api/resume/mineru/parse` - 应该在50-90秒内完成
4. 检查请求状态码：
   - `200` - 成功
   - `400` - 客户端错误（检查请求参数）
   - `500` - 服务器错误（查看控制台日志）
   - `timeout` - 超时（检查超时设置）

### 查看控制台日志

1. 打开开发者工具 → Console标签
2. 查看是否有错误信息（红色文字）
3. 查看API调用日志
4. 检查是否有警告信息（黄色文字）

---

## 🔍 常见问题排查

### Q1: PDF上传后显示"Failed to fetch"

**可能原因：**
1. 前端调用了错误的API（应该用MinerU）
2. 超时设置太短（应该≥120秒）
3. 网络不稳定

**排查方法：**
1. 打开浏览器开发者工具 → Network
2. 查看请求的URL是否为 `/api/resume/mineru/upload` 和 `/parse`
3. 查看请求是否超时
4. 查看Console是否有错误信息

### Q2: 解析时间过长

**正常情况：**
- MinerU解析PDF需要 **50-70秒**
- 这是正常的，因为需要OCR识别和结构化处理

**异常情况：**
- 超过2分钟未返回 → 可能服务器繁忙或文件过大
- 建议：重试或联系技术支持

### Q3: 解析结果不完整

**可能原因：**
1. PDF格式特殊（扫描件、图片PDF）
2. 文件损坏
3. 内容过于复杂

**解决方法：**
1. 确保开启了OCR（`isOcr=true`）
2. 尝试转换PDF格式
3. 使用文本模式手动输入

---

## 📞 技术支持

### 查看服务日志

```bash
# SSH到服务器后执行
cd /home/user/webapp
pm2 logs job-copilot --nostream --lines 50
```

### 运行测试脚本

```bash
cd /home/user/webapp
./test_resume_parse.sh
```

### 查看文档

- 项目根目录：`/home/user/webapp/`
- 问题分析：`RESUME_PARSE_SUMMARY.md`
- 快速指南：`QUICK_FIX_GUIDE.md`

---

## 🎯 测试建议

### 推荐测试流程

1. **基础功能测试**（5分钟）
   - [ ] 访问首页，检查界面加载
   - [ ] 测试岗位解析（文本模式）
   - [ ] 测试简历解析（文本模式）

2. **核心功能测试**（15分钟）
   - [ ] 上传PDF简历（重点）
   - [ ] 查看解析结果
   - [ ] 测试匹配评估
   - [ ] 查看面试准备

3. **边界测试**（10分钟）
   - [ ] 上传大文件（5MB以上）
   - [ ] 上传特殊格式PDF
   - [ ] 测试网络超时场景
   - [ ] 测试错误提示

---

## 📊 性能基准

| 操作 | 预期时间 | 备注 |
|-----|---------|------|
| 页面加载 | < 3秒 | 首次加载可能较慢 |
| 文本解析 | 3-8秒 | 简历或JD |
| 图片识别 | 5-10秒 | 依赖图片大小 |
| PDF解析 | 50-90秒 | MinerU处理 |
| 匹配评估 | 10-15秒 | 包含多维度分析 |
| 面试准备 | 15-20秒 | 包含联网搜索 |

---

**地址有效期：** 沙箱环境，建议在24小时内测试  
**更新时间：** 2026-01-15 09:30  
**服务版本：** v0.7.0 + 简历解析修复

---

## 快速访问

**主页：** https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai

**直接功能入口：**
- 岗位解析：`/job`
- 简历管理：`/resume`
- 岗位库：`/jobs`
- 面试准备：`/interview`
- 简历优化：`/optimize`
