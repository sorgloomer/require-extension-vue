<template>
  <p class="blue">template: Script (ts): {{ msg as string }}</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'ScriptTs',

  props: {
    foo: {
      type: String as PropType<string>,
      required: true,
    },

    bar: {
      type: Number as PropType<number>,
      default: 0,
    },
  },

  emits: {
    change(id: number): boolean {
      return id > 0;
    },

    update(value: string): boolean {
      return value !== '';
    },
  },

  data() {
    return { msg: 'data: Hello Script (ts)', count: 0 };
  },

  computed: {
    double(): number {
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
