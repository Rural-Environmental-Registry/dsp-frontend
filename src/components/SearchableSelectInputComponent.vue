<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SelectOption } from '@/config/searchHierarchy'

const props = withDefaults(
  defineProps<{
    label: string
    placeholder?: string
    id?: string
    items: SelectOption[]
    modelValue?: string
    disabled?: boolean
    allowEmptySelection?: boolean
    hideLabel?: boolean
  }>(),
  {
    placeholder: 'Select',
    modelValue: '',
    disabled: false,
    allowEmptySelection: false,
    hideLabel: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const filterText = ref('')
const rootRef = ref<HTMLElement | null>(null)

const selectedItem = computed(() =>
  props.items.find((item) => item.value === props.modelValue),
)

const triggerLabel = computed(() => {
  if (!props.modelValue) {
    return props.placeholder
  }
  return selectedItem.value?.label ?? props.modelValue
})

const triggerTitle = computed(() => {
  if (!props.modelValue) {
    return undefined
  }
  return selectedItem.value?.label ?? props.modelValue
})

const filteredItems = computed(() => {
  const query = filterText.value.trim().toLowerCase()
  if (!query) {
    return props.items
  }
  return props.items.filter((item) => item.label.toLowerCase().includes(query))
})

const accessibleName = computed(() =>
  props.hideLabel ? props.label || props.placeholder : props.label,
)

function toggleOpen(): void {
  if (props.disabled) {
    return
  }
  open.value = !open.value
  if (open.value) {
    filterText.value = ''
  }
}

function closeDropdown(): void {
  open.value = false
  filterText.value = ''
}

function selectValue(value: string): void {
  if (props.disabled) {
    return
  }
  emit('update:modelValue', value)
  closeDropdown()
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!rootRef.value || !target || rootRef.value.contains(target)) {
    return
  }
  closeDropdown()
}

watch(
  () => props.disabled,
  (isDisabled) => {
    if (isDisabled) {
      closeDropdown()
    }
  },
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootRef" class="flex flex-col w-full">
    <label v-if="!hideLabel" class="mb-1 text-sm text-gray-500" :for="id">{{ label }}</label>

    <div class="relative">
      <button
        :id="id"
        type="button"
        class="searchable-select__trigger"
        :class="{ 'searchable-select__trigger--disabled': disabled }"
        :disabled="disabled"
        :aria-expanded="open"
        aria-haspopup="listbox"
        :aria-label="hideLabel ? accessibleName : undefined"
        :title="triggerTitle"
        @click="toggleOpen"
      >
        <span
          class="searchable-select__summary"
          :class="{ 'searchable-select__summary--placeholder': !modelValue }"
        >
          {{ triggerLabel }}
        </span>
        <span class="searchable-select__arrow" aria-hidden="true"></span>
      </button>

      <div v-if="open" class="searchable-select__dropdown" role="listbox" :aria-label="accessibleName">
        <input
          v-model="filterText"
          type="search"
          class="searchable-select__filter"
          :placeholder="placeholder"
          :disabled="disabled"
          @click.stop
        />
        <ul class="searchable-select__list">
          <li v-if="allowEmptySelection">
            <button
              type="button"
              class="searchable-select__option"
              :class="{ 'searchable-select__option--selected': !modelValue }"
              data-value=""
              role="option"
              :aria-selected="!modelValue"
              @click="selectValue('')"
            >
              {{ placeholder }}
            </button>
          </li>
          <li v-if="!filteredItems.length" class="searchable-select__empty">No options</li>
          <li v-for="item in filteredItems" :key="item.value">
            <button
              type="button"
              class="searchable-select__option"
              :class="{ 'searchable-select__option--selected': modelValue === item.value }"
              :data-value="item.value"
              role="option"
              :aria-selected="modelValue === item.value"
              @click="selectValue(item.value)"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.searchable-select__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(75 85 99 / 0.8);
  background: #fff;
  padding: 0.375rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}

.searchable-select__trigger:focus-visible {
  border-color: #42916e;
  box-shadow: 0 0 0 1px #42916e;
}

.searchable-select__trigger--disabled {
  cursor: not-allowed;
  background: #f3f4f6;
}

.searchable-select__summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.searchable-select__summary--placeholder {
  color: #6b7280;
}

.searchable-select__arrow {
  display: block;
  flex: 0 0 auto;
  width: 0.45rem;
  height: 0.45rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translateY(-0.12rem) rotate(45deg);
}

.searchable-select__dropdown {
  position: absolute;
  z-index: 1100;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  border: 1px solid rgb(75 85 99 / 0.8);
  border-radius: 0.25rem;
  background: #fff;
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.08);
  overflow: hidden;
}

.searchable-select__filter {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}

.searchable-select__list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  max-height: 220px;
  overflow: auto;
}

.searchable-select__option {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  cursor: pointer;
}

.searchable-select__option:hover {
  background: #f3f4f6;
}

.searchable-select__option--selected {
  background: #ecfdf5;
  color: #14532d;
}

.searchable-select__empty {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
