// 主API和备用API的基础URL
export const MAIN_API_BASE_URL = 'https://ai.comfly.chat/v1';
export const BACKUP_API_BASE_URL = 'https://grsai.com/v1';

// 收款码图片路径
export const PAYMENT_QRCODE = '/qrcode/payment_qrcode.png';

// 充值档位配置
export const RECHARGE_OPTIONS = [
  { amount: 10, points: 1000, label: '10元 = 1000积分' },
  { amount: 20, points: 2200, label: '20元 = 2200积分' },
  { amount: 50, points: 6000, label: '50元 = 6000积分' },
  { amount: 100, points: 13000, label: '100元 = 13000积分' },
];

// 模型价格配置
// 对话模型：每千token价格，单位：积分
// 图片/视频模型：单次调用价格，单位：积分
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI 对话模型
  'gpt-5.5': { input: 10, output: 20 },
  'gpt-5.4-2026-03-05': { input: 8, output: 16 },
  'gpt-5.4': { input: 7, output: 14 },
  
  // Claude 对话模型
  'claude-opus-4-7': { input: 20, output: 50 },
  'claude-sonnet-4-6-thinking': { input: 5, output: 15 },
  'claude-sonnet-4-6': { input: 4, output: 12 },
  
  // 图片生成模型
  'gpt-image-2-1k': { input: 10, output: 0 },
  'gpt-image-2-2k': { input: 20, output: 0 },
  'gpt-image-2-4k': { input: 40, output: 0 },
  'gemini-3.1-flash-image-preview-512px-1k': { input: 5, output: 0 },
  'gemini-3.1-flash-image-preview-512px-2k': { input: 10, output: 0 },
  'gemini-3.1-flash-image-preview-512px-4k': { input: 20, output: 0 },
  
  // 视频生成模型
  'sora-2': { input: 100, output: 0 },
  'grok-video-3': { input: 80, output: 0 },
  'vidu2.0': { input: 50, output: 0 },
};

// 对话模型分组
export const CHAT_MODELS: Record<string, string[]> = {
  'OpenAI': ['gpt-5.5', 'gpt-5.4-2026-03-05', 'gpt-5.4'],
  'Claude': ['claude-opus-4-7', 'claude-sonnet-4-6-thinking', 'claude-sonnet-4-6'],
};

// 图片模型分组
export const IMAGE_MODELS: Record<string, {
  models: string[];
  note?: string;
}> = {
  'gpt-image-2': {
    models: ['1k', '2k', '4k'],
  },
  'gemini-3.1-flash-image-preview-512px': {
    models: ['1k', '2k', '4k'],
    note: 'nano-banana2',
  },
};

// 视频模型
export const VIDEO_MODELS: string[] = ['sora-2', 'grok-video-3', 'vidu2.0'];

// 默认模型
export const DEFAULT_CHAT_MODEL = 'gpt-5.5';
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
export const DEFAULT_VIDEO_MODEL = 'sora-2';

// 兼容旧代码的导出
export const ADMIN_USER_ID = 'admin';
export const MAIN_API = {
  baseUrl: MAIN_API_BASE_URL,
  apiKey: process.env.MAIN_API_KEY || '',
};
export const BACKUP_API = {
  baseUrl: BACKUP_API_BASE_URL,
  apiKey: process.env.BACKUP_API_KEY || '',
};
