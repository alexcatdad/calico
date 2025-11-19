export function detectCircularReference(
  o: unknown,
  s: WeakSet<object> = new WeakSet(),
  p = "root",
): void {
  if (o === null || typeof o !== "object") return;
  if (s.has(o as object))
    throw new Error(
      `Circular reference detected at path '${p}' - object references itself`,
    );
  s.add(o as object);
  for (const k in o as object)
    if (Object.prototype.hasOwnProperty.call(o, k))
      detectCircularReference(
        (o as Record<string, unknown>)[k],
        s,
        `${p}.${k}`,
      );
  s.delete(o as object);
}
