import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SourceMapExternalEsm',

  methods: {
    test() {
      throw new Error('just tracing');
    },
  },
});
