<script>
const { defineComponent, h, ref, computed } = require('vue');

exports = module.exports = defineComponent({
  name: 'RenderFnSetupCjs',

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
    const msg = ref("data: Hello Render Fn Setup (cjs)'");
    const count = ref(1);
    const double = computed(() => count.value * 2);
    console.log(msg, double);
    return () => h('p', 'Render Fn Setup (cjs)');
  },
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
