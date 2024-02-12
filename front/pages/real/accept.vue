<template>
  <v-container fill-height>
    <div class="text-h6">
      受け取り用QRコードを読み込ませてください。
    </div>
    <v-row justify="space-around" row="center">
      <v-col cols="8">
        <qrcode-stream @decode="onDecode" @init="onInit" />
      </v-col>
    </v-row>
    <v-row justify="space-around" row="center">
      <v-col v-if="error" cols="12">
        <v-card color="primary" dark>
          <v-card-title>{{ error }}</v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-btn block color="secondary" size="x-large" to="/real">
          戻る
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { getCookie } from '../../util/session'

export default {
  components: {
    QrcodeStream
  },
  data: () => ({
    error: ''
  }),
  created () {
    if (getCookie('token') === '') { this.$router.push('/login') }
  },
  methods: {
    onDecode (result) {
      if (/[a-zA-Z_0-9]{16}/.test(result)) {
        this.$router.push('/confirm/' + result)
      } else {
        this.error = '不正なQRコードかQRコードが正しく読み取れませんでした。もう一度読み込み直してください。'
      }
    },
    async onInit (promise) {
      try {
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = 'ERROR: you need to grant camera access permisson'
        } else if (error.name === 'NotFoundError') {
          this.error = 'ERROR: no camera on this device'
        } else if (error.name === 'NotSupportedError') {
          this.error = 'ERROR: secure context required (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          this.error = 'ERROR: is the camera already in use?'
        } else if (error.name === 'OverconstrainedError') {
          this.error = 'ERROR: installed cameras are not suitable'
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = 'ERROR: Stream API is not supported in this browser'
        }
      }
    }
  }
}
</script>
<style scoped>
  html {
    user-select: none;
  }
</style>
