<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from 'dompurify'
import landingHtml from '@/content/aboutLanding.html?raw'
import '@/assets/styles/aboutLanding.css'

const baseUrl = import.meta.env.BASE_URL
const noticeVisible = ref(true)

const sanitizedHtml = computed(() => {
  const html = landingHtml.replace(/__BASE__/g, baseUrl)
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  })
})

function dismissNotice() {
  noticeVisible.value = false
}
</script>

<template>
  <div class="about-landing">
    <div v-if="noticeVisible" class="br-message warning pii-notice" role="status">
      <div class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="faTriangleExclamation" />
      </div>
      <div class="content">
        <span class="message-title">Notice.</span>
        <span class="message-body">
          This system may collect and temporarily store personally identifiable information (PII)
          necessary for its operation. This information is processed in accordance with applicable
          law and used exclusively for the system's purposes, and is stored in a secure and
          controlled manner.
        </span>
      </div>
      <div class="close">
        <button
          class="br-button circle small"
          type="button"
          aria-label="Dismiss notice"
          @click="dismissNotice"
        >
          <FontAwesomeIcon :icon="faXmark" />
        </button>
      </div>
    </div>
    <div v-html="sanitizedHtml" />
  </div>
</template>
