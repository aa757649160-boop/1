/**
 * 配置文件 - 您可以在这里修改模型价格、API地址等配置
 */

// 主API平台配置
export const MAIN_API = {
  baseUrl: 'https://ai.comfly.chat',
  apiKey: process.env.MAIN_API_KEY || '',
};

// 备用API平台配置
export const BACKUP_API = {
  baseUrl: 'https://grsai.com',
  apiKey: process.env.BACKUP_API_KEY || '',
};

// 模型价格配置 (每千token价格，单位：积分)
// 您可以在这里修改各个模型的调用价格
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'gpt-4': { input: 3, output: 6 },
  'gpt-4o': { input: 2.5, output: 5 },
  'claude-3-opus': { input: 15, output: 75 },
  'claude-3-sonnet': { input: 3, output: 15 },
  'gemini-pro': { input: 0.5, output: 1.5 },
  // 图片生成模型价格 (每张图片价格，单位：积分)
  'dall-e-3': { input: 10, output: 0 },
  'sdxl': { input: 5, output: 0 },
};

// 充值金额配置 (固定金额，单位：元)
// 您可以在这里修改充值档位，每个档位对应积分
export const RECHARGE_OPTIONS = [
  { amount: 10, points: 1000, label: '10元 = 1000积分' },
  { amount: 20, points: 2200, label: '20元 = 2200积分' },
  { amount: 50, points: 6000, label: '50元 = 6000积分' },
  { amount: 100, points: 13000, label: '100元 = 13000积分' },
];

// 管理员配置 (管理员用户ID，用来识别管理员)
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 'admin';

// 收款码图片路径 - 您可以将您的收款码图片放在 public/qrcode/ 目录下
// 然后修改这里的路径，比如: '/qrcode/your_qrcode.png'
export const PAYMENT_QRCODE = '/qrcode/payment_qrcode.png';
