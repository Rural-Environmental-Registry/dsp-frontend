import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutLandingView from '@/views/AboutLandingView.vue'

describe('AboutLandingView', () => {
  it('should render hardcoded about landing content', async () => {
    const wrapper = mount(AboutLandingView)

    expect(wrapper.find('.about-landing').exists()).toBe(true)
    expect(wrapper.find('.pii-notice').exists()).toBe(true)
    expect(wrapper.text()).toContain('Notice.')
    expect(wrapper.text()).toContain('personally identifiable information (PII)')
    expect(wrapper.text()).toContain('About DSP')

    await wrapper.get('[aria-label="Dismiss notice"]').trigger('click')
    expect(wrapper.find('.pii-notice').exists()).toBe(false)
    expect(wrapper.text()).toContain('Configurable by design')
    expect(wrapper.find('.config-highlight').exists()).toBe(true)
    expect(wrapper.find('.config-yaml').exists()).toBe(true)
    expect(wrapper.find('.config-script').text()).toBe('config.sh')
    expect(wrapper.find('details').exists()).toBe(true)
  })
})
