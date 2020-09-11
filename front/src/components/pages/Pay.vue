<template>
</template>
<script>
    import axios from "axios";
    import router from "../../router";
    export default {
        mounted() {
            this.$session.start();
            if (!this.$session.has("token"))
                router.push("/login");
        },
        created() {
            this.$session.start();
            axios.get(location.protocol+"//"+window.location.hostname+"/api/order", {headers: {"Authorization": "JWT "+this.$session.get("token")}}).then(response => {
                console.log(response.data);
            }).catch(e => {
                if(e.response.status === 401)
                    router.push("/login");
            });
        },
    }
</script>