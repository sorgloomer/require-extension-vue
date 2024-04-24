<template>
  <div>
    <!-- some comment node before a div (parseMode sfc breaks on this) -->
    <div class="blue">Comment Node (esm): {{ name }}</div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommentNodeEsm',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
