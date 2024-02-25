<script setup lang="ts">
import axios from 'axios'
import Swal from 'sweetalert2'

const valid = ref(true)
const credentials = ref<any>({})
const rules = {
  email: [
    (v: any) => !!v || 'メールアドレスは必須です'
  ],
  password: [
    (v: any) => !!v || 'パスワードは必須です',
    (v: any) => (v && v.length > 7) || 'パスワードは8文字以上でなければなりません'
  ]
}
const loading = ref(false)
const login = () => {
  if (valid) {
    loading.value = true
    axios.post('/api/login/', credentials.value).then((res) => {
      const token = useCookie('token')
      token.value = res.data.token
      useRouter().go(-1)
    })
        .catch(() => {
          loading.value = false
          Swal.fire({
            icon: 'warning',
            title: 'Error',
            text:
                'メールアドレスもしくはパスワード、または両方が間違っています',
            showConfirmButton: false,
            showCloseButton: false,
            timer: 3000
          })
        })
  }
}
</script>
<template>
  <v-container fill-height>
    <v-row
      justify="space-around"
      row="center"
    >
      <v-col
        xs="12"
        sm="8"
        lg="4"
        md="5"
      >
        <v-card>
          <v-card-title>Login to SQP</v-card-title>
          <v-card-text>
            <v-layout
              v-if="loading"
              row
              fill-height
              justify-center
              align-center
            >
              <v-progress-circular
                :size="50"
                color="primary"
                indeterminate
              />
            </v-layout>
            <v-form
              v-else
              ref="form"
              v-model="valid"
              lazy-validation
              @submit.prevent="login"
            >
              <v-text-field
                v-model="credentials.email"
                type="email"
                :counter="70"
                label="メールアドレス"
                :rules="rules.email"
                maxlength="70"
                required
              />
              <v-text-field
                v-model="credentials.password"
                type="password"
                :counter="20"
                label="パスワード"
                :rules="rules.password"
                maxlength="20"
                required
              />
              <v-btn
                class="bg-pink text-white"
                :disabled="!valid"
                type="submit"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>