import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import elementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.prototype.$electron = window.require('electron')
Vue.use(elementUi)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
