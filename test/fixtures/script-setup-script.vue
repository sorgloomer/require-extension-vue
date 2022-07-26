<template>
  <p class="blue">Script Setup Script</p>
</template>

<script setup>
const { ref } = require('vue');
const msg = ref("Hello Script Setup Script'");
</script>

<script>
module.exports = {
  name: 'ScriptSetupScript',
};
</script>

<style>
.class = {
  color: #00f;
}
</style>
