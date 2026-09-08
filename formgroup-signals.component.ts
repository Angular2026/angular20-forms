this.workflowService.getFrbData(this.workflowDTO()).pipe(
  tap(frb => this.isFrbRatingPerimeter.set(frb.frbRatingPerimeter)),
  filter(() => this.isFrbRatingPerimeter()),
  switchMap(() => this.workflowService.fetchRatingPolicyDetails(dto)),
  switchMap(details => { this.applyDetails(details); return this.workflowService.getSRPlist(true); }),
  takeUntilDestroyed(this.destroyRef)
).subscribe(srplist => this.mapSrpList(srplist));
