import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DownloadsFilterPanel from '@/components/DownloadsFilterPanel.vue'
import { getInstallationConfig } from '@/services/configService'
import { getTerritoryOptions } from '@/services/territoryService'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'

vi.mock('@/services/configService', async () => {
  const { FALLBACK_INSTALLATION_CONFIG } = await import('@/config/installationConfigFallback')
  return {
    getInstallationConfig: vi.fn(),
    peekInstallationConfig: vi.fn().mockReturnValue(FALLBACK_INSTALLATION_CONFIG),
  }
})

vi.mock('@/services/territoryService', () => ({
  getTerritoryOptions: vi.fn(),
}))

vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon',
    template: '<i />',
  },
}))

async function selectSearchableOption(
  wrapper: ReturnType<typeof mount>,
  triggerId: string,
  value: string,
): Promise<void> {
  await wrapper.find(`#${triggerId}`).trigger('click')
  await flushPromises()
  await wrapper.find(`[data-value="${value}"]`).trigger('click')
  await flushPromises()
}

async function selectLevel1AndLevel2(wrapper: ReturnType<typeof mount>) {
  await selectSearchableOption(wrapper, 'download-level1', '3')
  await selectSearchableOption(wrapper, 'download-level2', 'ST01')
}

describe('DownloadsFilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getInstallationConfig).mockResolvedValue(FALLBACK_INSTALLATION_CONFIG)
    vi.mocked(getTerritoryOptions).mockImplementation(async (level, parentId) => {
      if (level === 'level1') {
        return [
          { id: '1', name: 'North' },
          { id: '3', name: 'Central' },
        ]
      }
      if (level === 'level2' && parentId === '3') {
        return [{ id: 'ST01', name: 'ST-01 - State One' }]
      }
      if (level === 'level3' && parentId === 'ST01') {
        return [{ id: 'CITY001', name: 'Sample City' }]
      }
      return []
    })
  })

  it('should show all filter fields after level1 options load', async () => {
    const wrapper = mount(DownloadsFilterPanel, {
      props: {
        themeOptions: [{ value: 'theme_alpha', label: 'Theme Alpha' }],
      },
    })
    await flushPromises()

    expect(getTerritoryOptions).toHaveBeenCalledWith('level1')
    expect(wrapper.find('#download-level1').exists()).toBe(true)
    expect(wrapper.find('#download-level2').exists()).toBe(true)
    expect(wrapper.find('#download-level3').exists()).toBe(true)
    expect(wrapper.find('#download-theme').exists()).toBe(true)
    expect(wrapper.text()).toContain('Filter by')
    expect(wrapper.text()).toContain('Select the level 1 you want to access for Downloads')

    await selectSearchableOption(wrapper, 'download-level1', '3')

    expect(getTerritoryOptions).toHaveBeenCalledWith('level2', '3')
  })

  it('should emit selection-change without search when level2 is selected', async () => {
    const wrapper = mount(DownloadsFilterPanel, {
      props: {
        themeOptions: [{ value: 'theme_alpha', label: 'Theme Alpha' }],
      },
    })
    await flushPromises()

    await selectLevel1AndLevel2(wrapper)

    expect(getTerritoryOptions).toHaveBeenCalledWith('level3', 'ST01')
    expect(wrapper.emitted('search')).toBeFalsy()
    expect(wrapper.emitted('selection-change')).toBeTruthy()
  })

  it('should emit search when search button is clicked with level2 only', async () => {
    const wrapper = mount(DownloadsFilterPanel, {
      props: {
        themeOptions: [{ value: 'theme_alpha', label: 'Theme Alpha' }],
      },
    })
    await flushPromises()

    await selectLevel1AndLevel2(wrapper)

    const searchButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Search'))
    await searchButton!.trigger('click')

    expect(wrapper.emitted('search')?.[0]?.[0]).toMatchObject({
      level1: '3',
      level2: 'ST01',
      level3: '',
      theme: '',
    })
  })

  it('should allow selecting all themes after a specific theme was chosen', async () => {
    const wrapper = mount(DownloadsFilterPanel, {
      props: {
        themeOptions: [
          { value: 'area_of_interest', label: 'Area of interest' },
          { value: 'safety_buffer', label: 'Safety buffer zone' },
        ],
      },
    })
    await flushPromises()

    await selectLevel1AndLevel2(wrapper)

    await selectSearchableOption(wrapper, 'download-theme', 'area_of_interest')
    await selectSearchableOption(wrapper, 'download-theme', '')

    const searchButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Search'))
    await searchButton!.trigger('click')

    expect(wrapper.emitted('search')?.[0]?.[0]).toMatchObject({
      level1: '3',
      level2: 'ST01',
      level3: '',
      theme: '',
    })
  })

  it('should emit search with level3 when selected before search', async () => {
    const wrapper = mount(DownloadsFilterPanel, {
      props: {
        themeOptions: [{ value: 'theme_alpha', label: 'Theme Alpha' }],
      },
    })
    await flushPromises()

    await selectLevel1AndLevel2(wrapper)

    await selectSearchableOption(wrapper, 'download-level3', 'CITY001')

    const searchButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Search'))
    await searchButton!.trigger('click')

    expect(wrapper.emitted('search')?.[0]?.[0]).toMatchObject({
      level1: '3',
      level2: 'ST01',
      level3: 'CITY001',
      theme: '',
    })
  })

  it('should render all level1 options returned by the API', async () => {
    vi.mocked(getTerritoryOptions).mockImplementation(async (level) => {
      if (level === 'level1') {
        return Array.from({ length: 7 }, (_, index) => ({
          id: String(index + 1),
          name: `Region ${index + 1}`,
        }))
      }
      return []
    })

    const wrapper = mount(DownloadsFilterPanel)
    await flushPromises()

    await wrapper.find('#download-level1').trigger('click')
    await flushPromises()

    const options = wrapper.findAll('[data-value]').filter(
      (node) => node.attributes('data-value') !== '',
    )
    expect(options).toHaveLength(7)
  })
})
