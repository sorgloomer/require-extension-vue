<template>
  <p class="blue">Script Setup Script Ts</p>
</template>

<script setup lang="ts">
const { ref } = require('vue');
const msg = ref("Hello Script Setup Script'");
console.log(msg);
</script>

<style>
.class {
  color: #00f;
}
</style>
