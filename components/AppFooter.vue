<template>
  <v-footer class="footer-wrap" :fixed="fixed" :height="64" :app="float">
    <v-toolbar class="nav-footer" :height="64">
      <div class="left-footer">
        <a
          v-for="(item, index) in items.left"
          :key="index"
          class="mr-4"
          @click="open(item.url)"
          >{{ $t(`info.${item.text}`) }}</a
        >
      </div>
      <v-spacer />
      <div class="right-footer">
        <a
          v-for="(item, index) in items.right"
          :key="index"
          class="ml-4"
          @click="open(item.url)"
        >
          <v-icon>{{ item.icon }}</v-icon>
        </a>
      </div>
    </v-toolbar>
  </v-footer>
</template>

<script>
import { mapGetters } from 'vuex'
import config from '~/lib/config/config.js'

export default {
  name: 'AppFooter',
  props: {
    float: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      items: {
        left: [
          {
            text: 'about',
            url: config.links.about
          }
        ],
        right: [
          {
            icon: 'ic-telegram',
            url: config.links.telegram
          },
          {
            icon: 'ic-medium',
            url: config.links.medium
          },
          {
            icon: 'ic-instagram_new',
            url: config.links.instagram
          },
          {
            icon: 'ic-twitter',
            url: config.links.twitter
          },
          {
            icon: 'ic-facebook',
            url: config.links.facebook
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters({
      locale: 'i18n/shortcut'
    })
  },
  mounted() {},
  methods: {
    open(obj) {
      if (typeof obj === 'string') {
        window.open(obj)
      } else {
        window.open(obj[this.locale])
      }
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.theme--dark.v-footer.footer-wrap {
  &,
  .nav-footer {
    box-shadow: none;
    background: map-get($main, lead);
    overflow-x: hidden;
  }

  .v-toolbar__content {
    background: map-get($main, lead);
    width: 100%;
    min-width: 1280px;
    word-break: keep-all;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }

  a:hover {
    &,
    .v-icon::before {
      color: map-get($main, lilac) !important;
    }
  }

  .left-footer {
    a {
      font-size: 12px;
      line-height: 2;
      color: rgba(map-get($main, lead), 0.8);
      @include f-cybex-style('black');
    }
  }

  .right-footer {
    .v-icon {
      opacity: 0.8;
      color: map-get($main, grey);
      font-size: 24px;
    }
  }
}
</style>
