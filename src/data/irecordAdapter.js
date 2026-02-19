/**
 * Adapter for NBN Atlas / iRecord API data
 * Transforms NBN occurrence records into the app's data model
 */

/**
 * Parse coordinates from NBN Atlas record
 * NBN provides decimalLatitude and decimalLongitude directly
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
 * Convert NBN eventDate (milliseconds since epoch) to Date object
 */
export const parseEventDate = (occurrence) => {
  const eventDate = occurrence?.eventDate;
  if (typeof eventDate === 'number') {
    return new Date(eventDate);
  }
  
  // Fallback to year/month if available
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
 * Extract common name, falling back to scientific name
 */
export const getDisplayName = (occurrence) => {
  return occurrence?.vernacularName || occurrence?.scientificName || 'Unknown species';
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
 * Transform a single NBN occurrence into app format
 */
export const adaptOccurrence = (occurrence) => {
  const coords = parseCoordinates(occurrence);
  if (!coords) return null;

  const date = parseEventDate(occurrence);
  const displayName = getDisplayName(occurrence);

  return {
    // Core identification
    id: occurrence.uuid || occurrence.occurrenceID,
    species: displayName,
    scientificName: occurrence.scientificName,
    
    // Location
    lat: coords[0],
    lng: coords[1],
    location: formatLocation(occurrence),
    gridReference: occurrence.gridReference,
    stateProvince: occurrence.stateProvince,
    
    // Temporal
    date: date ? date.toISOString() : null,
    timestamp: date ? date.getTime() : null,
    year: occurrence.year,
    month: occurrence.month,
    
    // Observer
    observer: formatObserver(occurrence),
    
    // Data source
    source: 'iRecord',
    dataProvider: occurrence.dataProviderName,
    dataResource: occurrence.dataResourceName,
    license: occurrence.license,
    
    // Verification
    verificationStatus: occurrence.identificationVerificationStatus,
    
    // Additional metadata
    basisOfRecord: occurrence.basisOfRecord,
    coordinateUncertainty: occurrence.coordinateUncertaintyInMeters,
    
    // Original record for reference
    _raw: occurrence,
  };
};

/**
 * Main adapter function - transforms NBN API response into app format
 * Filters by date range and coordinate availability
 */
export const adaptIRecordData = (irecordData, daysRecent = 31) => {
  if (!irecordData || !Array.isArray(irecordData.occurrences)) {
    return [];
  }

  return irecordData.occurrences
    .filter((occurrence) => {
      // Must have valid coordinates
      const coords = parseCoordinates(occurrence);
      if (!coords) return false;

      // Must be within date range
      return isWithinLastDays(occurrence, daysRecent);
    })
    .map(adaptOccurrence)
    .filter(Boolean); // Remove any null results
};

export default {
  parseCoordinates,
  parseEventDate,
  isWithinLastDays,
  getDisplayName,
  formatLocation,
  formatObserver,
  adaptOccurrence,
  adaptIRecordData,
};
