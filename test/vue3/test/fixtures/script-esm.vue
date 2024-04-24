<template>
  <p class="blue">template: Script (esm): {{ msg }}</p>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ScriptEsm',

  props: {
    foo: {
      type: String,
      required: true,
    },

    bar: {
      type: Number,
      default: 0,
    },
  },

  emits: {
    change(id) {
      return id > 0;
    },

    update(value) {
      return value !== '';
    },
  },

  data() {
    return { msg: 'data: Hello Script (esm)', count: 0 };
  },

  computed: {
    double() {
      return this.count * 2;
    },
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
