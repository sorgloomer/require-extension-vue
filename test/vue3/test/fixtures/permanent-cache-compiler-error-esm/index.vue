<template>
  <p class="blue">Permanent Cache Compiler Error (esm)</p>

  <p v-if="true" key="same-key">PCCE: Key 1</p>
  <p v-else key="same-key">PCCE: Key 2</p>
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
