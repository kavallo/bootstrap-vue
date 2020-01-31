import { mount, createLocalVue as CreateLocalVue } from '@vue/test-utils'
import { waitNT, waitRAF } from '../../../tests/utils'
import { BPopover } from './popover'

const localVue = new CreateLocalVue()

// Our test application definition
const appDef = {
  props: [
    'triggers',
    'show',
    'disabled',
    'noFade',
    'title',
    'titleAttr',
    'btnDisabled',
    'variant',
    'customClass'
  ],
  render(h) {
    return h('article', { attrs: { id: 'wrapper' } }, [
      h(
        'button',
        {
          attrs: {
            id: 'foo',
            type: 'button',
            disabled: this.btnDisabled || null,
            title: this.titleAttr || null
          }
        },
        'text'
      ),
      h(
        BPopover,
        {
          attrs: { id: 'bar' },
          props: {
            target: 'foo',
            triggers: this.triggers,
            show: this.show,
            disabled: this.disabled,
            noFade: this.noFade || false,
            variant: this.variant,
            customClass: this.customClass
          }
        },
        [h('template', { slot: 'title' }, this.$slots.title), this.$slots.default || '']
      )
    ])
  }
}

// The majority of functionality has been tested in the tooltip component tests
// as popover shares a common mixin with tooltip
// So we just test a few key differences

// Note: `wrapper.destroy()` MUST be called at the end of each test in order for
// the next test to function properly!
describe('b-popover', () => {
  const origGetBCR = Element.prototype.getBoundingClientRect

  beforeEach(() => {
    // Mock getBCR so that the isVisible(el) test returns true
    // Needed for visibility checks of trigger element, etc
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

  it('has expected default structure', async () => {
    const App = localVue.extend(appDef)
    const wrapper = mount(App, {
      attachToDocument: true,
      localVue: localVue,
      propsData: {
        triggers: 'click'
      },
      slots: {
        title: 'title',
        default: 'content'
      }
    })

    expect(wrapper.isVueInstance()).toBe(true)
    await waitNT(wrapper.vm)

    expect(wrapper.is('article')).toBe(true)
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).not.toBeDefined()

    // <b-popover> wrapper
    const $tipHolder = wrapper.find(BPopover)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    wrapper.destroy()
  })

  it('initially open has expected structure', async () => {
    jest.useFakeTimers()
    const App = localVue.extend(appDef)
    const wrapper = mount(App, {
      attachToDocument: true,
      localVue: localVue,
      propsData: {
        triggers: 'click',
        show: true
      },
      slots: {
        title: 'title',
        default: 'content'
      }
    })

    expect(wrapper.isVueInstance()).toBe(true)
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    jest.runOnlyPendingTimers()

    expect(wrapper.is('article')).toBe(true)
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('data-original-title')).not.toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // <b-popover> wrapper
    const $tipHolder = wrapper.find(BPopover)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    // Find the popover element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('popover')).toBe(true)
    expect(tip.classList.contains('b-popover')).toBe(true)

    // Hide the Popover
    wrapper.setProps({
      show: false
    })
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    jest.runOnlyPendingTimers()

    expect($button.attributes('aria-describedby')).not.toBeDefined()

    // Popover element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)

    wrapper.destroy()
  })
})
