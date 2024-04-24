<template>
  <p class="blue">template: Script Setup Script (cjs): {{ msg }}</p>
</template>

<script setup>
const { ref, computed } = require('vue');

const props = defineProps({
  foo: {
    type: String,
    required: true,
  },

  bar: {
    type: Number,
    default: 0,
  },
});
console.log(props.foo);

const emit = defineEmits({
  change: (id) => id > 0,
  update: (value) => value !== '',
});

emit('change', 1);

const msg = ref("script setup: Hello Script Setup Script (cjs)'");

const count = ref(0);

const double = computed(() => count.value * 2);

console.log(double.value);
</script>

<script>
const { defineComponent } = require('vue');

exports = module.exports = defineComponent({
  name: 'ScriptSetupScriptCjs',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
