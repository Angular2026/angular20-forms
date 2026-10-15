// Legacy = pas de process mais déjà des données de committee
readonly isLegacyWorkflow = computed(() =>
  !this.processValue() && !!this.committeeValue()
);

readonly showDefaultingProcess = computed(() =>
  this.canDefault() && !this.isLegacyWorkflow()
);

readonly branch = computed<'NONE' | 'DEFAULT_REVIEW' | 'BACK_PERFORMING'>(() => {
  if (!this.canDefault() || this.isLegacyWorkflow()) return 'DEFAULT_REVIEW';
  return this.processValue() ?? 'NONE';
});


this.processValue.set(this.processCtrl().value);
this.committeeValue.set(this.committeeCtrl().value);
this.decisionDateValue.set(this.decisionDateCtrl().value);
// puis subscribe aux valueChanges
