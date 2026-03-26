# Finger Garden 实施计划（基于重构蓝图）

## 目标
交付移动端优先的短局护送玩法（M1+M3）：自动前进、划线开路、画圈护盾、障碍/花粉、能量/分数、失败结算与本地最高分，并完成基础视觉反馈打磨。

## 执行步骤

1. 入口与页面骨架
- 文件：`src/main.ts`、`src/App.vue`、`src/app/bootstrap.ts`、`src/app/router.ts`、`src/pages/LandingPage.vue`、`src/pages/GamePage.vue`
- 改动点：初始化路由，分离 Landing / Game 页面壳，建立状态机对应页面流
- 预期结果：可在首页开始游戏并进入游戏页
- 验证方式：`npm run dev` 手动点击流转

2. 组件与 Composable 层
- 文件：`src/components/*`、`src/composables/*`
- 改动点：HUD、能量条、结果面板、最高分存储与输入桥接
- 预期结果：UI 可显示分数/能量，结算可重开/回首页
- 验证方式：手动触发失败并检查结果面板

3. Core 引擎与实体
- 文件：`src/core/game/*`、`src/core/entities/*`、`src/core/systems/*`、`src/types/game.ts`
- 改动点：循环、状态、难度、碰撞、生成、能量与计分规则
- 预期结果：自动前进 + 坠落 + 障碍 + 花粉 + 失败规则可运行
- 验证方式：手动游玩 3 局观察规则一致性

4. 手势与渲染
- 文件：`src/core/gestures/*`、`src/core/render/*`
- 改动点：笔迹采样、画圈识别、路径/主角/障碍/背景渲染
- 预期结果：划线能生路，画圈能触发一次护盾
- 验证方式：实机/模拟器触控验证

5. 样式与主题
- 文件：`src/styles/*`、`src/constants/theme.ts`
- 改动点：移动端优先布局、夜色荧光视觉、HUD 悬浮化
- 预期结果：舞台化页面，避免旧版控制台布局
- 验证方式：桌面 + 移动宽度断点检查

6. 收尾与验证
- 文件：`package.json`、`package-lock.json`
- 改动点：新增 `vue-router`
- 预期结果：类型检查与构建通过
- 验证方式：`npm run typecheck`、`npm run build`
