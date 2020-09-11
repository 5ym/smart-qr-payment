<style>
  .centered-input input {
    text-align: center;
    font-size: 2em;
  }
</style>
<template>
  <v-container>
    <v-layout row fill-height justify-center align-center v-if="loading">
      <v-progress-circular :size="50" color="primary" indeterminate />
    </v-layout>
    <div v-else>
      <div class="text-h6">注文内容をご確認ください。</div>
      <v-row justify="space-around" row="center">
        <v-col xs="12" sm="8" lg="4" md="5">
          <v-card>
            <v-card-text>
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
      <div class="text-h6">注文内容に誤りがなければ支払情報を入力して支払をクリックしてください。</div>
      <v-row justify="space-around" row="center">
        <v-col xs="12" sm="8" lg="4" md="5">
          <v-card>
            <v-card-text>
              <v-btn class="pink white--text">送信</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
<script>
  import axios from "axios";
  import router from "../../router";
  export default {
    data: () => ({
      loading: false,
      desserts: [{id: 0, name: 'Now loading', price: 0, count: 0, subtotal: 0,},],
      total: 0
    }),
    mounted() {
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
    },
    created() {
      this.$session.start();
      axios.get(location.protocol + "//" + window.location.hostname + "/api/order", {headers: { Authorization: "JWT " + this.$session.get("token") }}).then(response => {
        console.log(response.data);
        this.desserts = [];
        response.data.userproducts.forEach(i => {
          this.desserts.push({id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count});
          this.total += i.price * i.count;
        });
        this.desserts.push({count: "合計", subtotal: this.total});
      }).catch(e => {
        if (e.response.status === 401) router.push("/login");
      });
    }
  };
</script>