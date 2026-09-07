Context
Regression introduced by AER_07272NEXT-3777 (Cross model | Rating PD with Large Corporates + SU GRR/GRR facility with Asset Finance).

Steps to reproduce
1. Open a counterparty rating using the Large Corporates or Asset Finance model.
2. Trigger a change on the SU GRR/GRR model (e.g. change obligor type/sub-type, or switch between SuGrr model types).
3. Observe the console/UI.

Actual result
Error: Cannot find control with unspecified name attribute
  at pd-large-corp-rating.component.ts:875
  at workflow.service.ts:445

The sugrrRating form group's controls get out of sync with the template: controls referenced by formControlName in the HTML get removed from the FormGroup when switching obligor type/SuGrr model, causing Angular to throw.

Expected result
Switching obligor type or SuGrr model should update the SU GRR/GRR fields (add new ones, sync values, clear validators for irrelevant ones) without ever removing a control still bound in the template, and without throwing.

Root cause
handleSugrrModelChanges() in PdLargeCorpRatingComponent used setControl to replace the whole sugrrRating subgroup, breaking existing formGroupName/formControlName bindings. Fixed by syncing controls in place (patch value/validators, addControl for new fields, clearValidators for stale ones) instead of swapping or removing control instances.

Affected files
pd-large-corp-rating.component.ts (handleSugrrModelChanges, syncSugrrControls, clearStaleSugrrControls)
