import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NavBarComponent from '@/components/NavBarComponent.vue'
import { getAboutConfig } from '@/services/aboutService'
import type { AboutConfig } from '@/types/aboutConfig'

vi.mock('@/services/aboutService', () => ({
  getAboutConfig: vi.fn(),
}))

function aboutConfig(enabled: boolean): AboutConfig {
  return { enabled, bannerTitle: 'About', tabs: [] }
}

async function mountNavBar() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/geoservices', name: 'geoservices', component: { template: '<div />' } },
      { path: '/about/platform', name: 'about-landing', component: { template: '<div />' } },
      { path: '/about', name: 'about', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()

  const wrapper = mount(NavBarComponent, {
    global: { plugins: [router] },
  })
  await flushPromises()
  return wrapper
}

describe('NavBarComponent', () => {
  beforeEach(() => {
    vi.mocked(getAboutConfig).mockReset()
  })

  it('should always show About DSP and hide About when disabled', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(aboutConfig(false))

    const wrapper = await mountNavBar()
    const labels = wrapper.findAll('.nav-link').map((link) => link.text())

    expect(labels).toEqual(['Home', 'Downloads', 'About DSP'])
  })

  it('should show About when the about config is enabled', async () => {
    vi.mocked(getAboutConfig).mockResolvedValue(aboutConfig(true))

    const wrapper = await mountNavBar()
    const labels = wrapper.findAll('.nav-link').map((link) => link.text())

    expect(labels).toEqual(['Home', 'Downloads', 'About DSP', 'About'])
  })
})
