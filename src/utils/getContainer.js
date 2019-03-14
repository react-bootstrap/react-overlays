export default function getContainer(container, defaultContainer) {
  if (container == null) return defaultContainer;
  container = typeof container === 'function' ? container() : container;
  return container || null;
}
