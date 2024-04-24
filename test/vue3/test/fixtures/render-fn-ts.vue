<template>
  <p class="blue">template: Should not be seen! (ts): {{ msg as string }}</p>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'RenderFnTs',

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
    return { msg: "data: Hello Render Fn (ts)'", count: 1 };
  },

  computed: {
    double(): number {
      return this.count * 2;
    },
  },

  render() {
    return h('p', 'Render Fn (ts)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
