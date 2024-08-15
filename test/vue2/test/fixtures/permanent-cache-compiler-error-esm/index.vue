<template>
  <div>
    <p class="blue">Permanent Cache Compiler Error (esm)</p>
  
    <p v-else key="same-key">PCCE: v-else only</p>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PermanentCacheCompilerErrorEsm',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
