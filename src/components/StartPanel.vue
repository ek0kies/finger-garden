<template>
  <section class="start-panel">
    <p class="start-panel__eyebrow">夜色生物发光花园</p>
    <h1>Finger Garden</h1>
    <p class="start-panel__desc">划线搭桥，画圈保命。护送发光种子，穿越湿润又危险的花园。</p>

    <div class="start-panel__stats">
      <div>
        <span>最佳距离</span>
        <strong>{{ bestScore }}m</strong>
      </div>
      <div>
        <span>单局时长</span>
        <strong>30-90s</strong>
      </div>
      <div>
        <span>操作</span>
        <strong>单手触控</strong>
      </div>
    </div>

    <button type="button" class="start-panel__action" @click="$emit('start')">开始护送</button>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  bestScore: number;
}>();

defineEmits<{
  start: [];
}>();
</script>
