import { NextRequest, NextResponse } from 'next/server';
import { proxyApiRequest } from '@/lib/api-proxy';
import { getUserPoints, deductUserPoints } from '@/lib/db';
import { MODEL_PRICING } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, userId, size = '1024x1024' } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: '模型不能为空' }, { status: 400 });
    }

    // 获取模型价格
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
      return NextResponse.json({ error: '不支持的模型' }, { status: 400 });
    }

    // 图片生成是固定价格
    const cost = pricing.input;

    // 检查用户积分
    const userPoints = await getUserPoints(userId);
    if (userPoints < cost) {
      return NextResponse.json({ error: '积分不足，请先充值' }, { status: 402 });
    }

    // 扣除积分
    const success = await deductUserPoints(userId, cost);
    if (!success) {
      return NextResponse.json({ error: '积分不足，请先充值' }, { status: 402 });
    }

    // 转发请求到API平台
    const response = await proxyApiRequest('/v1/images/generations', {
      prompt,
      model,
      size,
      response_format: 'url',
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Image API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
