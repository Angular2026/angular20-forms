console.log('form', this.defaultCounterpartyForm,
  'ctrl', this.defaultCounterpartyForm?.get('defaultingProcess'),
  'value', JSON.stringify(this.defaultCounterpartyForm?.get('defaultingProcess')?.value));


private isBackPerforming(): boolean {
  const v = this.defaultCounterpartyForm?.get('defaultingProcess')?.value
    ?? this.workflowDTO?.defaultingProcess; // fallback si le form n'est pas prêt (nom à adapter)
  return (v?.code ?? v) === 'BACK_PERFORMING';
}

case 'defaultCCDecision': {
  const process = this.defaultCounterpartyForm?.get('defaultingProcess')?.value;
  if (!this.defaultCounterpartyForm) return false; // pas encore chargé
  return process !== 'BACK_PERFORMING' && ( /* conditions d'état */ );
}

defaultingProcess = signal<string | null>(null);

onDefaultCounterpartyForm(form: FormGroup) {
  this.defaultCounterpartyForm = form;
  const ctrl = form.get('defaultingProcess');
  this.defaultingProcess.set(ctrl?.value ?? null);
  ctrl?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(v => this.defaultingProcess.set(v));
}  


case 'defaultCCDecision':
  return this.defaultingProcess() !== 'BACK_PERFORMING' && (...);


// enfant, dans initDefaultClientForm juste avant l'emit
console.log('EMIT', this.defaultingClientData?.defaultingProcess, this.defaultClientForm);

// parent, dans onDefaultCounterpartyForm
console.log('RECU', form.get('defaultingProcess')?.value, form);
