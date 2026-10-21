/** Space occupied by a pinned header, not by a header in normal document flow. */
export function pinnedHeaderOffset() {
  const header = document.querySelector('header')
  if (!header) return 0
  const position = getComputedStyle(header).position
  return position === 'sticky' || position === 'fixed'
    ? header.getBoundingClientRect().height
    : 0
}
