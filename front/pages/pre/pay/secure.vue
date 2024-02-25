<template>
  <v-container fill-height>
    <v-row
      justify="space-around"
      row="center"
    >
      <v-col
        xs="12"
        sm="8"
        lg="4"
        md="5"
      >
        <v-card>
          <v-card-title>処理中...</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from 'axios'

export default {
  created () {
    if (window === window.parent) { useRouter().push('/404') }
    if (useCookie('token').value === '') { useRouter().push('/login') }
    if (!useRoute().query.payment_intent) { window.top.postMessage('3DS-authentication-complete') }
    axios.post('/api/pay/secure', { token: useRoute().query.payment_intent }, { headers: { Authorization: 'JWT ' + useCookie('token').value } }).then(() => {
      window.top.postMessage('3DS-authentication-complete')
    }).catch((e) => {
      if (e.response.status === 401) {
        useRouter().push('/login')
      } else {
        window.top.postMessage('3DS-authentication-complete')
      }
    })
  }
}
</script>
