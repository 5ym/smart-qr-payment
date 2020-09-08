import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Auth from "@/components/pages/Auth.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Auth",
    component: Auth
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
