<template>
  <v-tooltip content-class="generated-tip" :nudge-right="offset" bottom>
    <template v-slot:activator="{ on }">
      <v-icon
        size="14"
        class="notice-icon"
        @click.native="disableCheck($event)"
        v-on="on"
        >ic-help</v-icon
      >
    </template>
    <span style="white-space: pre-wrap;">{{ content }}</span>
  </v-tooltip>
</template>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.generated-tip {
  width: 262px;
  padding: 12px 16px;
  background-color: rgba(17, 22, 33, 0.92);
  opacity: color;
  font-size: 14px;
  @include f-cybex-style(medium);
  line-height: 1.29;
}
</style>

<script>
export default {
  props: {
    content: {
      type: String,
      required: true
    },
    offset: {
      type: Number,
      default: 120
    }
  },
  methods: {
    disableCheck(event) {
      event.stopPropagation()
      // event.preventDefault();
    }
  }
}
</script>
