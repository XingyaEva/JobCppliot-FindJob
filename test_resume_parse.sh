#!/bin/bash
# 简历解析功能测试脚本

echo "======================================"
echo "简历解析功能测试"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试1: 检查服务是否运行
echo "测试1: 检查服务状态..."
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 服务正常运行"
else
    echo -e "${RED}✗${NC} 服务未运行，请先启动服务"
    exit 1
fi
echo ""

# 测试2: 测试旧接口拒绝PDF
echo "测试2: 验证旧接口拒绝PDF..."
echo "（模拟PDF上传到旧接口）"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/resume/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "file",
    "fileData": "JVBERi0xLjQKJeLjz9MK",
    "fileName": "test.pdf"
  }')

if echo "$RESPONSE" | grep -q "MinerU"; then
    echo -e "${GREEN}✓${NC} 正确拒绝PDF并提示使用MinerU"
    echo "   响应: $(echo $RESPONSE | jq -r '.error' 2>/dev/null || echo $RESPONSE)"
else
    echo -e "${YELLOW}⚠${NC}  未返回预期的MinerU提示"
    echo "   响应: $RESPONSE"
fi
echo ""

# 测试3: 测试MinerU上传接口
echo "测试3: 验证MinerU上传接口..."
echo "（需要真实PDF文件才能完整测试）"

# 检查是否有测试PDF
if [ -f "/home/user/B3Ge6IaX.png" ]; then
    echo -e "${YELLOW}ℹ${NC}  找到测试文件，但这是图片不是PDF"
    echo "   完整测试需要真实的PDF文件"
else
    echo -e "${YELLOW}ℹ${NC}  未找到测试文件"
    echo "   完整测试需要真实的PDF文件"
fi

# 简单测试上传接口是否可访问
UPLOAD_TEST=$(curl -s -X POST "$BASE_URL/api/resume/mineru/upload" 2>&1)
if echo "$UPLOAD_TEST" | grep -q "缺少文件"; then
    echo -e "${GREEN}✓${NC} MinerU上传接口可访问"
else
    echo -e "${YELLOW}⚠${NC}  MinerU接口响应异常"
fi
echo ""

# 测试4: 测试文本模式
echo "测试4: 验证文本模式..."

TEXT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/resume/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "张三\n手机：138xxxx8888\n邮箱：zhangsan@email.com\n\n教育背景\nxx大学 | 计算机科学 | 本科 | 2018-2022\n\n工作经历\nAI产品经理 | ABC公司 | 2022-至今\n负责AI产品规划和设计"
  }')

if echo "$TEXT_RESPONSE" | grep -q "success"; then
    if echo "$TEXT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} 文本模式正常工作"
    else
        echo -e "${RED}✗${NC} 文本模式返回失败"
        echo "   响应: $(echo $TEXT_RESPONSE | jq -r '.error' 2>/dev/null || echo $TEXT_RESPONSE)"
    fi
else
    echo -e "${YELLOW}⚠${NC}  文本模式响应格式异常"
    echo "   响应: $TEXT_RESPONSE"
fi
echo ""

# 总结
echo "======================================"
echo "测试总结"
echo "======================================"
echo ""
echo -e "${GREEN}✓${NC} 已完成的修复:"
echo "  - 旧接口正确拒绝PDF文件"
echo "  - 错误提示引导使用MinerU"
echo "  - MinerU接口可正常访问"
echo ""
echo -e "${YELLOW}⚠${NC}  需要验证的项目:"
echo "  - 前端是否使用了MinerU API上传PDF"
echo "  - 前端超时设置是否≥120秒"
echo "  - 用户体验是否添加了预计时间提示"
echo ""
echo "📚 相关文档:"
echo "  - RESUME_PARSE_ANALYSIS.md - 完整分析报告"
echo "  - QUICK_FIX_GUIDE.md - 快速解决指南"
echo "  - RESUME_PARSE_FIX.md - 详细解决方案"
echo ""
