workflowDTO = input.required<WorkflowDocument>(); // input existant, inchangé

// copie locale writable
private _workflowDTOLocal = signal<WorkflowDocument>(this.workflowDTO());

// se resynchronise si le parent repasse une nouvelle référence
private syncEffect = effect(() => {
  this._workflowDTOLocal.set(this.workflowDTO());
}, { allowSignalWrites: true });

// accès readonly pour le reste du composant
workflowDTOLocal = this._workflowDTOLocal.asReadonly();
