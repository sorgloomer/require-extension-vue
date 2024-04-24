<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'ScriptOnlyTs',

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
    return { count: 1 };
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
