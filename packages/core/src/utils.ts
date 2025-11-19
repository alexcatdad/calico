export function detectCircularReference(o: any, s = new WeakSet(), p = 'root'): void {
    if (o === null || typeof o !== 'object') return;
    if (s.has(o)) throw new Error(`Circular reference detected at path '${p}' - object references itself`);
    s.add(o);
    for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) detectCircularReference(o[k], s, `${p}.${k}`);
    s.delete(o);
}
