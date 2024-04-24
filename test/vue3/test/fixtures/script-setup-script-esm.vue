<template>
  <p class="blue">template: Script Setup Script (esm): {{ msg }}</p>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const msg = ref("script setup: Hello Script Setup Script (esm)'");

const count = ref(0);

const double = computed(() => count.value * 2);

console.log(double.value);
</script>

<script>
const { defineComponent } = require('vue');

export default defineComponent({
  name: 'ScriptSetupScriptEsm',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
