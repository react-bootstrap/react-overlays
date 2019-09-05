import React from 'react';

const DropdownContext = React.createContext({
  menuRef() {},
  toggleRef() {},
  onToggle() {},
  toggleNode: undefined,
  align: null,
  show: null,
  drop: null,
});

export default DropdownContext;
