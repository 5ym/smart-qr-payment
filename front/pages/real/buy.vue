<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  data: () => ({
    intent: {
      callbackUrl: 'https://sqp.doany.io/square',
      applicationId: 'sq0idp-4X1uFjfRhZnG4pc2Q_RCZg',
      currencyCode: 'JPY',
      sdkVersion: 'v2.0'
    },
    valid: true,
    loading: true,
    rules: {
      count: [
        v => /^\d+$/.test(v) || ''
      ]
    },
    cards: [
      { id: 1, price: 0, title: 'Now loading', desc: '', image: '' }
    ],
    count: [],
    data: {
      userproducts: []
    }
  }),
  created () {
    if (useCookie('token').value === '') { useRouter().push('/login') }
    axios.get('/api/products').then((response) => {
      this.loading = false
      this.cards = response.data
      this.cards.forEach((i) => {
        this.count[i.id] = 0
      })
    })
  },
  methods: {
    countUp (id) {
      this.count[id] = Number(this.count[id]) + 1
      this.count = JSON.parse(JSON.stringify(this.count))
    },
    countDown (id) {
      this.count[id] = Number(this.count[id]) - 1
      this.count = JSON.parse(JSON.stringify(this.count))
    },
    square () {
      if (this.$refs.form.validate()) {
        this.loading = true
        const self = this
        this.data.userproducts = []
        this.count.forEach((v, k) => {
          if (v) { self.data.userproducts.push({ product: k, count: v }) }
        })
        let transactionTotal = 0
        this.cards.forEach((v) => {
          transactionTotal += v.price * this.count[v.id]
        })
        axios.post('/api/buy', this.data, { headers: { Authorization: 'JWT ' + useCookie('token').value } }).then((response) => {
          this.loading = false
          const tenderTypes =
              'com.squareup.pos.TENDER_CARD,' +
              'com.squareup.pos.TENDER_CASH'
          const posUrl =
              'intent:#Intent;' +
              'action=com.squareup.pos.action.CHARGE;' +
              'package=com.squareup;' +
              'S.com.squareup.pos.WEB_CALLBACK_URI=' + this.intent.callbackUrl + ';' +
              'S.com.squareup.pos.CLIENT_ID=' + this.intent.applicationId + ';' +
              'S.com.squareup.pos.API_VERSION=' + this.intent.sdkVersion + ';' +
              'i.com.squareup.pos.TOTAL_AMOUNT=' + transactionTotal + ';' +
              'S.com.squareup.pos.CURRENCY_CODE=' + this.intent.currencyCode + ';' +
              'S.com.squareup.pos.TENDER_TYPES=' + tenderTypes + ';' +
              'l.com.squareup.pos.AUTO_RETURN_TIMEOUT_MS=3200;' +
              'S.com.squareup.pos.REQUEST_METADATA=' + response.data.pay.code + ';' +
              'end'
          window.open(posUrl)
        }).catch((e) => {
          this.loading = false
          if (e.response.status === 401) {
            useRouter().push('/login')
          } else if (e.response.status === 403) {
            useRouter().push('/404')
          } else if (e.response.status === 400) {
            Swal.fire({
              title: 'Error',
              text: '選択内容をお確かめください。',
              showConfirmButton: false,
              showCloseButton: false
            })
          } else {
            Swal.fire({
              title: 'Error',
              text: '送信時にエラーが発生しました。入力内容をお確かめにうえ再度送信してください。',
              showConfirmButton: false,
              showCloseButton: false
            })
          }
        })
      }
    }
  }
}
</script>
<template>
  <v-container>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <div class="text-h6">
        欲しい商品の数量を指定してください
      </div>
      <v-row justify="space-around">
        <v-col
          v-for="card in cards"
          :key="card.id"
          xs="12"
          sm="8"
          lg="4"
          md="5"
        >
          <v-card>
            <v-img
              :src="'/img/' + card.image"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              class="text-white align-end"
              height="400px"
            >
              <v-card-title>{{ card.price }}円</v-card-title>
            </v-img>
            <v-card-title>{{ card.title }}</v-card-title>
            <v-card-subtitle>{{ card.desc }}</v-card-subtitle>
            <v-card
              class="d-flex flex-row justify-end"
              flat
            >
              <v-card
                class="pa-2"
                flat
              >
                <v-btn
                  color="red"
                  @click="countDown(card.id)"
                >
                  <v-icon dark>
                    mdi-minus
                  </v-icon>
                </v-btn>
              </v-card>
              <v-card
                class="pa-1"
                flat
                width="64px"
              >
                <v-text-field
                  v-model="count[card.id]"
                  :rules="rules.count"
                  class="centered-input"
                />
              </v-card>
              <v-card
                class="pa-2"
                flat
              >
                <v-btn
                  color="blue"
                  @click="countUp(card.id)"
                >
                  <v-icon dark>
                    mdi-plus
                  </v-icon>
                </v-btn>
              </v-card>
            </v-card>
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
            to="/real"
          >
            戻る
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn
            block
            color="primary"
            size="x-large"
            :disabled="!valid || loading"
            :loading="loading"
            @click="square"
          >
            確定
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<style scoped>
  html {
    user-select: none;
  }
</style>
