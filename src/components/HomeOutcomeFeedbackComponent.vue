<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faLocationCrosshairs,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons'

export type HomeOutcomeKind = 'no-aoi' | 'zoom-required' | 'identifier-not-found'

const props = defineProps<{
  kind: HomeOutcomeKind
}>()

const contentByKind = {
  'no-aoi': {
    icon: faLocationCrosshairs,
    title: 'No area of interest found',
    message: 'Try selecting another location on the map.',
  },
  'zoom-required': {
    icon: faMagnifyingGlassPlus,
    title: 'An area of interest cannot be selected at this zoom level',
    message: 'Get closer to the location you want to inspect and try again.',
  },
  'identifier-not-found': {
    icon: faMagnifyingGlass,
    title: 'No matching area of interest',
    message: 'Try a different identifier, or use territory filters or the map to explore.',
  },
} as const

const content = computed(() => contentByKind[props.kind])
</script>

<template>
  <section
    class="home-outcome-feedback-panel"
    role="status"
    aria-live="polite"
    :aria-label="content.title"
  >
    <FontAwesomeIcon
      :icon="content.icon"
      class="home-outcome-feedback-panel__icon"
      aria-hidden="true"
    />
    <div class="home-outcome-feedback-panel__text">
      <p class="home-outcome-feedback-panel__title">{{ content.title }}</p>
      <p class="home-outcome-feedback-panel__message">{{ content.message }}</p>
    </div>
  </section>
</template>

<style scoped>
.home-outcome-feedback-panel {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 0 0 24px;
  padding: 16px 20px;
  border: none;
  border-left: 4px solid var(--dsp-green, #42916e);
  border-radius: 0 8px 8px 0;
  background: #fff;
}

.home-outcome-feedback-panel__icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 22px;
  color: var(--dsp-green, #42916e);
}

.home-outcome-feedback-panel__text {
  min-width: 0;
}

.home-outcome-feedback-panel__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.home-outcome-feedback-panel__message {
  margin: 0;
  font-size: 15px;
  color: #707070;
}
</style>
