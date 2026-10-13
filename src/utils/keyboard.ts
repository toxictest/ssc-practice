/** Never hijack native controls, text input, modifier shortcuts, or held keys. */
export function ignoreGameShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  return event.repeat || event.altKey || event.ctrlKey || event.metaKey
    || (target instanceof HTMLElement && (!!target.closest("input, select, textarea, [contenteditable=true]")
      || (["Enter", " "].includes(event.key) && !!target.closest("button, a"))));
}
