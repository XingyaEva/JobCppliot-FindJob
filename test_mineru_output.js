// 测试获取最新解析的简历ID
const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
if (resumes.length > 0) {
  const latestResume = resumes[0];
  console.log('=== 最新简历 ===');
  console.log('ID:', latestResume.id);
  console.log('姓名:', latestResume.basic_info?.name);
  console.log('原始内容长度:', latestResume.raw_content?.length);
  console.log('\n=== 原始内容预览 (前2000字符) ===');
  console.log(latestResume.raw_content?.substring(0, 2000));
  console.log('\n=== 工作经历 ===');
  console.log(JSON.stringify(latestResume.work_experience, null, 2));
}
