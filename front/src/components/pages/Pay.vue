<style>
  .centered-input input {
    text-align: center;
    font-size: 2em;
  }
</style>
<template>
  <v-container>
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
            <div id="card-element"></div>
            <div id="card-errors" role="alert"></div>
            <v-btn class="pink white--text" @click='submit' :disabled='loading' :loading='loading'>支払</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  import axios from "axios";
  import router from "../../router";
  import Vue from "vue";
  import Swal from "sweetalert2";

  export default {
    data: () => ({
      loading: false,
      desserts: [{id: 0, name: 'Now loading', price: 0, count: 0, subtotal: 0,},],
      total: 0,
      stripe: Stripe(Vue.prototype.$pk),
      card: null
    }),
    mounted() {
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
      // card element
      const elements = this.stripe.elements();
      this.card = elements.create("card");
      this.card.mount("#card-element");
      this.card.on('change', function(event) {
        var displayError = document.getElementById('card-errors');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      });
    },
    created() {
      this.$session.start();
      axios.get(location.protocol + "//" + window.location.hostname + "/api/order", {headers: { Authorization: "JWT " + this.$session.get("token") }}).then(response => {
        if(response.data.pay !== null)
          router.push("/qr");
        this.desserts = [];
        response.data.userproducts.forEach(i => {
          this.desserts.push({id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count});
          this.total += i.price * i.count;
        });
        this.desserts.push({count: "合計", subtotal: this.total});
      }).catch(e => {
        if (e.response.status === 401) router.push("/login");
      });
    },
    methods: {
      submit() {
        this.loading = true;
        this.stripe.createToken(this.card).then(result => {
          if (!result.error) {
            axios.post(location.protocol + "//" + window.location.hostname + "/api/pay", {token: result.token.id}, {headers: { Authorization: "JWT " + this.$session.get("token") }}).then(response => {
              this.loading = false;
              Swal.fire({
                type: "warning",
                title: "決済完了",
                html: "カード決済が完了しました。3秒後にQRコード画面に移動します。",
                showConfirmButton: false,
                showCloseButton: false,
                timer: 3000,
                onClose: closemes
              });
              function closemes(){
                router.push("/qr");
              }
            }).catch(e => {
              this.loading = false;
              if (e.response.status === 401) {
                router.push("/login");
              } else {
                Swal.fire({
                  type: "warning",
                  title: "Error",
                  html: "カード決済時にエラーが発生しました。別のカードをお試しいただくか、カード会社にお問い合わせください。<br>エラーメッセージ<br>"+e.response.data[0],
                  showConfirmButton: false,
                  showCloseButton: false,
                });
              }
            });
          }
        });
      }
    }
  };
</script>