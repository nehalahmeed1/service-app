export function buildEntityI18nKey(prefix, entity) {
  const raw = entity?.slug || entity?.name || "";
  const normalized = String(raw)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) return "";
  return `${prefix}_${normalized}`;
}

export function translateEntity(t, prefix, entity, fallback = "") {
  const key = buildEntityI18nKey(prefix, entity);
  if (!key) return fallback;
  return t(key, { defaultValue: fallback });
}
