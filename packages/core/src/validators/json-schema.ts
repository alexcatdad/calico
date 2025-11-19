import type { ValidationResult, ValidationSchema } from "../types";

export function validate(d: unknown, s: ValidationSchema): ValidationResult {
  const e: Array<{ path: string; message: string; value: unknown }> = [];
  function v(val: unknown, sc: ValidationSchema, p: string) {
    if (!sc) return;
    if (sc.type) {
      const t = sc.type;
      if (t === "string" && typeof val !== "string")
        e.push({
          path: p,
          message: `type: string, got ${typeof val}`,
          value: val,
        });
      else if (t === "number" && typeof val !== "number")
        e.push({
          path: p,
          message: `type: number, got ${typeof val}`,
          value: val,
        });
      else if (t === "boolean" && typeof val !== "boolean")
        e.push({
          path: p,
          message: `type: boolean, got ${typeof val}`,
          value: val,
        });
      else if (t === "array" && !Array.isArray(val))
        e.push({
          path: p,
          message: `type: array, got ${typeof val}`,
          value: val,
        });
      else if (
        t === "object" &&
        (typeof val !== "object" || val === null || Array.isArray(val))
      )
        e.push({
          path: p,
          message: `type: object, got ${typeof val}`,
          value: val,
        });
    }
    if (sc.required && typeof val === "object" && val !== null) {
      for (const f of sc.required) {
        if (!(f in val))
          e.push({ path: `${p}.${f}`, message: "required", value: undefined });
      }
    }
    if (sc.properties && typeof val === "object" && val !== null) {
      for (const k in sc.properties) {
        if (k in val) v((val as Record<string, any>)[k], sc.properties[k], `${p}.${k}`);
      }
    }
    if (sc.items && Array.isArray(val)) {
      val.forEach((i, x) => {
        v(i, sc.items!, `${p}[${x}]`);
      });
    }
    if (typeof val === "number") {
      if (sc.minimum !== undefined && val < sc.minimum)
        e.push({ path: p, message: `>= ${sc.minimum}`, value: val });
      if (sc.maximum !== undefined && val > sc.maximum)
        e.push({ path: p, message: `<= ${sc.maximum}`, value: val });
    }
    if (typeof val === "string") {
      if (sc.minLength !== undefined && val.length < sc.minLength)
        e.push({ path: p, message: `minLen >= ${sc.minLength}`, value: val });
      if (sc.maxLength !== undefined && val.length > sc.maxLength)
        e.push({ path: p, message: `maxLen <= ${sc.maxLength}`, value: val });
      if (sc.pattern) {
        if (!new RegExp(sc.pattern).test(val))
          e.push({ path: p, message: `pattern: ${sc.pattern}`, value: val });
      }
      if (sc.format === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
          e.push({ path: p, message: "invalid email", value: val });
      }
    }
  }
  v(d, s, "root");
  return { valid: e.length === 0, errors: e.length > 0 ? e : undefined };
}
