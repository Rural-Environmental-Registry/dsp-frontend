<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import SearchableSelectInputComponent from '@/components/SearchableSelectInputComponent.vue'
import {
  resolveDownloadsUiConfig,
  type DownloadsUiConfig,
} from '@/config/downloadsUi'
import type { SelectOption } from '@/config/searchHierarchy'
import { getInstallationConfig } from '@/services/configService'
import { getTerritoryOptions } from '@/services/territoryService'
import { territoryOptionsToSelectOptions } from '@/adapters/selectOptionAdapters'
import LoadingDotsComponent from '@/components/LoadingDotsComponent.vue'

export interface DownloadsFilterPayload {
  level1: string
  level2: string
  level3: string
  theme: string
}

const props = withDefaults(
  defineProps<{
    themeOptions?: SelectOption[]
  }>(),
  {
    themeOptions: () => [],
  },
)

const emit = defineEmits<{
  search: [payload: DownloadsFilterPayload]
  clear: []
  'selection-change': [payload: DownloadsFilterPayload]
}>()

const ui = ref<DownloadsUiConfig>(resolveDownloadsUiConfig())

const loadingRoot = ref(false)
const loadingChildren = ref(false)
const loadError = ref('')

const level1Options = ref<SelectOption[]>([])
const level2Options = ref<SelectOption[]>([])
const level3Options = ref<SelectOption[]>([])

const level1Id = ref('')
const level2Id = ref('')
const level3Id = ref('')
const themeId = ref('')

const level1Disabled = computed(() => loadingRoot.value || loadingChildren.value)
const level2Disabled = computed(
  () => !level1Id.value || loadingRoot.value || loadingChildren.value,
)
const level3Disabled = computed(
  () => !level2Id.value || loadingRoot.value || loadingChildren.value,
)
const themeDisabled = computed(() => loadingRoot.value)
const searchDisabled = computed(
  () => !level2Id.value || loadingRoot.value || loadingChildren.value,
)

const canClearFilters = computed(
  () => Boolean(level3Id.value) || Boolean(themeId.value),
)

function currentPayload(): DownloadsFilterPayload {
  return {
    level1: level1Id.value,
    level2: level2Id.value,
    level3: level3Id.value,
    theme: themeId.value,
  }
}

function emitSelection(): void {
  emit('selection-change', currentPayload())
}

onMounted(() => {
  void bootstrap()
})

async function bootstrap(): Promise<void> {
  const installation = await getInstallationConfig()
  ui.value = resolveDownloadsUiConfig(installation)
  await loadLevel1()
}

async function loadLevel1(): Promise<void> {
  loadingRoot.value = true
  loadError.value = ''
  try {
    const options = await getTerritoryOptions('level1')
    level1Options.value = territoryOptionsToSelectOptions(options)
  } catch (error) {
    console.error(error)
    loadError.value = 'Could not load level 1. Check if the API is running.'
    level1Options.value = []
  } finally {
    loadingRoot.value = false
  }
}

async function loadLevel2Options(parentId: string): Promise<void> {
  loadingChildren.value = true
  try {
    const options = await getTerritoryOptions('level2', parentId)
    level2Options.value = territoryOptionsToSelectOptions(options)
  } catch (error) {
    console.error(error)
    level2Options.value = []
  } finally {
    loadingChildren.value = false
  }
}

async function loadLevel3Options(parentId: string): Promise<void> {
  loadingChildren.value = true
  try {
    const cities = await getTerritoryOptions('level3', parentId)
    level3Options.value = territoryOptionsToSelectOptions(cities)
  } catch (error) {
    console.error(error)
    level3Options.value = []
  } finally {
    loadingChildren.value = false
  }
}

function handleSearch(): void {
  if (!level2Id.value) return
  emit('search', currentPayload())
}

function handleClearFilters(): void {
  level3Id.value = ''
  themeId.value = ''
  emit('clear')
  emit('search', currentPayload())
}

watch(level1Id, async (value) => {
  level2Id.value = ''
  level3Id.value = ''
  themeId.value = ''
  level2Options.value = []
  level3Options.value = []

  if (!value) {
    emitSelection()
    return
  }

  await loadLevel2Options(value)
  emitSelection()
})

watch(level2Id, async (value) => {
  level3Id.value = ''
  themeId.value = ''
  level3Options.value = []

  if (!value) {
    emitSelection()
    return
  }

  await loadLevel3Options(value)
  emitSelection()
})

watch(level3Id, () => emitSelection())
watch(themeId, () => emitSelection())
</script>

<template>
  <section class="filter-panel" aria-label="Downloads filters">
    <div class="filter-panel__inner">
      <p v-if="loadingRoot" class="status-msg"><LoadingDotsComponent /></p>
      <p v-else-if="loadError" class="status-msg status-msg--error">{{ loadError }}</p>

      <div v-else class="filter-fields">
        <fieldset class="step-fieldset">
          <legend class="step-legend">{{ ui.level1Title }}</legend>
          <div class="hierarchy-select-field">
            <SearchableSelectInputComponent
              id="download-level1"
              v-model="level1Id"
              hide-label
              :label="ui.level1Placeholder"
              :placeholder="ui.level1Placeholder"
              :items="level1Options"
              :disabled="level1Disabled"
            />
          </div>
        </fieldset>

        <fieldset class="step-fieldset">
          <legend class="step-legend">{{ ui.level2Title }}</legend>
          <p v-if="loadingChildren && level1Id && !level2Id" class="status-msg">
            <LoadingDotsComponent />
          </p>
          <div v-else class="hierarchy-select-field">
            <SearchableSelectInputComponent
              id="download-level2"
              v-model="level2Id"
              hide-label
              :label="ui.level2Placeholder"
              :placeholder="ui.level2Placeholder"
              :items="level2Options"
              :disabled="level2Disabled"
            />
          </div>
        </fieldset>

        <fieldset class="step-fieldset filters-block">
          <legend class="step-legend step-legend--emphasis">{{ ui.filterByTitle }}</legend>
          <p v-if="loadingChildren && level2Id" class="status-msg filters-block__loading">
            <LoadingDotsComponent />
          </p>
          <div class="filters-row">
            <div class="filter-field filter-field--level3">
              <SearchableSelectInputComponent
                id="download-level3"
                v-model="level3Id"
                :label="ui.level3Label"
                :placeholder="ui.level3Placeholder"
                :items="level3Options"
                :disabled="level3Disabled"
              />
            </div>
            <div class="filter-field filter-field--theme">
              <SearchableSelectInputComponent
                id="download-theme"
                v-model="themeId"
                :label="ui.themeLabel"
                :placeholder="ui.themePlaceholder"
                :items="themeOptions"
                allow-empty-selection
                :disabled="themeDisabled"
              />
            </div>
            <div class="filter-actions">
              <button
                type="button"
                class="br-button primary"
                :disabled="searchDisabled"
                @click="handleSearch"
              >
                <FontAwesomeIcon :icon="faSearch" class="mr-2" />
                {{ ui.searchButton }}
              </button>
              <button
                v-if="canClearFilters"
                type="button"
                class="br-button inverted"
                @click="handleClearFilters"
              >
                {{ ui.clearButton }}
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  </section>
</template>

<style scoped>
.filter-panel {
  width: 100%;
  background: var(--dsp-filter-bg);
  margin-bottom: 25px;
}

.filter-panel__inner {
  margin-inline: min(26px, 3vw);
  padding-block: 16px;
}

.filter-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 6px;
}

.step-fieldset {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.step-legend {
  display: block;
  width: 100%;
  margin: 0 0 12px;
  padding: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.step-legend--emphasis {
  margin-bottom: 20px;
}

.hierarchy-select-field {
  width: 100%;
  max-width: 320px;
}

.filters-block__loading {
  margin-bottom: 12px;
}

.filters-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 24px;
}

.filter-field--level3 {
  min-width: 220px;
  width: 30%;
  flex: 1 1 240px;
}

.filter-field--theme {
  width: 25%;
  min-width: 240px;
  flex: 1 1 260px;
  max-width: 462px;
}

.filter-actions {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 16px;
  min-width: 200px;
  padding-bottom: 2px;
}

.status-msg {
  margin: 0;
  font-size: 14px;
  color: #707070;
}

.status-msg--error {
  color: #b9382e;
}

@media screen and (max-width: 950px) {
  .hierarchy-select-field {
    max-width: none;
  }

  .filter-field--level3,
  .filter-field--theme {
    width: 100%;
    min-width: 100%;
    flex: 1 1 100%;
    max-width: none;
  }
}
</style>
