<template>
  <v-container fill-height>
    <v-row justify="space-around" row="center">
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card ripple color="primary" dark to="./accept">
          <v-card-title>受け取り</v-card-title>
          <v-card-subtitle>事前購入された方はこちら</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col xs="12" sm="8" lg="4" md="5">
        <v-card ripple color="secondary" dark to="./buy">
          <v-card-title>当日購入</v-card-title>
          <v-card-subtitle>当日お買い求めの方はこちら</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
</script>