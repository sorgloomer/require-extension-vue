<template>
  <p class="blue">Should not be seen!</p>
</template>

<script>
exports = module.exports = {
  name: 'RenderFnFunctional',
  functional: true,

  render(h) {
    return h('p', 'Render Fn Functional');
  }
};
</script>

<style>
.class = {
  color: #00f;
}
</style>
