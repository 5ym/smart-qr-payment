<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { loadStripe } from '@stripe/stripe-js'

export default {
  data: () => ({
    loading: false,
    desserts: [{ id: 0, title: 'Now loading', price: 0, count: 0, subtotal: 0 }],
    total: 0,
    stripe: null,
    card: null,
    dialog: false,
    iframe: null,
    intent: null,
    email: 'Now loading...'
  }),
  async mounted () {
    // card element
    this.stripe = await loadStripe(useRuntimeConfig().public.stripePublic)
    this.card = this.stripe.elements().create('card')
    this.card.mount('#card-element')
    this.card.on('change', function (event) {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })
    const self = this
    window.addEventListener('message', function (ev) {
      if (ev.data === '3DS-authentication-complete') {
        self.dialog = false
        self.stripe.retrievePaymentIntent(self.intent).then((result) => {
          if (result.paymentIntent.status !== 0 && result.paymentIntent.status === 'succeeded') {
            Swal.fire({
              title: '決済完了',
              html: 'カード決済が完了しました。3秒後にQRコード画面に移動します。',
              showConfirmButton: false,
              showCloseButton: false,
              timer: 3000,
              onClose: () => { useRouter().push('/pre/qr') }
            })
          } else {
            Swal.fire({
              title: 'Error',
              html: 'カード決済時にエラーが発生しました。別のカードをお試しいただくか、カード会社にお問い合わせください。',
              showConfirmButton: false,
              showCloseButton: false
            })
          }
        })
      }
    }, false)
  },
  created () {
    if (useCookie('token').value === '') { useRouter().push('/login') }
    axios.get('/api/order', { headers: { Authorization: 'JWT ' + useCookie('token').value } }).then((response) => {
      if (response.data.pay !== null) { useRouter().push('/pre/qr') }
      this.email = response.data.email
      this.desserts = []
      response.data.userproducts.forEach((i) => {
        this.desserts.push({ id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count })
        this.total += i.price * i.count
      })
      this.desserts.push({ count: '合計', subtotal: this.total })
    }).catch((e) => {
      if (e.response.status === 401) { useRouter().push('/login') }
    })
  },
  methods: {
    submit () {
      this.loading = true
      this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card
      }).then((result) => {
        axios.post('/api/pay', { token: result.paymentMethod.id }, { headers: { Authorization: 'JWT ' + useCookie('token').value } }).then(() => {
          this.loading = false
          Swal.fire({
            title: '決済完了',
            html: 'カード決済が完了しました。3秒後にQRコード画面に移動します。',
            showConfirmButton: false,
            showCloseButton: false,
            timer: 3000,
            onClose: () => { useRouter().push('/pre/qr') }
          })
        }).catch((e) => {
          this.loading = false
          if (e.response.status === 401) {
            useRouter().push('/login')
          } else if (e.response.data[0] === 'req') {
            this.stripe.retrievePaymentIntent(e.response.data[1]).then((r) => {
              this.intent = r.paymentIntent.client_secret
              this.iframe = r.paymentIntent.next_action.redirect_to_url.url
              this.dialog = true
            })
          } else {
            Swal.fire({
              title: 'Error',
              html: 'カード決済時にエラーが発生しました。別のカードをお試しいただくか、カード会社にお問い合わせください。<br>エラーメッセージ<br>' + e.response.data[0],
              showConfirmButton: false,
              showCloseButton: false
            })
          }
        })
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
<template>
  <v-container>
    <v-dialog
      v-model="dialog"
      persistent
      width="1200"
    >
      <div class="resp">
        <iframe :src="iframe" />
      </div>
    </v-dialog>
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
        lg="5"
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
    <div class="text-h6">
      注文内容に誤りがなければ支払情報を入力して支払をクリックしてください。
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
          <v-card-text>
            <div id="card-element" />
            <div
              id="card-errors"
              role="alert"
            />
            <v-btn
              class="bg-pink text-white mt"
              :disabled="loading"
              :loading="loading"
              @click="submit"
            >
              支払
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
  .resp {
    position:relative;
    height:0;
    padding-top:90vh;
    background: white;
  }
  .resp>iframe {
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    border: none;
  }
  .mt {
    margin-top: 1em;
  }
</style>
