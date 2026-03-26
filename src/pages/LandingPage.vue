<template>
  <main class="landing">
    <div class="landing__ambient" />

    <StartPanel :best-score="bestScore" @start="startGame" />

    <section class="landing__tips">
      <article>
        <h3>操作</h3>
        <p>短划线快速铺路，画圈触发一次性护盾。</p>
      </article>
      <article>
        <h3>目标</h3>
        <p>让发光种子持续前进，穿过断台、藤蔓与孢子云。</p>
      </article>
      <article>
        <h3>节奏</h3>
        <p>10 秒学会，90 秒内一局，失败后立即重开。</p>
      </article>
    </section>

    <section class="landing__demo" aria-hidden="true">
      <div class="landing__lane"><span class="landing__trail" /><span class="landing__seed" /></div>
      <div class="landing__lane landing__lane--delay"><span class="landing__trail" /><span class="landing__seed" /></div>
      <div class="landing__lane landing__lane--slow"><span class="landing__trail" /><span class="landing__seed" /></div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import StartPanel from "../components/StartPanel.vue";
import { useBestScore } from "../composables/useBestScore";

const router = useRouter();
const { bestScore, refresh } = useBestScore();

const startGame = async (): Promise<void> => {
  await router.push("/game");
};

onMounted(() => {
  refresh();
});
</script>
