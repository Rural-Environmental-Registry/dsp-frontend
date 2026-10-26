import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeOutcomeFeedbackComponent from '@/components/HomeOutcomeFeedbackComponent.vue'

vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i />',
  },
}))

describe('HomeOutcomeFeedbackComponent', () => {
  it('should render no-aoi feedback content', () => {
    const wrapper = mount(HomeOutcomeFeedbackComponent, {
      props: { kind: 'no-aoi' },
    })

    expect(wrapper.text()).toContain('No area of interest found')
    expect(wrapper.text()).toContain('Try selecting another location on the map.')
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe(
      'No area of interest found',
    )
  })

  it('should render zoom-required feedback content', () => {
    const wrapper = mount(HomeOutcomeFeedbackComponent, {
      props: { kind: 'zoom-required' },
    })

    expect(wrapper.text()).toContain(
      'An area of interest cannot be selected at this zoom level',
    )
    expect(wrapper.text()).toContain(
      'Get closer to the location you want to inspect and try again.',
    )
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe(
      'An area of interest cannot be selected at this zoom level',
    )
  })

  it('should render identifier-not-found feedback content', () => {
    const wrapper = mount(HomeOutcomeFeedbackComponent, {
      props: { kind: 'identifier-not-found' },
    })

    expect(wrapper.text()).toContain('No matching area of interest')
    expect(wrapper.text()).toContain(
      'Try a different identifier, or use territory filters or the map to explore.',
    )
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe(
      'No matching area of interest',
    )
  })
})
