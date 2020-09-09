<template>
  <v-container fill-height>
    <v-row justify="space-around" row="center">
      <v-col xs=12 sm=8 lg=4 md=5>
        <v-card>
          <v-card-title>Login to SQP</v-card-title>
          <v-card-text>
            <v-layout row fill-height justify-center align-center v-if="loading">
              <v-progress-circular :size="50" color="primary" indeterminate />
            </v-layout>
            <v-form v-else ref="form" v-model="valid" lazy-validation>
              <v-container>
                <v-text-field
                  type="email"
                  v-model="credentials.email"
                  :counter="70"
                  label="メールアドレス"
                  :rules="rules.email"
                  maxlength="70"
                  required
                />
                <v-text-field
                  type="password"
                  v-model="credentials.password"
                  :counter="20"
                  label="パスワード"
                  :rules="rules.password"
                  maxlength="20"
                  required
                />
              </v-container>
              <v-btn class="pink white--text" :disabled="!valid" @click="login">Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from "axios";
import Swal from "sweetalert2";
import router from "../../router";
export default {
  data: () => ({
    credentials: {},
    valid: true,
    loading: false,
    rules: {
      email: [
        v => !!v || "メールアドレスは必須です"
      ],
      password: [
        v => !!v || "パスワードは必須です",
        v => (v && v.length > 7) || "パスワードは8文字以上でなければなりません"
      ]
    }
  }),
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        axios.post(location.protocol+"//"+window.location.hostname+"/api/login/", this.credentials).then(res => {
          this.$session.start();
          this.$session.set("token", res.data.token);
          router.go(-1);
        })
        .catch(e => {
          this.loading = false;
          Swal.fire({
            type: "warning",
            title: "Error",
            text:
              "メールアドレスもしくはパスワード、または両方が間違っています",
            showConfirmButton: false,
            showCloseButton: false,
            timer: 3000
          });
        });
      }
    }
  }
};
</script>