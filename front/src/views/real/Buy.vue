<template>
  <v-container>
    <v-form ref="form" v-model="valid" lazy-validation>
      <div class="text-h6">欲しい商品の数量を指定してください</div>
      <v-row justify="space-around">
        <v-col
          v-for="card in cards"
          :key="card.id"
          xs=12 sm=8 lg=4 md=5
        >
          <v-card>
            <v-img
              :src='card.image'
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              class="white--text align-end"
              height="400px"
            >
            <v-card-title v-text="card.price+'円'"></v-card-title>
            </v-img>
            <v-card-title v-text="card.title"></v-card-title>
            <v-card-subtitle v-text="card.desc"></v-card-subtitle>
            <v-card class="d-flex flex-row justify-end" flat>
              <v-card class="pa-2" flat><v-btn color="red" fab dark @click="countDown(card.id)"><v-icon dark>mdi-minus</v-icon></v-btn></v-card>
              <v-card class="pa-1" flat width="32px">
                <v-text-field
                  type="text"
                  v-model="count[card.id]"
                  :rules="rules.count"
                  class="centered-input"
                />
              </v-card>
              <v-card class="pa-2" flat><v-btn color="blue" fab dark @click="countUp(card.id)"><v-icon dark>mdi-plus</v-icon></v-btn></v-card>
            </v-card>
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="space-around" row="center">
        <v-col cols="6">
          <v-btn block color="secondary" x-large to="/real">戻る</v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn block color="primary" x-large @click="square" :disabled="!valid || loading" :loading="loading">確定</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
  import router from "../../router";
  import axios from "axios";

  export default {
    data: () => ({
      intent: {
        callbackUrl: "https://sqp.sub.daco.dev/square",
        applicationId: "sq0idp-4X1uFjfRhZnG4pc2Q_RCZg",
        transactionTotal: "100",
        currencyCode: "JPY",
        sdkVersion: "v2.0"
      },
      valid: true,
      loading: true,
      rules: {
        count: [
          v => /^[0-9]+$/.test(v) || ""
        ],
      },
      cards: [
        { id: 1, price: 0, title: 'Now loading', desc: '', image: ''},
      ],
      count: [],
      data: {
        userproducts: []
      },
    }),
    created () {
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
      axios.get(location.protocol+"//"+window.location.hostname+"/api/products").then(response => {
        this.loading = false;
        this.cards = response.data;
        this.cards.forEach((i) => {
          this.count[i.id] = 0;
        });
      });
    },
    methods: {
      countUp(id) {
        this.count[id] += 1;
        this.count = JSON.parse(JSON.stringify(this.count));
      },
      countDown(id) {
        this.count[id] -= 1;
        this.count = JSON.parse(JSON.stringify(this.count));
      },
      square() {
        if (this.$refs.form.validate()) {
          this.loading = true;
          var self = this;
          this.count.forEach((v, k) => {
            if(v)
              self.data.userproducts.push({product: k, count:v});
          });
        }
        let tenderTypes =
          "com.squareup.pos.TENDER_CARD,"+
          "com.squareup.pos.TENDER_CASH";

        let posUrl =
         "intent:#Intent;" +
         "action=com.squareup.pos.action.CHARGE;" +
         "package=com.squareup;" +
         "S.com.squareup.pos.WEB_CALLBACK_URI=" + this.intent.callbackUrl + ";" +
         "S.com.squareup.pos.CLIENT_ID=" + this.intent.applicationId + ";" +
         "S.com.squareup.pos.API_VERSION=" + this.intent.sdkVersion + ";" +
         "i.com.squareup.pos.TOTAL_AMOUNT=" + this.intent.transactionTotal + ";" +
         "S.com.squareup.pos.CURRENCY_CODE=" + this.intent.currencyCode + ";" +
         "S.com.squareup.pos.TENDER_TYPES=" + tenderTypes + ";" +
         "l.com.squareup.pos.AUTO_RETURN_TIMEOUT_MS=3200;" +
         "S.com.squareup.pos.REQUEST_METADATA=test;" +
         "end";
        
        window.open(posUrl);
      }
    }
  }
</script>