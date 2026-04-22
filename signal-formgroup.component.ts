get nextRatingDateCalculated() {
  const rawValue: string = this.ccDecisionsForm()
    .get('ratingCcDecision.nextRatingDateCalculated')
    ?.getRawValue();

  if (!rawValue) return null;

  // Format ISO avec tirets (ex: 2026-04-09) → direct
  if (rawValue.includes('-')) {
    const date = new Date(rawValue);
    return isNaN(date.getTime()) ? null : date;
  }

  // Format DD/MM/YYYY → swap day/month pour JS
  const [day, month, year] = rawValue.split('/');
  const date = new Date(`${month}/${day}/${year}`); // ✅ MM/DD/YYYY
  return isNaN(date.getTime()) ? null : date;
}
