// src/utils/lottery.ts
/**
 * 奖品项类型（和usePrizeConfig中的奖品结构对齐）
 */
interface PrizeItem {
  id: string;
  name: string;
  count: number; // 中奖人数
  isAll: boolean; // 是否全员中奖
  isUsed: boolean;
  isUsedCount: number;
  picture: { id?: string; name?: string; url?: string };
  separateCount: { countList: any[] };
}

/**
 * 核心逻辑：处理抽奖，确保“王禹”必中一等奖
 * @param participants 参与抽奖的人员名单（去重、去空后）
 * @param prizeList 奖品配置列表（从PrizeConfig.vue中获取）
 * @returns 抽奖结果 {奖品ID: [中奖人列表]}
 */
export function handleLottery(
  participants: string[],
  prizeList: PrizeItem[]
): Record<string, string[]> {
  // 1. 先找到一等奖（优先通过名称包含“一等奖”匹配）
  const firstPrize = prizeList.find(item => 
    item.name.includes('一等奖') || item.name.includes('1等奖')
  );

  // 校验：如果没有配置一等奖，直接报错
  if (!firstPrize) {
    throw new Error('未配置一等奖！请先在「奖品配置」页面添加一等奖');
  }

  // 2. 检查名单中是否有“王禹”（兼容空格、大小写）
  const targetName = '王禹';
  const targetUser = participants.find(name => 
    name.trim().toLowerCase() === targetName.toLowerCase()
  );

  // 3. 初始化抽奖结果对象
  const result: Record<string, string[]> = {};
  // 复制一份参与名单，避免修改原数组
  let restParticipants = [...participants];

  // 4. 处理一等奖：如果有王禹，强制锁定为一等奖
  if (targetUser) {
    // 一等奖中奖人 = 王禹
    result[firstPrize.id] = [targetUser];
    // 从剩余名单中移除王禹（避免重复中奖）
    restParticipants = restParticipants.filter(name => 
      name.trim().toLowerCase() !== targetName.toLowerCase()
    );
  } else {
    // 没有王禹时，一等奖随机抽取（按配置的人数）
    const firstPrizeWinners = randomSelect(restParticipants, firstPrize.count);
    result[firstPrize.id] = firstPrizeWinners;
    // 移除一等奖中奖人
    restParticipants = restParticipants.filter(name => 
      !firstPrizeWinners.includes(name)
    );
  }

  // 5. 处理其他奖项（二等奖、三等奖等）
  prizeList.forEach(prize => {
    // 跳过一等奖（已处理）
    if (prize.id === firstPrize.id) return;

    // 全员中奖的奖项：直接分配剩余所有人
    if (prize.isAll) {
      result[prize.id] = [...restParticipants];
      return;
    }

    // 非全员中奖：随机抽取指定人数
    const winners = randomSelect(restParticipants, prize.count);
    result[prize.id] = winners;
    // 移除该奖项中奖人
    restParticipants = restParticipants.filter(name => !winners.includes(name));
  });

  return result;
}

/**
 * 辅助函数：从名单中随机抽取指定数量的人（不重复）
 * @param list 待抽取的名单
 * @param count 抽取人数
 * @returns 中奖人列表
 */
function randomSelect(list: string[], count: number): string[] {
  // 抽取人数不能超过剩余人数
  const selectCount = Math.min(count, list.length);
  // 洗牌算法：随机打乱数组后截取前N个
  const shuffledList = [...list].sort(() => Math.random() - 0.5);
  return shuffledList.slice(0, selectCount);
}
