<template>
      <v-container fill-height>
    <v-row justify="space-around" row="center">
      <v-col cols="4">
        <v-card ripple color="primary" dark to="/register">
          <v-card-title>事前購入</v-card-title>
          <v-card-subtitle>事前購入されたい方はこちら</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card ripple color="secondary" dark to="/real">
          <v-card-title>対面販売</v-card-title>
          <v-card-subtitle>対面販売でのセルフレジを使う場合はこちら</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>