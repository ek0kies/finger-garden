import { createRouter, createWebHistory } from "vue-router";

const LandingPage = () => import("../pages/LandingPage.vue");
const GamePage = () => import("../pages/GamePage.vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingPage
    },
    {
      path: "/game",
      name: "game",
      component: GamePage
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/"
    }
  ],
  scrollBehavior: () => ({ left: 0, top: 0 })
});
