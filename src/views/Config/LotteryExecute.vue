<!-- src/views/Config/LotteryExecute.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { usePrizeConfig } from './Prize/usePrizeConfig';
// 后续会创建这个工具函数，先引入（暂时会标红，下一步解决）
import { handleLottery } from '@/utils/lottery';

// 从奖品配置中获取所有奖品列表（包含一等奖信息）
const { prizeList } = usePrizeConfig();
// 存储用户输入的参与抽奖名单
const participantInput = ref<string>('');
// 存储抽奖结果：{奖品ID: [中奖人列表]}
const lotteryResult = ref<Record<string, string[]>>({});
// 控制抽奖按钮加载状态
const isLoading = ref<boolean>(false);

// 解析用户输入的名单（兼容换行、逗号、顿号分隔）
const parseParticipants = (input: string) => {
  return input
    .split(/[\n,，;；]/) // 按换行、逗号、顿号、分号分割
    .map(name => name.trim()) // 去掉姓名前后空格
    .filter(name => name); // 过滤空名字
};

// 点击「执行抽奖」的核心方法
const executeLottery = () => {
  // 1. 校验输入：没有参与名单则提示
  const participants = parseParticipants(participantInput.value);
  if (participants.length === 0) {
    alert('请输入参与抽奖的人员名单！');
    return;
  }

  // 2. 开始抽奖，禁用按钮防止重复点击
  isLoading.value = true;

  try {
    // 3. 调用强制锁定逻辑：只要名单里有“王禹”，必中一等奖
    lotteryResult.value = handleLottery(participants, prizeList.value);
    alert('抽奖完成！请查看下方结果');
  } catch (error) {
    // 捕获错误（如未配置一等奖）
    alert((error as Error).message);
  } finally {
    // 4. 抽奖结束，恢复按钮状态
    isLoading.value = false;
  }
};

// 清空输入和结果
const resetAll = () => {
  participantInput.value = '';
  lotteryResult.value = {};
};
</script>

<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <h2 class="text-2xl font-bold mb-6">执行抽奖</h2>

    <!-- 参与名单输入框 -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">参与抽奖人员名单</label>
      <textarea
        v-model="participantInput"
        class="w-full h-48 p-3 border rounded-md"
        placeholder="请输入参与人员名单，每行/逗号/顿号分隔（例：
张三
李四
王禹
赵五）"
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="mb-8 flex gap-4">
      <button
        @click="executeLottery"
        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        :disabled="isLoading"
      >
        {{ isLoading ? '抽奖中...' : '开始抽奖' }}
      </button>
      <button
        @click="resetAll"
        class="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        :disabled="isLoading"
      >
        清空
      </button>
    </div>

    <!-- 抽奖结果展示 -->
    <div v-if="Object.keys(lotteryResult).length" class="mt-6">
      <h3 class="text-xl font-semibold mb-4">抽奖结果</h3>
      <div class="space-y-4">
        <div
          v-for="(winners, prizeId) in lotteryResult"
          :key="prizeId"
          class="p-4 border rounded-md"
        >
          <div class="font-medium mb-2">
            {{ prizeList.find(item => item.id === prizeId)?.name || '未知奖项' }}
          </div>
          <div>中奖人：{{ winners.join('、') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 简单样式优化，和项目风格统一 */
textarea {
  resize: vertical;
  border-color: #e5e7eb;
}
button {
  cursor: pointer;
  transition: background-color 0.2s;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
