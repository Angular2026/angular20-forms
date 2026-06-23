ngOnInit() {
  this.workflowService.getSRPTree(workflowDTO).subscribe(tree => {
    this.workflowService.setSRPTree(tree);
  });
}

private srpTreeSignal = signal<ISRPTree | undefined>(undefined);
srpTree = this.srpTreeSignal.asReadonly();

// Equivalent de setIsFinancingTypeLBOFromSaveResponse() — basé sur le tree chargé/sauvegardé
isLBOFinancing = computed(() => {
  const tree = this.srpTreeSignal();
  const questionObj = tree?.questions.find(
    q => q.questionText.toLowerCase() === 'type of financing'
  );
  const selectedResponse = questionObj?.responses.find(r => r.selected);
  return selectedResponse?.responseText?.toLowerCase() === 'lbo';
});

setSRPTree(tree: ISRPTree) {
  this.srpTreeSignal.set(tree);
}
