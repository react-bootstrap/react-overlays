import React from 'react';

export type DropDirection = 'up' | 'down' | 'left' | 'right';

export type DropdownContextValue = {
  toggle: (nextShow: boolean, event?: React.SyntheticEvent | Event) => void;
  menuElement: HTMLElement | null;
  toggleElement: HTMLElement | null;
  setMenu: (ref: HTMLElement | null) => void;
  setToggle: (ref: HTMLElement | null) => void;

  show: boolean;
  alignEnd?: boolean;
  drop?: DropDirection;
};

const DropdownContext = React.createContext<DropdownContextValue>(null as any);

export default DropdownContext;
