<template>
  <p class="blue">Setup Fn</p>
</template>

<script>
module.exports = {
  name: 'SetupFn',

  setup() {
    const { ref } = require('vue');
    const msg = ref("Hello Setup Fn'");
    return { msg };
  },
};
</script>

<style>
.class = {
  color: #00f;
}
</style>
