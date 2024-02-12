<template>
  <v-container>
    <v-row justify="space-around" row="center" v-for="order in orders" :key="order.email">
      <v-col>
        <v-card>
          <v-card-title>{{ order.email }}</v-card-title>
          <v-card-text>
            <v-simple-table>
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
                <tr v-for="item in order.desserts" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.price }}</td>
                  <td>{{ item.count }}</td>
                  <td>{{ item.subtotal }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="space-around" row="center">
      <v-col>
        <v-card ripple color="primary" dark @click="get" :disabled='loading' :loading='loading'>
          <v-card-title>更新</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  
  import axios from "axios";

  export default {
    data: () => ({
      orders: [
        {desserts: [{ id: 0, title: "Now loading", price: 0, count: 0, subtotal: 0 }], email: "Now loading..."}
      ],
      loading: false,
    }),
    created() {
      this.$session.start();
      if (!this.$session.has("token")) this.$router.push("/login");
      this.get();
    },
    methods: {
      get() {
        this.loading = true;
        axios.get("/api/orad/list").then(response => {
          this.loading = false;
          this.orders = [];
          const self = this;
          response.data.forEach(item => {
            const desserts = [];
            let total = 0;
            item.user.userproducts.forEach(i => {
              desserts.push({id: i.product.id, title: i.product.title, price: i.price, count: i.count, subtotal: i.price * i.count});
              total += i.price * i.count;
            });
            desserts.push({count: "合計", subtotal: total});
            self.orders.push(
              {desserts: desserts, email: item.user.email}
            );
          });
        }).catch(e => {
          this.loading = false;
          if(e.response.status === 401) this.$router.push("/login");
          if(e.response.status === 403) this.$router.push("/404");
        });
      }
    }
  };
</script>