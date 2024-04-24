<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

interface Props {
  foo: string;
  bar?: number;
}

const props = defineProps<Props>();
console.log(props.foo);

const emit = defineEmits<{
  change: [id: number];
  update: [value: string];
}>();

emit('change', 1);

const msg = ref<string>("script setup: Hello Script Setup Script Only (ts)'");
console.log(msg);

const count: Ref<number> = ref(0);

const double = computed<number>(() => count.value * 2);

console.log(double.value);
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ScriptSetupScriptOnlyTs',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
