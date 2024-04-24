<template>
  <p class="blue">template: Should not be seen! (esm): {{ msg }}</p>
</template>

<script>
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'RenderFnEsm',

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
    return { msg: "data: Hello Render Fn (esm)'", count: 1 };
  },

  computed: {
    double() {
      return this.count * 2;
    },
  },

  render() {
    return h('p', 'Render Fn (esm)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
