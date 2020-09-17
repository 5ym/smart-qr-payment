<template>
  <v-container>
    <div class="text-h6">注文内容をご確認ください。</div>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card>
          <v-card-title>{{ email }}</v-card-title>
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
    <v-row justify="space-around" row="center">
      <v-col cols="6">
        <v-card ripple color="secondary" dark to="/accept">
          <v-card-title>戻る</v-card-title>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card ripple color="primary" dark>
          <v-card-title>確定</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  import router from "../../router";
  import axios from "axios";
  import Swal from "sweetalert2";

  export default {
    data: () => ({
      desserts: [{id: 0, name: 'Now loading', price: 0, count: 0, subtotal: 0,},],
      total: 0,
      email: 'Now loading...'
    }),
    created() {
      if (!/[a-zA-Z_0-9]{16}/.test(this.$route.params.code)) router.push("/404");
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
      axios.get(location.protocol + "//" + window.location.hostname + "/api/orad/" + this.$route.params.code,
          { headers: { Authorization: "JWT " + this.$session.get("token") } }
        ).then(response => {
          console.log(response);
          if(response.data.receive) {
            Swal.fire({
              title: "Error",
              html: "受け取り済みのQRコードです。3秒後にQR読み込み画面に戻ります。",
              showConfirmButton: false,
              showCloseButton: false,
              timer: 3000,
              onClose: closemes
            });
            function closemes(){
              router.push("/accept");
            }
          } else {
            this.email = response.data.user.email;
            this.desserts = [];
            response.data.user.userproducts.forEach(i => {
              this.desserts.push({id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count});
              this.total += i.price * i.count;
            });
            this.desserts.push({count: "合計", subtotal: this.total});
          }
        }).catch(e => {
          if(e.response.status === 401) router.push("/login");
          if(e.response.status === 403) router.push("/404");
          if(e.response.status === 404) {
            Swal.fire({
              title: "Error",
              html: "不正なQRコードです。3秒後にQR読み込み画面に戻ります。",
              showConfirmButton: false,
              showCloseButton: false,
              timer: 3000,
              onClose: closemes
            });
            function closemes(){
              router.push("/accept");
            }
          }
        });
    }
  };
</script>