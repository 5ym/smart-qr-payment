<template>
</template>
<script>
    import router from "../../router";
    import axios from "axios";

    export default {
        created() {
            if(!/[a-zA-Z_0-9]{16}/.test(this.$route.params.code))
                router.push("/404");
            this.$session.start();
            if (!this.$session.has("token")) router.push("/login");
        },
    }
</script>