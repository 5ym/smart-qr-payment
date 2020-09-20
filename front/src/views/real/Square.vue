<template>
  <v-container>
    <pre>{{ test }}</pre>
  </v-container>
</template>
<script>
  export default {
    data: () => ({
      test: null
    }),
    created () {
      this.test = this.$route.query;
    }
  }
</script>