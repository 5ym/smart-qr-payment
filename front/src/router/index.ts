import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Top from "@/components/pages/Top.vue";
import Register from "@/components/pages/Register.vue";
import Login from "@/components/pages/Login.vue";
import Verify from "@/components/pages/Verify.vue";
import Not from "@/components/pages/Not.vue";
import Pay from "@/components/pages/Pay.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {path: "/", name: "Top", component: Top},
    {path: "/register", name: "Register", component: Register},
    {path: '/login', name: 'Login', component: Login},
    {path: '/verify/:code', name: 'Verify', component: Verify},
    {path: '/pay', name: 'Pay', component: Pay},
    {path: '*', name: 'Not', component: Not}
  ]
});

export default router;
