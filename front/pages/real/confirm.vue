<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  data: () => ({
    desserts: [
      { id: 0, title: 'Now loading', price: 0, count: 0, subtotal: 0 }
    ],
    total: 0,
    email: 'Now loading...',
    loading: true
  }),
  created () {
    if (!/[a-zA-Z_0-9]{16}/.test(useRoute().params.code)) {
      useRouter().push('/404')
    }
    if (useCookie('token').value === '') {
      useRouter().push('/login')
    }
    axios
      .get('/api/orad/get/' + useRoute().params.code, {
        headers: { Authorization: 'JWT ' + useCookie('token').value }
      })
      .then((response) => {
        this.loading = false
        if (response.data.receive) {
          Swal.fire({
            title: 'Error',
            html: '受け取り済みのQRコードです。3秒後にQR読み込み画面に戻ります。',
            showConfirmButton: false,
            showCloseButton: false,
            timer: 3000,
            onClose: () => {
              useRouter().push('/accept')
            }
          })
        } else {
          this.email = response.data.user.email
          this.desserts = []
          response.data.user.userproducts.forEach((i) => {
            this.desserts.push({
              id: i.product.id,
              title: i.product.title,
              price: i.price,
              count: i.count,
              subtotal: i.price * i.count
            })
            this.total += i.price * i.count
          })
          this.desserts.push({ count: '合計', subtotal: this.total })
        }
      })
      .catch((e) => {
        this.loading = false
        if (e.response.status === 401) {
          useRouter().push('/login')
        }
        if (e.response.status === 403) {
          useRouter().push('/404')
        }
        if (e.response.status === 404) {
          Swal.fire({
            title: 'Error',
            html: '不正なQRコードです。3秒後にQR読み込み画面に戻ります。',
            showConfirmButton: false,
            showCloseButton: false,
            timer: 3000,
            onClose: () => {
              useRouter().push('/accept')
            }
          })
        }
      })
  },
  methods: {
    confirm () {
      this.loading = true
      axios
        .put(
          '/api/orad/receive/' + useRoute().params.code,
          { code: useRoute().params.code },
          { headers: { Authorization: 'JWT ' + useCookie('token').value } }
        )
        .then(() => {
          this.loading = false
          Swal.fire({
            title: 'Complete',
            html: 'お買い上げありがとうございます。<br>商品をお渡しします。5秒後にトップに戻ります。',
            showConfirmButton: false,
            showCloseButton: false,
            timer: 5000,
            onClose: () => {
              useRouter().push('/real')
            }
          })
        })
        .catch((e) => {
          this.loading = false
          if (e.response.status === 401) {
            useRouter().push('/login')
          }
          if (e.response.status === 403) {
            useRouter().push('/404')
          }
          if (e.response.status === 404) {
            Swal.fire({
              title: 'Error',
              html: '不正なQRコードです。3秒後にQR読み込み画面に戻ります。',
              showConfirmButton: false,
              showCloseButton: false,
              timer: 3000,
              onClose: () => {
                useRouter().push('/accept')
              }
            })
          }
        })
    }
  }
}
</script>
<template>
  <v-container>
    <div class="text-h6">
      注文内容をご確認ください。
    </div>
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
          <v-card-title>{{ email }}</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">
                    商品ID
                  </th>
                  <th class="text-left">
                    商品名
                  </th>
                  <th class="text-left">
                    価格
                  </th>
                  <th class="text-left">
                    購入数
                  </th>
                  <th class="text-left">
                    小計
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in desserts"
                  :key="item.id"
                >
                  <td>{{ item.id }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.price }}</td>
                  <td>{{ item.count }}</td>
                  <td>{{ item.subtotal }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      justify="space-around"
      row="center"
    >
      <v-col cols="6">
        <v-btn
          block
          color="secondary"
          size="x-large"
          to="/accept"
        >
          戻る
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          block
          color="primary"
          size="x-large"
          :disabled="loading"
          :loading="loading"
          @click="confirm"
        >
          確定
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
html {
  user-select: none;
}
</style>
