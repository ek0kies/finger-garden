<template>
  <section class="result-panel">
    <p class="result-panel__tag">本局结算</p>
    <h2>{{ result.distance }}m</h2>

    <ul class="result-panel__list">
      <li>
        <span>总分</span>
        <strong>{{ result.totalScore }}</strong>
      </li>
      <li>
        <span>花粉收集</span>
        <strong>{{ result.pollen }}（+{{ result.pollenScore }}）</strong>
      </li>
      <li>
        <span>无伤奖励</span>
        <strong>+{{ result.noHitBonus }}</strong>
      </li>
      <li>
        <span>险境救回</span>
        <strong>+{{ result.nearMissBonus }}</strong>
      </li>
      <li>
        <span>最高距离</span>
        <strong>{{ result.best }}m</strong>
      </li>
      <li>
        <span>纪录状态</span>
        <strong>{{ result.isNewBest ? "刷新纪录" : "未刷新" }}</strong>
      </li>
    </ul>

    <div class="result-panel__actions">
      <button type="button" class="result-panel__primary" @click="$emit('restart')">再来一局</button>
      <button type="button" class="result-panel__ghost" @click="$emit('home')">返回首页</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RunResult } from "../types/game";

defineProps<{
  result: RunResult;
}>();

defineEmits<{
  restart: [];
  home: [];
}>();
</script>
