<template>
</template>
<script>
  import axios from "axios";
  import router from "../../router";
  import Swal from "sweetalert2";
  export default {
    created () {
      axios.put(location.protocol+"//"+window.location.hostname+"/api/verify/"+this.$route.params.code+'/').then(response => {
        Swal.fire({
          type: "info",
          title: "確認完了",
          text: "メールアドレスの確認が完了しました。3秒後にログイン画面に移動します。その後支払画面に移動します。",
          showConfirmButton: false,
          showCloseButton: false,
          timer: 3000,
          onClose: DeleteUnsavedImages
        });
        function DeleteUnsavedImages(){
          router.push('/pay');
        }
      }).catch(e => {
        if(e.response.status === 404) {
          router.push('/404');
        } else {
          Swal.fire({
            type: "warning",
            title: "Error",
            text: "エラーが発生しました。管理者までお問い合わせください。",
            showConfirmButton: false,
            showCloseButton: false,
            onClose: DeleteUnsavedImages
          });
          function DeleteUnsavedImages(){
            router.go(-1);
          }
        }
      });
    },
  }
</script>