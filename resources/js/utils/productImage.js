export function pickMainImage(images) {
    const list = Array.isArray(images) ? images : [];
    return list.find((img) => img?.is_main || img?.is_primary) || list[0] || null;
}

