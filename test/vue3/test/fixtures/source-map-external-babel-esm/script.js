import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SourceMapExternalBabelEsm',

  methods: {
    test() {
      throw new Error('just tracing');
    },
  },
});
