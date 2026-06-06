"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeImageUrlValue = normalizeImageUrlValue;
function normalizeImageUrlValue(value) {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    if (/^(https?:|blob:|data:)/i.test(trimmed))
        return trimmed;
    if (/^\/\//.test(trimmed))
        return `https:${trimmed}`;
    if (/^(localhost|127(?:\.\d{1,3}){3})(:\d+)?(\/|$)/i.test(trimmed)) {
        return `http://${trimmed}`;
    }
    if (/^[a-z0-9.-]+\.[a-z]{2,}(?::\d+)?(\/|$)/i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}
//# sourceMappingURL=normalize-image-url.js.map