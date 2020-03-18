<template>
  <transfer-selector fundtype="deposit">
    <nuxt-child />
  </transfer-selector>
</template>

<script>
export default {
  layout: 'transfer',
  components: {
    TransferSelector: () => import('~/components/TransferSelector.vue')
  }
}
</script>
