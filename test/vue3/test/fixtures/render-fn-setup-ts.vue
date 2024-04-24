<script lang="ts">
import { defineComponent, h, ref, computed } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'RenderFnSetupTs',

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

  setup() {
    const msg = ref<string>("data: Hello Render Fn Setup (ts)'");
    const count = ref<number>(1);
    const double = computed<number>(() => count.value * 2);
    console.log(msg, double);
    return () => h('p', 'Render Fn Setup (ts)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
