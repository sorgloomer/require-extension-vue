<template>
  <p class="blue">Source Map Babel</p>
</template>

<script>
export default {
  name: 'SourceMapBabel',

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
