<script setup>
import { ref, watch } from 'vue'

const isloading = ref(false)
const req = ref('')
const aws = ref('')
const trl = ref('')
watch(aws, async (newValue, oldValue) => {
  if (aws.value.includes('?')) {
    isloading.value = true
    req.value = `dang suy nghĩ ${aws.value}....`
    try {
      await fetch(`https://yesno.wtf/api`)
      trl.value = 'Đúng rồi bạn ơi' + ' ' + newValue + ' ' + oldValue
    } catch {
      trl.value = 'Lỗi rồi bạn ơi'
    } finally {
      isloading.value = false
    }
  }
})
</script>

<template>
  <form action="" @submit.prevent="handleClick" class="flex flex-col gap-2">
    <input
      type="text"
      v-model="aws"
      class="border-2 bg-amber-100 p-2 rounded text-2xl text-amber-300"
    />
    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Submit</button>
  </form>

  <p v-if="isloading">
    {{ req }}
  </p>
  <p>
    {{ trl }}
  </p>

  <!--<HelloWorld msg="Hello Vue 3 + Vite + TypeScript + TailwindCSS" />-->
  HelloWorld
</template>
