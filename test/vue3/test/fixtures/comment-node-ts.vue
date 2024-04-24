<template>
  <div>
    <!-- some comment node before a div (parseMode sfc breaks on this) -->
    <div class="blue">Comment Node (ts): {{ name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommentNodeTs',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
