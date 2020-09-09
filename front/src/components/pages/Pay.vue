<template>
</template>
<script>
    import router from "../../router";
    export default {
        mounted() {
            this.$session.start();
            if (!this.$session.has("token"))
                router.push("/login");
        }
    }
</script>