<style>
  .center {
    text-align: center;
  }
</style>
<template>
  <v-container>
    <div class="text-h6">QRコード</div>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-text class="center">
            <vue-qrcode :value="code"></vue-qrcode>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div class="text-h6">注文内容</div>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-text class="center">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">商品ID</th>
                    <th class="text-left">商品名</th>
                    <th class="text-left">価格</th>
                    <th class="text-left">購入数</th>
                    <th class="text-left">小計</th>
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
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  import VueQrcode from "@chenfengyuan/vue-qrcode";
  import axios from "axios";
  export default {
    data: () => ({
      desserts: [{id: 0, name: 'Now loading', price: 0, count: 0, subtotal: 0,},],
      total: 0,
      code: null
    }),
    components: {
      VueQrcode
    },
    created() {
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
      axios.get(location.protocol + "//" + window.location.hostname + "/api/qr", {headers: { Authorization: "JWT " + this.$session.get("token") }}).then(response => {
        if(response.data.pay === null)
          router.push("/pay");
        this.desserts = [];
        response.data.userproducts.forEach(i => {
          this.desserts.push({id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count});
          this.total += i.price * i.count;
        });
        this.desserts.push({count: "合計", subtotal: this.total});
        this.code = response.data.pay.code;
      }).catch(e => {
        if (e.response.status === 401) router.push("/login");
      });
    }
  }
</script>