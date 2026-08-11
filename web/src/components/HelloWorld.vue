<script setup>
const props = defineProps({ msg: String })
</script>
<template>
  <h1 class="text-red-500">{{ props.msg }}</h1>
</template>
