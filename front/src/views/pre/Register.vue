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
    <v-form v-else ref="form" v-model="valid" lazy-validation>
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
      <div class="text-h6">メールアドレスとパスワードを入力して<br>注文内容に誤りがなければ送信をクリックしてください。</div>
      <v-row justify="space-around" row="center">
        <v-col xs=12 sm=8 lg=4 md=5>
          <v-card>
            <v-card-text>
              <v-container>
                <v-text-field
                  type="email"
                  v-model="data.email"
                  :counter="70"
                  label="メールアドレス"
                  :rules="rules.email"
                  maxlength="70"
                  required
                />
                <v-text-field
                  type="password"
                  v-model="data.password"
                  :counter="20"
                  label="パスワード"
                  :rules="rules.password"
                  maxlength="20"
                  required
                />
              </v-container>
              <v-btn class="pink white--text" :disabled="!valid" @click="register">送信</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
  import axios from "axios";
  import Swal from "sweetalert2";
  

  export default {
    data: () => ({
      count: [],
      data: {
        userproducts: []
      },
      valid: true,
      loading: false,
      rules: {
        count: [
          v => /^\d+$/.test(v) || ""
        ],
        email: [
          v => !!v || "メールアドレスは必須です"
        ],
        password: [
          v => !!v || "パスワードは必須です",
          v => (v && v.length > 7) || "パスワードは8文字以上でなければなりません"
        ]
      },
      cards: [
        { id: 1, price: 0, title: 'Now loading', desc: '', image: ''},
      ],
    }),
    created () {
      axios.get(location.protocol+"//"+window.location.hostname+"/api/products").then(response => {
        this.cards = response.data;
        this.cards.forEach((i) => {
          this.count[i.id] = 0;
        });
      });
    },
    methods: {
      countUp(id) {
        this.count[id] = Number(this.count[id]) + 1;
        this.count = JSON.parse(JSON.stringify(this.count));
      },
      countDown(id) {
        this.count[id] = Number(this.count[id]) - 1;
        this.count = JSON.parse(JSON.stringify(this.count));
      },
      register() {
        if (this.$refs.form.validate()) {
          this.loading = true;
          var self = this;
          this.data.userproducts = [];
          this.count.forEach((v, k) => {
            if(v)
              self.data.userproducts.push({product: k, count:v});
          });
          axios.post(location.protocol+"//"+window.location.hostname+"/api/register", this.data).then(res => {
            this.loading = false;
            Swal.fire({
              title: "送信完了",
              html: "メールを送信いたしました。メールをご確認ください。<br><a href='https://mail.google.com/'>Gmail</a><br><a href='android-app://com.google.android.gm'>受信ボックス(Android)</a><br><a href='message:'>受信ボックス(iOS)</a>",
              showConfirmButton: false,
              showCloseButton: false,
              onClose: closemes
            });
            function closemes(){
              router.go(0);
            }
          }).catch(e => {
            this.loading = false;
            Swal.fire({
              title: "Error",
              text: "送信時にエラーが発生しました。入力内容をお確かめにうえ再度送信してください。",
              showConfirmButton: false,
              showCloseButton: false,
            });
          });
        }
      }
    }
  }
</script>