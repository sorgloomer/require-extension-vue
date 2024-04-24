<template>
  <p class="blue">template: Script (cjs): {{ msg }}</p>
</template>

<script>
const { defineComponent } = require('vue');

exports = module.exports = defineComponent({
  name: 'ScriptCjs',

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
    return { msg: 'data: Hello Script (cjs)', count: 0 };
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
