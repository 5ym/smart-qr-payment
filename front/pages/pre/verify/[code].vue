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
import Swal from 'sweetalert2'

export default {
  created () {
    axios.put('/api/verify/' + this.$route.params.code).then(() => {
      Swal.fire({
        type: 'info',
        title: '確認完了',
        text: 'メールアドレスの確認が完了しました。3秒後に支払画面に移動します。',
        showConfirmButton: false,
        showCloseButton: false,
        timer: 3000,
        onClose: () => { this.$router.push('/pre/pay') }
      })
    }).catch(async (e) => {
      if (e.response.status === 404) {
        await this.$router.push('/pre/pay')
      } else {
        await Swal.fire({
          type: 'warning',
          title: 'Error',
          text: 'エラーが発生しました。管理者までお問い合わせください。',
          showConfirmButton: false,
          showCloseButton: false,
          onClose: () => {
            this.$router.go(-1)
          }
        })
      }
    })
  }
}
</script>
