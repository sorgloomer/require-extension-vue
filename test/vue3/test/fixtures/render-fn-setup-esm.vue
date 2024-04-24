<script>
import { defineComponent, h, ref, computed } from 'vue';

export default defineComponent({
  name: 'RenderFnSetupEsm',

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
    const msg = ref("data: Hello Render Fn Setup (esm)'");
    const count = ref(1);
    const double = computed(() => count.value * 2);
    console.log(msg, double);
    return () => h('p', 'Render Fn Setup (esm)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
