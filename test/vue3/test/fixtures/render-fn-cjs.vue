<template>
  <p class="blue">template: Should not be seen!: {{ msg }}</p>
</template>

<script>
const { defineComponent, h } = require('vue');

exports = module.exports = defineComponent({
  name: 'RenderFnCjs',

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
    return { msg: "data: Hello Render Fn (cjs)'", count: 1 };
  },

  computed: {
    double() {
      return this.count * 2;
    },
  },

  render() {
    return h('p', 'Render Fn (cjs)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
