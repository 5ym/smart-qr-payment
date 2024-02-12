import axios from 'axios'

export default defineNuxtPlugin(() => {
  axios.defaults.xsrfHeaderName = 'x-csrftoken'
  axios.defaults.xsrfCookieName = 'csrftoken'
})
