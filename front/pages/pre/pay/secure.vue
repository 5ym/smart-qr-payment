<template>
  <v-container fill-height>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-title>処理中...</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from 'axios'
import { getCookie } from '../../../util/session'

export default {
  created () {
    if (window === window.parent) { this.$router.push('/404') }
    if (getCookie('token') === '') { this.$router.push('/login') }
    if (!this.$route.query.payment_intent) { window.top.postMessage('3DS-authentication-complete') }
    axios.post('/api/pay/secure', { token: this.$route.query.payment_intent }, { headers: { Authorization: 'JWT ' + getCookie('token') } }).then(() => {
      window.top.postMessage('3DS-authentication-complete')
    }).catch((e) => {
      if (e.response.status === 401) {
        this.$router.push('/login')
      } else {
        window.top.postMessage('3DS-authentication-complete')
      }
    })
  }
}
</script>
