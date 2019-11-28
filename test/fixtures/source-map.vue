<template>
  <p class="blue">Source Map</p>
</template>

<script>
exports = module.exports = {
  name: 'SourceMap',

  methods: {
    test() {
      throw new Error('just tracing');
    }
  }
};
</script>

<style>
.class = {
  color: #00f;
}
</style>
