<script>
import VDataTable from 'vuetify/es5/components/VDataTable/VDataTable'
import PerfectScrollbar from 'perfect-scrollbar'
const _helpers = require('vuetify/es5/util/helpers')
// Importing does not work properly
const VTableOverflow = (0, _helpers.createSimpleFunctional)('v-table__overflow')
export default {
  extends: VDataTable,
  props: {
    isFixedHeaderTable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showFixedHeader: false,
      ps: null,
      scrollEle: null,
      fixHeaderEle: null,
      fiexHeaderColCls: 'col-header',
      scrollTableWrapperCls: 'table-wrapper'
    }
  },
  computed: {
    fixedHeaderEle() {
      return ''
    }
  },
  beforeUpdate() {
    if (this.isFixedHeaderTable && !this.scrollEle) {
      const el = this.$el.querySelector('.' + this.scrollTableWrapperCls)
      if (el) {
        this.scrollEle = el
        this.ps = new PerfectScrollbar(el, {
          minScrollbarLength: 30,
          useBothWheelAxes: true
        })
        this.scrollEle.addEventListener('ps-scroll-y', this.onFixedHeader)
        this.scrollEle.addEventListener(
          'ps-y-reach-start',
          this.hiddenFixedHeader
        )
      }
    }
  },
  updated() {
    if (this.ps) {
      this.ps.update()
    }
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    if (this.scrollEle) {
      this.scrollEle.removeEventListener('ps-scroll-y', this.onFixedHeader)
      this.scrollEle.removeEventListener(
        'ps-y-reach-start',
        this.hiddenFixedHeader
      )
    }
  },
  methods: {
    hiddenFixedHeader() {
      this.$refs.fixedHeader.classList.toggle('hidden', true)
    },
    genFixedTHead() {
      if (this.hideHeaders) return
      const rows = this.headers.map((item, idx) => {
        return this.$createElement(
          'div',
          {
            class: [
              this.fiexHeaderColCls,
              'col-field-' + item.value,
              item.class ? [item.class] : ['text-' + item.align]
            ]
          },
          [item.text]
        )
      })
      return this.$createElement(
        'div',
        {
          ref: 'fixedHeader',
          class: ['d-flex flex fixed-header', 'hidden']
        },
        [rows]
      )
    },
    onFixedHeader() {
      if (this.scrollEle && this.$refs.fixedHeader) {
        const cols = this.$el.querySelectorAll("[role='columnheader']")
        const headers = this.$refs.fixedHeader.querySelectorAll(
          '.' + this.fiexHeaderColCls
        )
        headers.forEach((ele, idx) => {
          headers[idx].style.width = cols[idx].clientWidth + 'px'
          // sortable
          if (cols[idx].classList.contains('sortable')) {
            const descCls = cols[idx].classList.contains('desc')
            headers[idx].classList.toggle('desc', descCls)
          }
          headers[idx].innerHTML = cols[idx].innerHTML
        })
        // this.$refs.fixedHeader.innerHTML = ''
        this.$refs.fixedHeader.classList.toggle('hidden', false)
      }
    }
  },

  render: function render(h) {
    const tableOverflow = h(VTableOverflow, {}, [
      h(
        'table',
        {
          class: this.classes
        },
        [this.genHeaders(), this.genTBody(), this.genFooters()]
      )
    ])
    let table = h(
      'div',
      { class: this.isFixedHeaderTable ? this.scrollTableWrapperCls : '' },
      [tableOverflow, this.genActionsFooter()]
    )
    if (this.isFixedHeaderTable) {
      table = this.$createElement('div', [this.genFixedTHead(), table])
    }
    return table
  }
}
</script>

<style scoped></style>
