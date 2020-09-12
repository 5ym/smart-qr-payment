<template>
  
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