import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
const VueSession = require('vue-session');
import VueHead from 'vue-head';

Vue.use(VueSession);
Vue.use(VueHead);

Vue.config.productionTip = false;

Vue.use({
  install(Vue) {
    Vue.prototype.$pk = process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_bvs1no5I4wZDM1hcwhDaAXFJ';
  }
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
