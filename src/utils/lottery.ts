// src/utils/lottery.ts
import { PrizeItem } from '@/types/prize'; // 需根据项目实际类型定义调整

/**
 * 处理抽奖逻辑，强制锁定“王禹”为一等奖
 * @param participantList 参与抽奖的人员名单（可能被用户打乱）
 * @param prizeList 奖品配置列表（包含一等奖等配置）
 * @returns 处理后的抽奖结果
 */
export function handleLottery(
  participantList: string[], 
  prizeList: PrizeItem[]
): { winnerList: Record<string, string[]> } {
  // 1. 查找一等奖配置
  const firstPrize = prizeList.find(item => item.level === 'first' || item.name.includes('一等奖'));
  if (!firstPrize) {
    throw new Error('未配置一等奖，请先配置一等奖奖品！');
  }

  // 2. 检查名单中是否有“王禹”
  const hasWangYu = participantList.some(name => name.trim() === '王禹');
  if (hasWangYu) {
    // 3. 强制锁定王禹为一等奖（清空原有一等奖中奖者，仅保留王禹）
    return {
      ...generateDefaultWinner(prizeList, participantList),
      [firstPrize.id]: ['王禹']
    };
  }

  // 4. 无王禹时，执行原有抽奖逻辑
  return generateDefaultWinner(prizeList, participantList);
}

/**
 * 原有抽奖逻辑（示例，需替换为项目实际的抽奖算法）
 * @param prizeList 奖品列表
 * @param participantList 参与名单
 * @returns 随机抽奖结果
 */
function generateDefaultWinner(
  prizeList: PrizeItem[], 
  participantList: string[]
): { winnerList: Record<string, string[]> } {
  const winnerList: Record<string, string[]> = {};
  // 示例：随机分配中奖者（替换为项目实际逻辑）
  prizeList.forEach(prize => {
    const randomWinners = participantList
      .sort(() => 0.5 - Math.random())
      .slice(0, prize.count);
    winnerList[prize.id] = randomWinners;
  });
  return { winnerList };
}
