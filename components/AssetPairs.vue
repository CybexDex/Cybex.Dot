<template>
  <span class="asset-pair-wrapper" :style="styleObject" :title="title">
    <!-- 如果只有单个id或者名字 -->
    <template v-if="assetName">
      <div class="asset-name single">
        {{ assetName }}
      </div>
    </template>
    <!-- 如果是交易对 -->
    <template v-else>
      <div class="asset-name pairs" :style="quoteStyleObject">
        <span>{{ quoteName }}</span>
      </div>
      <template v-if="spacer">&nbsp;/&nbsp;</template>
      <template v-else>/</template>
      <div class="asset-name pairs">
        <span>{{ baseName }}</span>
      </div>
    </template>
  </span>
</template>

<script>
export default {
  props: {
    maxWidth: {
      type: String,
      default: ''
    },
    maxQuoteWidth: {
      type: String,
      default: ''
    },
    colorOpacity: {
      type: Number,
      default: 1
    },
    baseName: {
      type: String,
      default: ''
    },
    quoteName: {
      type: String,
      default: ''
    },
    spacer: {
      type: Boolean,
      default: true
    },
    assetName: {
      type: String,
      default: ''
    }
  },

  computed: {
    styleObject() {
      const obj = {}
      if (this.maxWidth) {
        obj['max-width'] = this.maxWidth
      }
      return obj
    },
    quoteStyleObject() {
      let obj = {}
      if (this.maxQuoteWidth) {
        obj['max-width'] = this.maxQuoteWidth
      }
      if (this.isCustomQuoteName) {
        obj = Object.assign(obj, this.colorObject)
      }
      return obj
    },
    colorObject() {
      return {
        opacity: this.colorOpacity
      }
    },
    title() {
      return this.assetName
        ? this.assetName
        : `${this.quoteName}
         / ${this.baseName}`
    }
  },

  methods: {}
}
</script>
<style lang="scss">
// dropdown
.asset-dropdown {
  .v-select-list.ps {
    max-height: 300px;
    overflow-y: auto;
  }
}
.asset-pair-wrapper {
  display: inline-flex;
  max-width: 100%;

  .asset-name {
    overflow: hidden;
    max-width: 100%;
    text-align: left;

    &.pairs {
      display: inline-flex;
      flex: 0 1 auto;
      &:first-child {
        flex-shrink: 0;
      }

      > * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.single {
      min-width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// button
.v-btn {
  &.theme--cybex-dark {
    .c-custom-coin {
      color: rgba(white, 1) !important;
    }

    &.v-btn--disabled {
      .c-custom-coin {
        color: rgba(120, 129, 154, 0.3) !important;
      }
    }
  }
}

// table
.cybex {
  .v-table.theme--dark {
    tr {
      &:hover {
        td {
          .c-custom-coin {
            color: rgba(#ffc478, 1) !important;
            opacity: 1;
          }
        }
      }

      td {
        .c-custom-coin {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
