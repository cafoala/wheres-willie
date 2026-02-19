/**
 * Adapter for NBN Atlas API data
 * Transforms NBN occurrence records into the app's sighting model
 */

/**
 * Parse coordinates from NBN Atlas record
 */
export const parseCoordinates = (occurrence) => {
  const lat = occurrence?.decimalLatitude;
  const lng = occurrence?.decimalLongitude;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return [lat, lng];
  }

  return null;
};

/**
 * Convert NBN eventDate to Date object
 */
export const parseEventDate = (occurrence) => {
  const eventDate = occurrence?.eventDate;
  if (typeof eventDate === 'number') {
    return new Date(eventDate);
  }

  const year = occurrence?.year;
  const month = occurrence?.month;
  if (year) {
    const monthNum = month ? parseInt(month, 10) - 1 : 0;
    return new Date(year, monthNum, 1);
  }

  return null;
};

/**
 * Check if occurrence is within the last N days
 */
export const isWithinLastDays = (occurrence, days) => {
  const date = parseEventDate(occurrence);
  if (!date || isNaN(date.getTime())) return false;

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff;
};

/**
 * Normalise species name for consistency with Seawatch/metadata keys
 * e.g. "Harbour Porpoise" -> "Harbour porpoise"
 */
const normaliseSpeciesName = (name) => {
  if (!name || typeof name !== 'string') return name;
  const parts = name.split(/\s+/);
  return parts
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(' ');
};

/**
 * Extract common name, falling back to scientific name
 */
export const getDisplayName = (occurrence) => {
  const raw = occurrence?.vernacularName || occurrence?.scientificName || 'Unknown species';
  return normaliseSpeciesName(raw);
};

/**
 * Format location description
 */
export const formatLocation = (occurrence) => {
  const parts = [];

  if (occurrence?.stateProvince) {
    parts.push(occurrence.stateProvince);
  }

  if (occurrence?.gridReference) {
    parts.push(`Grid: ${occurrence.gridReference}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Unknown location';
};

/**
 * Format observer/recorder information
 */
export const formatObserver = (occurrence) => {
  const recordedBy = occurrence?.recordedBy;
  if (Array.isArray(recordedBy) && recordedBy.length > 0) {
    return recordedBy.join(', ');
  }
  if (typeof recordedBy === 'string') {
    return recordedBy;
  }
  return 'Unknown';
};

/**
 * Transform a single NBN occurrence into app format (compatible with Seawatch)
 */
export const adaptOccurrence = (occurrence) => {
  const coords = parseCoordinates(occurrence);
  if (!coords) return null;

  const date = parseEventDate(occurrence);
  const displayName = getDisplayName(occurrence);
  const location = formatLocation(occurrence);
  const dateStr = date ? date.toISOString().split('T')[0] : null;

  return {
    id: occurrence.uuid || occurrence.occurrenceID,
    species: displayName,
    scientificName: occurrence.scientificName,

    // App-compatible fields (InfoBar, MapShell expect when, where)
    when: dateStr,
    where: location,
    date: date ? date.toISOString() : null,
    count: 1, // NBN records are typically single observations

    lat: coords[0],
    lng: coords[1],
    location,
    gridReference: occurrence.gridReference,
    stateProvince: occurrence.stateProvince,

    observer: formatObserver(occurrence),
    org: occurrence.dataProviderName || null,

    source: 'NBN Atlas',
    dataProvider: occurrence.dataProviderName,
    dataResource: occurrence.dataResourceName,
    verificationStatus: occurrence.identificationVerificationStatus,

    _raw: occurrence,
  };
};

/**
 * Main adapter - transforms NBN API response into app format
 * Filters by date range and coordinate availability
 */
export const adaptNbnData = (nbnData, daysRecent = 90) => {
  if (!nbnData || !Array.isArray(nbnData.occurrences)) {
    return [];
  }

  return nbnData.occurrences
    .filter((occurrence) => {
      const coords = parseCoordinates(occurrence);
      if (!coords) return false;
      return isWithinLastDays(occurrence, daysRecent);
    })
    .map(adaptOccurrence)
    .filter(Boolean);
};

export default {
  parseCoordinates,
  parseEventDate,
  isWithinLastDays,
  getDisplayName,
  formatLocation,
  formatObserver,
  adaptOccurrence,
  adaptNbnData,
};
