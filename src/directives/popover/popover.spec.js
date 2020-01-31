import { mount, createLocalVue as CreateLocalVue } from '@vue/test-utils'
import { waitNT, waitRAF } from '../../../tests/utils'
import { VBPopover } from './popover'
import { BVPopover } from '../../components/popover/helpers/bv-popover'

// Key which we use to store tooltip object on element
const BV_POPOVER = '__BV_Popover__'

describe('v-b-popover directive', () => {
  const origGetBCR = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    // Mock getBCR so that the isVisible(el) test returns true
    // Needed for visibility checks of trigger element, etc.
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 24,
      height: 24,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }))
  })

  afterEach(() => {
    // Reset overrides
    Element.prototype.getBoundingClientRect = origGetBCR
  })

  it('should have BVPopover Vue instance', async () => {
    jest.useFakeTimers()
    const localVue = new CreateLocalVue()

    const App = localVue.extend({
      directives: {
        bPopover: VBPopover
      },
      template: `<button v-b-popover="'content'" title="foobar">button</button>`
    })

    const wrapper = mount(App, {
      localVue: localVue,
      attachToDocument: true
    })

    expect(wrapper.isVueInstance()).toBe(true)
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.is('button')).toBe(true)
    const $button = wrapper.find('button')

    // Should have instance of popover class on it
    expect($button.element[BV_POPOVER]).toBeDefined()
    expect($button.element[BV_POPOVER]).toBeInstanceOf(BVPopover)

    wrapper.destroy()
  })

  it('should work', async () => {
    jest.useFakeTimers()
    const localVue = new CreateLocalVue()

    const App = localVue.extend({
      directives: {
        bPopover: VBPopover
      },
      template: `<button v-b-popover.click.html="'content'" title="<b>foobar</b>">button</button>`
    })

    const wrapper = mount(App, {
      localVue: localVue,
      attachToDocument: true
    })

    expect(wrapper.isVueInstance()).toBe(true)
    expect(wrapper.is('button')).toBe(true)
    const $button = wrapper.find('button')
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    // Should have instance of popover class on it
    expect($button.element[BV_POPOVER]).toBeDefined()
    expect($button.element[BV_POPOVER]).toBeInstanceOf(BVPopover)

    expect($button.attributes('aria-describedby')).not.toBeDefined()

    // Trigger click
    $button.trigger('click')
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($button.attributes('aria-describedby')).toBeDefined()
    const adb = $button.attributes('aria-describedby')

    const pop = document.getElementById(adb)
    expect(pop).not.toBe(null)
    expect(pop.classList.contains('popover')).toBe(true)
    expect(pop.classList.contains('b-popover')).toBe(true)

    wrapper.destroy()
  })
})
