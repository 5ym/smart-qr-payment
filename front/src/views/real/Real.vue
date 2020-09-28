<style scoped>
  html {
    user-select: none;
  }
</style>
<template>
  <v-container fill-height>
    <v-row justify="space-around" row="center">
      <v-col cols="4">
        <v-card ripple color="primary" dark to="./accept">
          <v-img
            src='/api/img/real0.png'
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="400px"
          ></v-img>
          <v-card-title>受け取り</v-card-title>
          <v-card-subtitle>事前購入された方はこちら</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card ripple color="secondary" dark to="./buy">
          <v-img
            src='/api/img/real1.png'
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="400px"
          ></v-img>
          <v-card-title>当日購入</v-card-title>
          <v-card-subtitle>当日お買い求めの方はこちら</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="space-around">
      <v-col cols="9">
        <v-card>
          <v-card-text>
            <v-img
              src='https://images.ctfassets.net/2d5q1td6cyxq/gfu8jbkN40RRqeHM0I6Km/4c6a44e6d3a5ca6bc7b9ed457754196f/FA_eMoney_Logo_PW-01.png?w=680&h=132&fm=webp&q=85&fit=scale'
            ></v-img>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
  import router from "../../router";

  export default {
    created() {
      this.$session.start();
      if (!this.$session.has("token")) router.push("/login");
    }
  }
</script>