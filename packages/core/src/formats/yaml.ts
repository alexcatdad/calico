import { detectCircularReference } from "../utils";

const SPECIAL_CHARS = /[:#\[\]{},"'\n\t]/;

export function toYAML<T>(data: T, indent = 2): string {
  detectCircularReference(data);
  if (indent < 0 || !Number.isInteger(indent))
    throw new TypeError("YAML indentation must be positive integer");
  return ser(data, indent, 0);
}

function ser(d: any, i: number, l: number): string {
  const p = l > 0 ? " ".repeat(l * i) : "";
  if (d === null) return "null";
  if (typeof d === "undefined") return "";
  if (typeof d !== "object") {
    if (typeof d === "string") {
      if (
        d === "" ||
        SPECIAL_CHARS.test(d) ||
        !Number.isNaN(Number(d)) ||
        ["true", "false", "null"].includes(d)
      ) {
        return `"${d.replace(/"/g, '\\"')}"`;
      }
      return d;
    }
    return String(d);
  }
  if (Array.isArray(d)) {
    if (d.length === 0) return "[]";
    const lines: string[] = [];
    for (let j = 0; j < d.length; j++) {
      const it = d[j];
      const s = ser(it, i, l + 1);
      if (typeof it === "object" && it !== null && !Array.isArray(it)) {
        const ks = Object.keys(it);
        if (ks.length > 0) {
          const ln = s.split("\n");
          lines.push(
            `${p}- ${ln[0]}${
              ln.length > 1 ? `\n${ln.slice(1).join("\n")}` : ""
            }`,
          );
          continue;
        }
      }
      const trimIdx = s.search(/\S/);
      const trimmed = trimIdx > 0 ? s.slice(trimIdx) : s;
      lines.push(`${p}- ${trimmed}`);
    }
    return lines.join("\n");
  }
  const k = Object.keys(d);
  if (k.length === 0) return "{}";
  const lines: string[] = [];
  for (let j = 0; j < k.length; j++) {
    const y = k[j];
    const v = d[y];
    const s = ser(v, i, l + 1);
    if (typeof v === "object" && v !== null) {
      const vk = Object.keys(v);
      if (vk.length > 0) {
        lines.push(`${p}${y}:\n${s}`);
        continue;
      }
    }
    const trimIdx = s.search(/\S/);
    const trimmed = trimIdx > 0 ? s.slice(trimIdx) : s;
    lines.push(`${p}${y}: ${trimmed}`);
  }
  return lines.join("\n");
}

export function fromYAML<T>(input: string): T {
  if (typeof input !== "string")
    throw new TypeError(
      `fromYAML input must be string, received ${typeof input}`,
    );
  if (!input.trim()) return undefined as any;
  const lines = input.split("\n");
  let cl = 0;

  function parse(mi: number): any {
    let res: any = undefined;
    while (cl < lines.length) {
      const line = lines[cl];
      if (!line.trim() || line.trim().startsWith("#")) {
        cl++;
        continue;
      }
      const ind = line.search(/\S/);
      if (ind < mi) break;
      const c = line.trim();

      if (c.startsWith("- ")) {
        if (res === undefined) res = [];
        if (!Array.isArray(res))
          throw new SyntaxError(
            `Invalid YAML at line ${cl + 1}: expected array item`,
          );
        const v = c.substring(2).trim();
        cl++;

        // Check if this is an inline object (contains colon)
        if (v && v.includes(":")) {
          // Parse the first property inline
          const colonIdx = v.indexOf(":");
          const key = v.substring(0, colonIdx).trim();
          const value = v.substring(colonIdx + 1).trim();

          const obj: any = {};
          obj[key] = val(value);

          // Parse remaining properties at the same indentation level
          const baseIndent = ind + 2; // Properties should be indented 2 spaces from the dash
          while (cl < lines.length) {
            const nextLine = lines[cl];
            if (!nextLine.trim() || nextLine.trim().startsWith("#")) {
              cl++;
              continue;
            }
            const nextInd = nextLine.search(/\S/);

            // If indentation is less than expected, we're done with this object
            if (nextInd < baseIndent) break;

            // If indentation is exactly baseIndent, it's a sibling property
            if (nextInd === baseIndent) {
              const nextContent = nextLine.trim();
              if (nextContent.startsWith("-")) {
                // New array item, stop parsing this object
                break;
              }
              if (nextContent.includes(":")) {
                const idx = nextContent.indexOf(":");
                const k = nextContent.substring(0, idx).trim();
                const propValue = nextContent.substring(idx + 1).trim();
                cl++;
                if (propValue) {
                  obj[k] = val(propValue);
                } else {
                  // Nested object or array
                  obj[k] = parse(nextInd + 2);
                }
              } else {
                cl++;
              }
            } else {
              // Deeper indentation means nested structure that should have been handled
              break;
            }
          }
          res.push(obj);
        } else if (v) {
          // Simple value
          res.push(val(v));
        } else {
          // No inline value, parse nested content
          res.push(parse(ind + 2));
        }
      } else if (c.includes(":")) {
        const idx = c.indexOf(":");
        const k = c.substring(0, idx).trim();
        const v = c.substring(idx + 1).trim();
        if (res === undefined) res = {};
        if (Array.isArray(res))
          throw new SyntaxError(
            `Invalid YAML at line ${cl + 1}: expected array item`,
          );
        cl++;
        if (v) res[k] = val(v);
        else res[k] = parse(ind + 2);
      } else
        throw new SyntaxError(
          `Invalid YAML at line ${cl + 1}: unexpected token`,
        );
    }
    return res;
  }

  function val(s: string): any {
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "null") return null;
    if (!Number.isNaN(Number(s))) return Number(s);
    if (s.startsWith('"') && s.endsWith('"'))
      return s.slice(1, -1).replace(/\\"/g, '"');
    return s;
  }

  try {
    const r = parse(0);
    return r === undefined ? ({} as T) : r;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Unknown YAML parse error");
  }
}
