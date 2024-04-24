<template>
  <p class="blue">Source Map Babel (esm)</p>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SourceMapBabelEsm',

  methods: {
    test() {
      throw new Error('just tracing');
    },
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
