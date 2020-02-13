import { mount } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import simulant from 'simulant';
import Dropdown from '../src/Dropdown';

describe('<Dropdown>', () => {
  const Menu = ({
    usePopper,
    rootCloseEvent,
    renderSpy,
    popperConfig,
    ...props
  }) => (
    <Dropdown.Menu
      flip
      popperConfig={popperConfig}
      usePopper={usePopper}
      rootCloseEvent={rootCloseEvent}
    >
      {args => {
        renderSpy && renderSpy(args);
        const { show, close, props: menuProps } = args;
        return (
          <div
            {...props}
            {...menuProps}
            data-show={show}
            className="menu"
            onClick={close}
            style={{ display: show ? 'flex' : 'none' }}
          />
        );
      }}
    </Dropdown.Menu>
  );

  const Toggle = props => (
    <Dropdown.Toggle>
      {({ toggle, props: toggleProps }) => (
        <button
          {...props}
          {...toggleProps}
          id="test-id"
          type="button"
          className="toggle"
          onClick={toggle}
        />
      )}
    </Dropdown.Toggle>
  );

  const SimpleDropdown = ({ children, menuSpy, usePopper, ...outer }) => (
    <Dropdown {...outer}>
      {({ props }) => (
        <div tabIndex="-1" {...props}>
          {children || (
            <>
              <Toggle key="toggle">Child Title</Toggle>,
              <Menu key="menu" renderSpy={menuSpy} usePopper={usePopper}>
                <button type="button">Item 1</button>
                <button type="button">Item 2</button>
                <button type="button">Item 3</button>
                <button type="button">Item 4</button>
              </Menu>
            </>
          )}
        </div>
      )}
    </Dropdown>
  );

  it('renders toggle with Dropdown.Toggle', () => {
    const buttonNode = mount(<SimpleDropdown />)
      .assertSingle('button.toggle')
      .getDOMNode();

    buttonNode.textContent.should.match(/Child Title/);

    buttonNode.getAttribute('aria-haspopup').should.equal('true');
    buttonNode.getAttribute('aria-expanded').should.equal('false');
    buttonNode.getAttribute('id').should.be.ok;
  });

  it('forwards alignEnd to menu', () => {
    const renderSpy = sinon.spy(args => {
      args.alignEnd.should.equal(true);
    });

    mount(
      <SimpleDropdown show alignEnd usePopper={false} menuSpy={renderSpy} />,
    );

    renderSpy.should.have.been.called;
  });

  // NOTE: The onClick event handler is invoked for both the Enter and Space
  // keys as well since the component is a button. I cannot figure out how to
  // get ReactTestUtils to simulate such though.
  it('toggles open/closed when clicked', () => {
    const wrapper = mount(<SimpleDropdown />);

    wrapper.assertNone('.show');
    wrapper.assertNone('ReactOverlaysDropdownMenu > *');
    wrapper.assertSingle('button[aria-expanded=false]').simulate('click');

    wrapper.assertSingle('ReactOverlaysDropdown');

    wrapper.assertSingle('div[data-show=true]');
    wrapper.assertSingle('button[aria-expanded=true]').simulate('click');

    wrapper.assertNone('.show');

    wrapper.assertSingle('button[aria-expanded=false]');
  });

  it('closes when clicked outside', () => {
    const closeSpy = sinon.spy();
    const wrapper = mount(<SimpleDropdown onToggle={closeSpy} />);

    wrapper.find('.toggle').simulate('click');

    act(() => {
      // Use native events as the click doesn't have to be in the React portion
      simulant.fire(document.body, 'click');
    });

    closeSpy.should.have.been.calledTwice;
    closeSpy.lastCall.args[0].should.equal(false);
  });

  it('closes when mousedown outside if rootCloseEvent set', () => {
    const closeSpy = sinon.spy();

    const wrapper = mount(
      <Dropdown onToggle={closeSpy} id="test-id">
        {() => (
          <div>
            <Toggle>Child Title</Toggle>,
            <Menu rootCloseEvent="mousedown">
              <button type="button">Item 1</button>
              <button type="button">Item 2</button>
            </Menu>
          </div>
        )}
      </Dropdown>,
    );

    act(() => {
      wrapper.find('.toggle').simulate('click');
    });

    // Use native events as the click doesn't have to be in the React portion
    const event = new MouseEvent('mousedown');
    document.dispatchEvent(event);

    closeSpy.should.have.been.calledTwice;
    closeSpy.lastCall.args[0].should.equal(false);
  });

  it('when focused and closed toggles open when the key "down" is pressed', () => {
    const wrapper = mount(<SimpleDropdown />);

    wrapper.find('.toggle').simulate('keyDown', { key: 'ArrowDown' });

    wrapper.assertSingle('ReactOverlaysDropdownMenu div');
  });

  it('closes when item is clicked', () => {
    const onToggle = sinon.spy();

    const wrapper = mount(<SimpleDropdown />).setProps({
      show: true,
      onToggle,
    });

    wrapper.assertSingle('ReactOverlaysDropdown[show=true]');

    wrapper
      .find('button')
      .last()
      .simulate('click');

    onToggle.should.have.been.calledWith(false);
  });

  it('does not close when onToggle is controlled', () => {
    const onToggle = sinon.spy();

    const wrapper = mount(<SimpleDropdown show onToggle={onToggle} />);

    wrapper.find('.toggle').simulate('click');
    wrapper
      .find('.menu > button')
      .first()
      .simulate('click');

    onToggle.should.have.been.calledWith(false);
    wrapper
      .find('ReactOverlaysDropdown')
      .prop('show')
      .should.equal(true);
  });

  it('has aria-labelledby same id as toggle button', () => {
    const wrapper = mount(<SimpleDropdown defaultShow />);

    wrapper
      .find('.toggle')
      .getDOMNode()
      .getAttribute('id')
      .should.equal(
        wrapper
          .find('.menu')
          .getDOMNode()
          .getAttribute('aria-labelledby'),
      );
  });

  describe('focusable state', () => {
    let focusableContainer;

    beforeEach(() => {
      focusableContainer = document.createElement('div');
      document.body.appendChild(focusableContainer);
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(focusableContainer);
      document.body.removeChild(focusableContainer);
    });

    it('when focus should not be moved to first item when focusFirstItemOnShow is `false`', () => {
      const wrapper = mount(
        <Dropdown focusFirstItemOnShow={false}>
          {({ props }) => (
            <div {...props}>
              <Toggle>Child Title</Toggle>,
              <Menu>
                <button type="button">Item 1</button>
              </Menu>
            </div>
          )}
        </Dropdown>,
        { attachTo: focusableContainer },
      );

      wrapper
        .find('.toggle')
        .getDOMNode()
        .focus();

      wrapper.find('.toggle').simulate('click');

      document.activeElement.should.equal(wrapper.find('.toggle').getDOMNode());
    });

    it('when focused and closed sets focus on first menu item when the key "down" is pressed for role="menu"', () => {
      const wrapper = mount(
        <Dropdown>
          {({ props }) => (
            <div {...props}>
              <Toggle>Child Title</Toggle>,
              <Menu role="menu">
                <button type="button">Item 1</button>
                <button type="button">Item 2</button>
              </Menu>
            </div>
          )}
        </Dropdown>,
        { attachTo: focusableContainer },
      );

      wrapper
        .find('.toggle')
        .getDOMNode()
        .focus();

      wrapper.find('.toggle').simulate('keyDown', { key: 'ArrowDown' });

      document.activeElement.should.equal(
        wrapper
          .find('.menu > button')
          .first()
          .getDOMNode(),
      );
    });

    it('when focused and closed sets focus on first menu item when the focusFirstItemOnShow is true', () => {
      const wrapper = mount(
        <Dropdown focusFirstItemOnShow>
          {({ props }) => (
            <div {...props}>
              <Toggle>Child Title</Toggle>,
              <Menu>
                <button type="button">Item 1</button>
                <button type="button">Item 2</button>
              </Menu>
            </div>
          )}
        </Dropdown>,
        { attachTo: focusableContainer },
      );

      wrapper
        .find('.toggle')
        .getDOMNode()
        .focus();

      wrapper.find('.toggle').simulate('click');

      document.activeElement.should.equal(
        wrapper
          .find('.menu > button')
          .first()
          .getDOMNode(),
      );
    });

    it('when open and the key "Escape" is pressed the menu is closed and focus is returned to the button', () => {
      const wrapper = mount(<SimpleDropdown defaultShow />, {
        attachTo: focusableContainer,
      });

      const firstItem = wrapper.find('.menu > button').first();

      firstItem.getDOMNode().focus();
      document.activeElement.should.equal(firstItem.getDOMNode());

      firstItem.simulate('keyDown', { key: 'Escape' });

      document.activeElement.should.equal(wrapper.find('.toggle').getDOMNode());
    });

    it('when open and the key "tab" is pressed the menu is closed and focus is progress to the next focusable element', done => {
      const wrapper = mount(
        <div>
          <SimpleDropdown defaultShow />
          <input type="text" id="next-focusable" />
        </div>,
        focusableContainer,
      );

      // Need to use Container instead of div above to make instance a composite
      // element, to make this call legal.

      wrapper.find('.toggle').simulate('keyDown', { key: 'Tab' });

      setTimeout(() => {
        wrapper
          .find('.toggle')
          .getDOMNode()
          .getAttribute('aria-expanded')
          .should.equal('false');
        done();
      });

      // simulating a tab event doesn't actually shift focus.
      // at least that seems to be the case according to SO.
      // hence no assert on the input having focus.
    });
  });

  describe('popper config', () => {
    it('can add modifiers', done => {
      const spy = sinon.spy();
      const popper = {
        modifiers: [
          {
            name: 'test',
            enabled: true,
            phase: 'write',
            fn: spy,
          },
        ],
      };

      mount(
        <Dropdown show id="test-id">
          {() => (
            <div>
              <Toggle>Child Title</Toggle>
              <Menu popperConfig={popper}>
                <button type="button">Item 1</button>
                <button type="button">Item 2</button>
              </Menu>
            </div>
          )}
        </Dropdown>,
      );

      setTimeout(() => {
        spy.should.have.been.calledOnce;
        done();
      });
    });
  });
});
