fetchFrbData(): void {
  this.workflowService.getFrbData(this.workflowDTO()).pipe(
    tap(frb => this.isFrbRatingPerimeter.set(frb.frbRatingPerimeter)),
    switchMap(frb => {
      if (!this.isFrbRatingPerimeter()) return EMPTY;   // ⚠️ vérifie ton else
      this.addCurrentSRPControl();
      this.applyFrbLabel(frb);                          // le bloc recommendedSRP
      return merge(this.fetchRatingPolicyDetails$(), this.getSRPlist$(true));
    }),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe();
}


// avant : subscribe interne
private fetchRatingPolicyDetails$(): Observable<IRatingPolicyDetails> {
  const dto: IRatingPolicyData = {
    encryptedWorkflowUUID: this.workflowDTO().encryptedUUID,
    salt: this.workflowDTO().salt,
  };
  return this.workflowService.fetchRatingPolicyDetails(dto).pipe(
    tap(details => {
      this.ratingPolicySelectionDetails = details;
      this.workflowService.refreshPropagationSchemesEligibleValue(details?.propagationSchemesEligible);
      this.workflowService.refreshSrpValue(details?.currentSrpUsed === 'PLACH' ? 'PLACM' : details?.modelType);
      this.workflowService.updateInheritanceType(details?.typeOfInheritance);
      this.initRatingPolicySelectionForm();
    })
  );
}

private getSRPlist$(isFrbRatingPerimeter?: boolean): Observable<ISrp[]> {
  const selectedResponseId = this.srpForm.controls[0]?.getRawValue()?.SelectedResponseId;
  const isIRBA = (selectedResponseId && selectedResponseId === 1) || isFrbRatingPerimeter;
  return this.workflowService.getSRPlist(isIRBA).pipe(
    tap(srplist => { this.srpList = srplist; this.srpMappedList = this.mapSrp(srplist); })
  );
}

