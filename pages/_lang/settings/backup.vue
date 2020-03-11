<template>
  <div class="content-container-inner">
    <div class="page-head-title">{{ $t('sub_title.backup_wallet') }}</div>
    <v-tabs v-model="currentTab" slider-color="cybex" dark>
      <v-tab v-for="(tabItem, idx) in tabItems" :key="idx">{{
        tabItem.title
      }}</v-tab>
      <!-- 备份用户列表开始 -->
      <v-tab-item class="backup settings-tab">
        <v-flex class="setting-desc">{{
          $t('info.backup_wallet.desc')
        }}</v-flex>
        <v-flex class="importance grey-border-top grey-border-bottom">
          <v-flex>
            <v-icon class="notice" size="20">ic-info</v-icon>
            <span>{{ $t('sub_title.important_notice') }}</span>
          </v-flex>
          <div class="content">{{ $t('info.backup_wallet.importance') }}</div>
        </v-flex>
        <v-flex class="account-list">
          <v-flex d-flex class="download-ctrl" @click="download">
            <div>
              <div class="l1">{{ $t('wallet.download') }}</div>
              <div class="l2">
                <span>{{ binFile.name }}</span>
                <span class="file-size">({{ binFile.size }} bytes)</span>
              </div>
            </div>
            <v-icon>ic-deposit</v-icon>
          </v-flex>
          <span
            v-if="clickedDownload"
            class="to-exchange"
            @click="checkHasBackup"
          >
            {{ $t('button.exchange') }}
            <v-icon size="24">ic-arrow-back</v-icon>
          </span>
        </v-flex>
      </v-tab-item>
      <!-- 备份用户列表结束 -->
      <!-- 助记词部分开始 -->
      <v-tab-item class="phrase settings-tab">
        <v-flex class="setting-desc">{{ $t('info.phrase.desc') }}</v-flex>
        <v-flex class="importance grey-border-top">
          <v-flex>
            <v-icon class="notice" size="20">ic-info</v-icon>
            <span>{{ $t('sub_title.important_notice') }}</span>
          </v-flex>
          <div class="content">{{ $t('info.phrase.importance') }}</div>
        </v-flex>

        <!-- 显示助记词 -->
        <v-flex class="phrase">
          <div class="sub-title mb-2">{{ $t('info.phrase.hint_title') }}</div>
          <div class="key-content">
            <img src="~/assets/svg/ic-brainkey.svg" />
            <span @click="copyPhrase">{{ seed || '' }}</span>
          </div>
          <cybex-btn major middle @click="toggleBackup()">{{
            $t('info.phrase.btn_confirm')
          }}</cybex-btn>
        </v-flex>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import clipboard from 'clipboard-polyfill'
import { saveAs } from 'file-saver'

export default {
  data() {
    return {
      blob: null,
      valid: false, // 是否可以查看助记词
      clickedDownload: false,

      passwordIsVisible: false,
      couldCheckphrase: false,
      passwordError: '',
      passwordRules: [(value) => !!value || this.$t('validation.pwd_required')]
    }
  },
  computed: {
    ...mapGetters({
      seed: 'auth/seed',
      islocked: 'auth/islocked',
      mnemonicBackup: 'auth/mnemonicBackup',
      backupJson: 'auth/backupJson'
    }),
    currentTab() {
      return this.mnemonicBackup ? 1 : 0
    },
    filename() {
      const currentDate = moment().format('YYYYMMDD')
      return `Cybex_default_${currentDate}.json`
    },

    passwordIsValid() {
      return this.password !== ''
    },
    binFile() {
      return {
        name: this.filename,
        size: this.blob ? this.blob.size : ''
      }
    },
    tabItems() {
      return []
    }
  },

  watch: {
    password() {
      this.passwordError = []
    }
  },
  mounted() {
    // 检查是否有钱包文件 没有的话弹出提示
    if (this.backupJson) {
      this.prepareDownloadFile()
    }
  },
  methods: {
    toggleBackup() {
      this.$store.commit('auth/needMnemonicBackup', { need: false })
    },
    copyPhrase() {
      clipboard.writeText(this.seed)
      this.$message({
        message: this.$t('message.copied')
      })
    },
    checkHasBackup() {
      if (this.clickedDownload) {
        this.$i18n.jumpTo('/exchange')
      } else {
        return false
      }
    },
    prepareDownloadFile() {
      if (!this.backupJson) {
        alert('没有钱包对象')
        return
      }
      if (!this.blob) {
        this.blob = new Blob([JSON.stringify(this.backupJson)], {
          type: 'application/json; charset=utf-8'
        })
      }
    },
    download() {
      this.clickedDownload = true
      if (!this.blob) {
        this.prepareDownloadFile()
      }
      saveAs(this.blob, this.filename)
    }
  },
  head() {
    return {
      title: this.$t('title.backup')
    }
  }
}
</script>

<style scoped lang="scss">
@import '~assets/style/_vars/_colors';
@import '~assets/style/_fonts/_font_mixin';

.theme--dark.v-label {
  @include f-cybex-style(medium);
  color: rgba(map-get($main, grey), 0.5);
  font-size: 14px !important;
}
.settings-tab {
  padding: 30px 0;
  background-color: map-get($main, 'dark');
  .sub-title {
    @include f-cybex-style(heavy);
    color: map-get($main, white);
  }

  // border
  .grey-border-top {
    border-top: 1px solid rgba(map-get($main, white), 0.08);
  }

  .grey-border-bottom {
    border-bottom: 1px solid rgba(map-get($main, white), 0.08);
  }

  // 声明
  .importance {
    padding: 30px 0;
    margin: 30px 0 0;
    color: map-get($main, orange);
    line-height: 1.71;
    @include f-cybex-style(heavy);

    // 图标
    .notice {
      background-image: linear-gradient(
        132deg,
        map-get($main, hover),
        map-get($main, orange)
      );
      background-size: contain;
      border-radius: 50%;
      margin-right: 10px;

      &.ic-info:before {
        color: map-get($main, dark);
        transform: scale(1.4);
      }
    }

    .content {
      color: rgba(map-get($main, orange), 0.8);
      line-height: 1.43;
      margin-top: 12px;
      @include f-cybex-style(medium);
      position: relative;
      padding-left: 19px;

      &:before {
        width: 2px;
        height: 70%;
        content: '';
        display: inline-block;
        position: absolute;
        background: rgba(map-get($main, orange), 0.5);
        left: 0;
        transform: translateY(15%);
      }
    }
  }

  // 用户列表
  .account-list {
    position: relative;
    width: 380px;
    margin-top: 30px;

    .to-exchange {
      cursor: pointer;
      color: map-get($main, grey);
      font-size: 16px;
      position: absolute;
      left: calc(100% + 42px);
      bottom: 18px;
      width: 100px;

      .ic-arrow-back {
        position: relative;
        top: 2px;

        &:before {
          color: map-get($main, grey);
          transform: rotate(180deg);
        }
      }
    }

    .account-list-content {
      margin-top: 17px;
      max-height: 200px;
      width: 360px;

      .account-list-item {
        height: 40px;
        line-height: 1.71;
        padding: 8px 0;

        .counter {
          color: rgba(map-get($main, white), 0.4);
          margin-right: 20px;
          max-width: 20px;
        }

        .ic-avatar {
          &.full {
            background-image: linear-gradient(
              132deg,
              map-get($main, hover),
              map-get($main, orange)
            );
          }

          background: map-get($main, grey);
          max-width: 18px;
          max-height: 18px;
          border-radius: 2px;
          margin-right: 8px;

          &:before {
            color: map-get($main, 'dark');
          }
        }

        .ac-username {
          position: relative;
          bottom: 2px;
        }

        .account-access {
          color: map-get($main, grey);
          flex: 0 1 auto !important;
          padding: 4px 7px;
          background: rgba(map-get($main, grey), 0.1);
          border-radius: 4px;
          line-height: 16px;

          &.full {
            color: map-get($main, orange);
            background: rgba(map-get($main, orange), 0.1);
          }
        }
      }
    }

    .download-ctrl {
      cursor: pointer;
      margin-top: 30px;
      background-image: linear-gradient(
        98deg,
        map-get($main, hover),
        map-get($main, orange)
      );
      border-radius: 4px;
      height: 56px;

      > * {
        flex: 1 1 auto !important;
      }
      &:hover {
        background: map-get($main, hover);
      }

      &:active {
        background: map-get($main, orange);
      }

      > div {
        box-shadow: inset -1px 0 0 0 rgba(0, 0, 0, 0.12);
        height: 100%;
        padding: 6px 0 9px 24px;
      }

      .l1 {
        font-size: 16px;
        line-height: 1.5;
        @include f-cybex-style(heavy);
      }

      .l2 {
        font-size: 12px;
        color: rgba(map-get($main, white), 0.8);
        line-height: 1.33;

        .file-size {
          color: rgba(map-get($main, white), 0.5);
          margin-left: 19px;
        }
      }

      .ic-deposit {
        max-width: 56px;

        &:before {
          color: white;
        }
      }
    }
  }

  // 助记词tab
  .pwd {
    .pwd-input {
      max-width: 455px;
    }
  }

  .phrase {
    .key-content {
      line-height: 1.71;
      padding: 16px 0;
      margin-bottom: 16px;
      color: white;

      span {
        &:active,
        &:hover {
          cursor: copy;
          opacity: 0.8;
          user-select: all;
          -moz-user-select: all;
          -webkit-user-select: all;
          -ms-user-select: all;
        }
        &::selection {
          color: white;
          background-color: rgba(map-get($main, grey), 0.3);
        }
      }

      > img {
        margin-right: 16px;
      }

      > * {
        vertical-align: middle;
      }
    }
  }
}
</style>
