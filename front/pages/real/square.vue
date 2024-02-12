<template>
  <v-container>
  </v-container>
</template>
<script>
  import axios from "axios";
  import Swal from "sweetalert2";

  export default {
    data: () => ({
    }),
    created () {
      const query = this.$route.query;
      if(query["com.squareup.pos.CLIENT_TRANSACTION_ID"]) {
        axios.put("/api/orad/receive/" + query["com.squareup.pos.REQUEST_METADATA"],
          {code: query["com.squareup.pos.REQUEST_METADATA"]}, { headers: { Authorization: "JWT " + this.$session.get("token") } }
        ).then(() => {
          Swal.fire({
            title: "Complete",
            html: "お買い上げありがとうございます。<br>商品をお渡しします。5秒後にトップに戻ります。",
            showConfirmButton: false,
            showCloseButton: false,
            timer: 5000,
            onClose: () => {this.$router.push("/real")}
          });
        }).catch(e => {
          this.loading = false;
          if(e.response.status === 401) this.$router.push("/login");
          if(e.response.status === 403) this.$router.push("/404");
          if(e.response.status === 404) this.$router.push("/404");
        });
      } else {
        Swal.fire({
          title: "Error",
          html: query["com.squareup.pos.ERROR_DESCRIPTION"]+"。3秒後に商品選択画面に戻ります。",
          showConfirmButton: false,
          showCloseButton: false,
          timer: 3000,
          onClose: () => {this.$router.push("/buy")}
        });
      }
    }
  }
</script>