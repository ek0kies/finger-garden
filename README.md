# Finger Garden

一个移动端优先的短局护送游戏。玩家护送发光种子自动前进，通过划线临时搭桥、画圈生成护盾，在危险花园里争取更远距离与更高分数。

## 运行

```bash
npm install
npm run dev
```

## 构建校验

```bash
npm run typecheck
npm run build
```

## 项目结构

- `src/App.vue`：应用入口与页面容器
- `src/components/StartPanel.vue`：开场说明与开始入口
- `src/pages/GamePage.vue`：主游戏舞台
- `src/core/`：规则、实体、渲染与输入系统
- `docs/`：重构蓝图与实施计划
