<template>
  <div>
    <!-- some comment node before a div (parseMode sfc breaks on this) -->
    <div class="blue">Comment Node (cjs): {{ name }}</div>
  </div>
</template>

<script>
const { defineComponent } = require('vue');

exports = module.exports = defineComponent({
  name: 'CommentNodeCjs',
});
</script>

<style>
.class = {
  color: #00f;
}
</style>
