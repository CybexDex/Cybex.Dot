<template>
  <div class="transparent-bg middle-size-table">
    <v-data-table
      :headers="tbItems"
      :items="itemDatas"
      :loading="isLoading"
      hide-default-footer
      :dark="false"
    >
      <template v-slot:header="props">
        <thead>
          <tr v-for="header in props.headers" :key="header.text">
            <th>
              <template v-if="header.text">{{ header.text }}</template>
            </th>
          </tr>
        </thead> </template
      >>
      <template v-slot:item="{ item }">
        <tr>
          <td class="text-xs-left">
            <span>{{ item.asset }}</span>
          </td>
          <td class="text-xs-left">
            {{ $t(`button.${item.type.toLowerCase()}`) }}
          </td>
          <td class="text-xs-right">
            {{
              parseFloat(item.totalAmount) | floorDigits(item.precision || 6)
            }}
          </td>
          <td class="text-xs-left">
            <div class="addr-row" :title="item.outAddr">
              {{ item.outAddr }}
            </div>
          </td>
          <td class="text-xs-left">
            <span style="text-transform: capitalize;">{{
              $t(`info.${item.status.toLowerCase()}`)
            }}</span>
          </td>
          <td class="text-xs-right">
            {{ item.updatedAt | date('DD/MM/YYYY HH:mm:ss') }}
          </td>
          <td class="text-xs-right">
            <!-- use etherscan when no explorer found -->
            <a
              v-if="(explorers[item.asset] || explorers['ETH']) && item.outHash"
              class="explorer-link"
              @click="
                open(
                  `${(explorers[item.asset] || explorers['ETH']).explorer}${
                    item.outHash
                  }`
                )
              "
              >{{ $t('button.view_detail') }}</a
            >
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        <h4 class="text-center">{{ $t('info.no_data') }}</h4>
      </template>
    </v-data-table>
    <v-toolbar v-if="total" class="data-table-toolbar pagination">
      <!-- <label class="label-input">Page</label> -->
      <v-pagination
        v-model="page"
        :length="pageNum"
        :total-visible="10"
        @input="onPageChanged"
      />
      <v-spacer />
      <label class="page-count-label">{{ pageLabel }}</label>
    </v-toolbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserRecords } from '~/lib/gateway-client'
export default {
  props: {
    fundtype: {
      type: String,
      default: ''
    },
    asset: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      page: 1,
      offset: 0,
      total: 0,
      size: 10,
      isLoading: false,
      history: null,
      tbItems: [
        {
          text: this.$t('table_title.asset'),
          value: 'asset',
          align: 'left',
          sortable: false
        },
        {
          text: this.$t('table_title.type'),
          value: 'fundType',
          align: 'left',
          sortable: false
        },
        {
          text: this.$t('table_title.amount'),
          value: 'amount',
          align: 'left',
          sortable: false
        },
        {
          text: this.$t('table_title.address'),
          value: 'address',
          align: 'left',
          class: 'addr-col',
          sortable: false
        },
        {
          text: this.$t('table_title.status'),
          value: 'state',
          align: 'left',
          sortable: false
        },
        {
          text: this.$t('table_title.time'),
          value: 'updateAt',
          align: 'left',
          sortable: false
        },
        {
          text: this.$t('table_title.operation'),
          value: 'balance',
          align: 'left',
          sortable: false
        }
      ],
      explorers: {}
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/address',
      assetConfig: 'gateway/assetConfigByName'
    }),
    itemDatas() {
      return this.history || []
    },
    pageLabel() {
      const start = Math.min(this.offset + 1, this.total)
      const end = Math.min(this.total, this.page * this.size)
      return this.$t('label.pagination', { start, end, total: this.total })
    },
    pageNum() {
      return Math.ceil(this.total / this.size)
    }
  },
  watch: {
    async islocked(newval, oldval) {
      if (!newval && oldval) {
        await this.initLoad()
      }
    },
    async fundtype(newval, oldval) {
      if (newval !== oldval) {
        await this.initLoad()
      }
    },
    async asset(newval, oldval) {
      if (newval !== oldval) {
        await this.initLoad()
      }
    },
    async username(val) {
      if (!val) {
        return
      }
      await this.initLoad()
    }
  },
  async mounted() {
    await this.initLoad()
    await this.fetchExplorer()
  },
  methods: {
    async initLoad() {
      if (!this.islocked) {
        this.page = 1
        this.total = 0
        this.offset = 0
        await this.loadHistory()
      }
    },
    async loadHistory() {
      this.history = null
      this.isLoading = true

      const data = await getUserRecords(
        this.username,
        this.fundtype,
        this.asset,
        this.size,
        this.offset
      )

      if (data && data.records) {
        // TO DO  静态缓存  precision
        data.records = data.records.map((i) => {
          const cfgItem = this.assetConfig[i.asset]
          i.precision = cfgItem ? parseInt(cfgItem.precision) : 6
          return i
        })
        this.history = data.records
        this.total = data.total
      }
      this.isLoading = false
    },
    async onPageChanged(value) {
      this.offset = Math.min((value - 1) * this.size, this.total)
      await this.loadHistory()
    },
    open(url) {
      window.open(url)
    },
    async fetchExplorer() {}
  }
}
</script>

<style lang="scss" scoped>
.addr-row {
  /* width: 170px; */
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
