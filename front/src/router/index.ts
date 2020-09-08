import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Top from "@/components/pages/Top.vue";
import Register from "@/components/pages/Register.vue";
import Login from "@/components/pages/Login.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Top",
      component: Top
    },
    {
      path: "/register",
      name: "Register",
      component: Register
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
});

export default router;
