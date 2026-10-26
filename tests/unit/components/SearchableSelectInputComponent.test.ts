import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchableSelectInputComponent from '@/components/SearchableSelectInputComponent.vue'

const items = [
  { value: 'DF', label: 'Distrito Federal' },
  {
    value: 'LONG',
    label: 'ST-01 - Very long territory name that should wrap inside the dropdown list',
  },
]

function mountSearchableSelect(props: Record<string, unknown> = {}) {
  return mount(SearchableSelectInputComponent, {
    props: {
      label: 'Territory',
      placeholder: 'Select',
      items,
      ...props,
    },
  })
}

describe('SearchableSelectInputComponent', () => {
  it('should show placeholder when no value is selected', () => {
    const wrapper = mountSearchableSelect()

    expect(wrapper.find('.searchable-select__summary--placeholder').text()).toBe('Select')
  })

  it('should open dropdown and emit selected value', async () => {
    const wrapper = mountSearchableSelect({ id: 'territory-select' })

    await wrapper.find('#territory-select').trigger('click')

    expect(wrapper.find('.searchable-select__dropdown').exists()).toBe(true)

    await wrapper.find('[data-value="DF"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['DF'])
    expect(wrapper.find('.searchable-select__dropdown').exists()).toBe(false)
  })

  it('should filter options by search text', async () => {
    const wrapper = mountSearchableSelect({ id: 'territory-select' })

    await wrapper.find('#territory-select').trigger('click')
    await wrapper.find('.searchable-select__filter').setValue('very long')

    expect(wrapper.findAll('[data-value]').map((node) => node.attributes('data-value'))).toEqual([
      'LONG',
    ])
  })

  it('should allow clearing selection when allowEmptySelection is enabled', async () => {
    const wrapper = mountSearchableSelect({
      id: 'theme-select',
      modelValue: 'DF',
      allowEmptySelection: true,
    })

    await wrapper.find('#theme-select').trigger('click')
    await wrapper.find('[data-value=""]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('should expose full label in title when value is selected', () => {
    const wrapper = mountSearchableSelect({
      id: 'territory-select',
      modelValue: 'LONG',
    })

    expect(wrapper.find('.searchable-select__trigger').attributes('title')).toContain(
      'Very long territory name',
    )
  })
})
