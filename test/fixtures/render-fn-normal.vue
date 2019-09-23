<template>
  <p class="blue">Should not be seen!</p>
</template>

<script>
exports = module.exports = {
  name: 'RenderFnNormal',

  render(h) {
    return h('p', 'Render Fn Normal');
  }
};
</script>

<style>
.class = {
  color: #00f;
}
</style>
