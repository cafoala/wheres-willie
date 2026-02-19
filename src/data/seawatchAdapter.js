const COORD_RE = /(\d{1,2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3}(?:\.\d+)?)\s*([EW])/i;

export const parseLatLngFromWhere = (text) => {
  if (!text) return null;
  const match = text.match(COORD_RE);
  if (!match) return null;
  const lat = Number(match[1]);
  const latDir = match[2].toUpperCase();
  const lng = Number(match[3]);
  const lngDir = match[4].toUpperCase();
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  const finalLat = latDir === 'S' ? -lat : lat;
  const finalLng = lngDir === 'W' ? -lng : lng;
  return [finalLat, finalLng];
};

export const isWithinLastDays = (dateString, days, now = new Date()) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return false;
  const max = days * 24 * 60 * 60 * 1000;
  return diff <= max;
};

export const adaptSeawatchData = (data, options = {}) => {
  const { days = 31, now = new Date() } = options;
  const sightings = Array.isArray(data?.sightings) ? data.sightings : [];
  const results = [];

  sightings.forEach((item, index) => {
    const parsed = item?.parsed || {};
    
    // Try to get coordinates from original data
    let coords = parseLatLngFromWhere(parsed.where);
    
    // If no coordinates, try geocoded data
    if (!coords && item?.geocoded) {
      const geo = item.geocoded;
      if (geo.lat && geo.lon) {
        coords = [geo.lat, geo.lon];
      }
    }
    
    if (!coords) return;
    if (!parsed.species) return;
    if (!isWithinLastDays(parsed.date, days, now)) return;

    const count = Number(parsed.count);
    results.push({
      id: `${parsed.date || 'unknown'}-${index}`,
      species: parsed.species,
      when: parsed.date,
      where: parsed.where,
      time: parsed.time,
      count: Number.isFinite(count) && count > 0 ? count : null,
      lat: coords[0],
      lng: coords[1],
      observer: parsed.observer || null,
      org: parsed.org || null,
      isGeocoded: item?.geocoded ? true : false,
      region: item?.region || null,
      regionNo: item?.regionNo || null,
    });
  });

  return results;
};
