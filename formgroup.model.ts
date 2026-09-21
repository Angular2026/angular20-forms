As part of the FRB perimeter transition, the workflow is currently blocked when the SRP selection criteria is empty/null.

The business rule covering this case was not included in the initial implementation scope.

To unblock the FRB workflow urgently, a temporary backend workaround has been implemented allowing the workflow transitions to proceed when the SRP selection criteria is empty/null.

This ticket covers only the temporary solution required to unblock the current situation.
The complete/clean implementation and archive-related changes remain in the original ticket / will be handled separately.

Acceptance Criteria

* FRB counterparties can continue the Rating Workflow when SRP selection criteria is empty/null.
* Workflow transitions up to the expected statuses are no longer blocked by this missing value.
* Existing behavior for non-FRB perimeter is not impacted.
* The workaround is covered by appropriate backend tests.
* No archive/PDF refactoring or final clean solution is included in this ticket.