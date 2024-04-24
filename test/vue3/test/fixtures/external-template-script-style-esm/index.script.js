import { ref, defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ExternalTemplateScriptStyleEsm',

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

  setup() {
    const msg = ref("setup: External Template Script Style (esm)'");
    const count = ref(0);
    const double = computed(() => count.value * 2);
    return { msg, count, double };
  },
});
