<template>
  <div
    class="cybex file-upload"
    :class="`${size}-size`"
    @drop="drop"
    @dragover="dragover"
  >
    <cybex-btn d-flex tiny major @click="$refs.inputUpload.click()">{{
      $t('button.select-file')
    }}</cybex-btn>
    <span v-if="file" d-flex class="file-desc dirty">
      {{ file.name }}
      <v-btn icon class="file-remove" size="28" @click="removeFile">
        <v-icon>ic-cancel</v-icon>
      </v-btn>
    </span>
    <span v-else class="file-desc" @click="$refs.inputUpload.click()">{{
      $t('placeholder.file_support', { type: fileAccept })
    }}</span>
    <input
      v-show="false"
      ref="inputUpload"
      :accept="fileAccept"
      type="file"
      @change="uploadFile"
    />
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    size: {
      type: String,
      default: 'large'
    },
    fileAccept: {
      type: String,
      default: '*'
    },
    // TODO: 允许上传多个样式
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      file: null
    }
  },

  methods: {
    dragover(ev) {
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault()
    },
    drop(ev) {
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault()
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === 'file') {
            const file = ev.dataTransfer.items[i].getAsFile()
            this.file = file
          }
        }
        this.$emit('file-changed', this.file)
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          const file = ev.dataTransfer.files[i]
          this.file = file
        }
        this.$emit('file-changed', this.file)
      }
    },
    uploadFile(e) {
      const files = e.target.files
      if (files.length) {
        this.file = files[0]
        this.$emit('file-changed', files[0])
      }
    },
    removeFile() {
      this.file = null
      this.$refs.inputUpload.value = null
      this.$emit('file-changed', null)
    }
  }
}
</script>
