import { ref, defineComponent, computed } from 'vue';
import type { PropType, Ref } from 'vue';

export default defineComponent({
  name: 'ExternalTemplateScriptStyleTs',

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
    const msg = ref<string>("setup: External Template Script Style (ts)'");
    const count: Ref<number> = ref(0);
    const double = computed<number>(() => count.value * 2);
    return { msg, count, double };
  },
});
