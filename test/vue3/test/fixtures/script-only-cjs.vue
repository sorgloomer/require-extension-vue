<script>
const { defineComponent } = require('vue');

exports = module.exports = defineComponent({
  name: 'ScriptOnlyCjs',

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
    return { count: 1 };
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
