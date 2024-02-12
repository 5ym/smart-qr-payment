<template>
  <v-container>
    <div class="text-h6">
      QRコード
    </div>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-text class="center">
            <vue-qrcode :value="code" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div class="text-h6">
      注文内容
    </div>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-title>{{ email }}</v-card-title>
          <v-card-text class="center">
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
                <tr v-for="item in desserts" :key="item.id">
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
  </v-container>
</template>
<script>
import VueQrcode from '@chenfengyuan/vue-qrcode'
import axios from 'axios'

export default {
  components: {
    VueQrcode
  },
  data: () => ({
    desserts: [{ id: 0, title: 'Now loading', price: 0, count: 0, subtotal: 0 }],
    total: 0,
    code: null,
    email: 'Now loading...'
  }),
  created () {
    this.$session.start()
    if (!this.$session.has('token')) { this.$router.push('/login') }
    axios.get('/api/qr', { headers: { Authorization: 'JWT ' + this.$session.get('token') } }).then((response) => {
      if (response.data.pay === null) { this.$router.push('/pay') }
      this.email = response.data.email
      this.desserts = []
      response.data.userproducts.forEach((i) => {
        this.desserts.push({ id: i.product.id, title: i.product.title, price: i.price + '円', count: i.count, subtotal: i.price * i.count + '円' })
        this.total += i.price * i.count
      })
      this.desserts.push({ count: '合計', subtotal: this.total + '円' })
      this.code = response.data.pay.code
    }).catch((e) => {
      if (e.response.status === 401) { this.$router.push('/login') }
    })
  }
}
</script>
<style scoped>
  .center {
    text-align: center;
  }
</style>
