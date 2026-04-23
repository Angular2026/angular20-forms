get nextRatingDateCalculated(): string {
  const rawValue: string = this.ccDecisionsForm()
    .get('ratingCcDecision.nextRatingDateCalculated')?.getRawValue();

  if (!rawValue) return '';

  let date: Date;

  if (rawValue.includes('-')) {
    // Format ISO : 2027-04-30
    date = new Date(rawValue);
  } else {
    // Format DD/MM/YYYY
    const [day, month, year] = rawValue.split('/');
    date = new Date(`${month}/${day}/${year}`);
  }

  if (isNaN(date.getTime())) return '';

  // ✅ Toujours retourner DD/MM/YYYY
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}
