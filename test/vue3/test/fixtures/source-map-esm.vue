<template>
  <p class="blue">Source Map (esm)</p>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SourceMapEsm',

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
