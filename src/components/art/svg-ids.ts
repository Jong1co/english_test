/**
 * Ids for gradients, clips and filters inside one drawing, prefixed per illustration (as on the canvas).
 * Fixed strings rather than `useId()`: web pre-renders on the server, and React ids differ between the
 * server and the client there. A repeated drawing reuses identical definitions, which renders the same.
 */
export function svgIds(prefix: string) {
  const id = (name: string) => `${prefix}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  return { id, url };
}
