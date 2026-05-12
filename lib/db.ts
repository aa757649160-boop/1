import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECHARGES_FILE = path.join(DATA_DIR, 'recharges.json');

// 确保数据目录存在
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取用户数据
function readUsers(): Record<string, number> {
  ensureDir();
  if (!fs.existsSync(USERS_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// 写入用户数据
function writeUsers(users: Record<string, number>) {
  ensureDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 读取充值记录
function readRecharges(): RechargeRequest[] {
  ensureDir();
  if (!fs.existsSync(RECHARGES_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(RECHARGES_FILE, 'utf8'));
}

// 写入充值记录
function writeRecharges(recharges: RechargeRequest[]) {
  ensureDir();
  fs.writeFileSync(RECHARGES_FILE, JSON.stringify(recharges, null, 2));
}

// 用户积分操作
export async function getUserPoints(userId: string): Promise<number> {
  const users = readUsers();
  return users[userId] || 0;
}

export async function updateUserPoints(userId: string, points: number) {
  const users = readUsers();
  users[userId] = (users[userId] || 0) + points;
  writeUsers(users);
}

export async function deductUserPoints(userId: string, points: number): Promise<boolean> {
  const current = await getUserPoints(userId);
  if (current < points) {
    return false;
  }
  await updateUserPoints(userId, -points);
  return true;
}

// 充值记录操作
export type RechargeRequest = {
  id: string;
  userId: string;
  amount: number;
  points: number;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export async function createRechargeRequest(request: Omit<RechargeRequest, 'id' | 'createdAt' | 'status'>) {
  const recharges = readRecharges();
  const newRequest: RechargeRequest = {
    ...request,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  recharges.unshift(newRequest);
  writeRecharges(recharges);
  return newRequest;
}

export async function getPendingRecharges(): Promise<RechargeRequest[]> {
  const recharges = readRecharges();
  return recharges.filter(r => r.status === 'pending');
}

export async function getAllRecharges(): Promise<RechargeRequest[]> {
  return readRecharges();
}

export async function approveRecharge(id: string) {
  const recharges = readRecharges();
  const request = recharges.find(r => r.id === id);
  if (!request || request.status !== 'pending') {
    throw new Error('充值记录不存在或已处理');
  }
  
  // 更新用户积分
  await updateUserPoints(request.userId, request.points);
  
  // 更新充值状态
  request.status = 'approved';
  writeRecharges(recharges);
  
  return request;
}

export async function rejectRecharge(id: string) {
  const recharges = readRecharges();
  const request = recharges.find(r => r.id === id);
  if (!request || request.status !== 'pending') {
    throw new Error('充值记录不存在或已处理');
  }
  
  request.status = 'rejected';
  writeRecharges(recharges);
  
  return request;
}

/**
 * 注意：当前使用的是本地文件存储，在Vercel部署时，文件系统是临时的，
 * 数据会丢失。建议您替换为使用数据库，比如：
 * - Vercel Postgres: https://vercel.com/storage/postgres
 * - Upstash Redis: https://upstash.com/
 * 您只需要修改这里的读写逻辑即可，其他代码无需改动
 */
