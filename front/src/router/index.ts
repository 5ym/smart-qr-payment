import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Top from "@/views/Top.vue";
import Register from "@/views/pre/Register.vue";
import Login from "@/views/pre/Login.vue";
import Verify from "@/views/pre/Verify.vue";
import Not from "@/views/pre/Not.vue";
import Pay from "@/views/pre/Pay.vue";
import Qr from "@/views/pre/Qr.vue";
import Secure from "@/views/pre/Secure.vue";
import Real from "@/views/real/Real.vue";
import Accept from "@/views/real/Accept.vue";
import Buy from "@/views/real/Buy.vue";
import Confirm from "@/views/real/Confirm.vue";

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
    {path: '/qr', name: 'Qr', component: Qr},
    {path: '/pay/secure', name: 'Secure', component: Secure},
    {path: '/real', name: 'Real', component: Real},
    {path: '/accept', name: 'Accept', component: Accept},
    {path: '/confirm/:code', name: 'Confirm', component: Confirm},
    {path: '/buy', name: 'Buy', component: Buy},
    {path: '*', name: 'Not', component: Not}
  ]
});

export default router;
