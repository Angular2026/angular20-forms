// ⚠️ TODO-MOCK: fichier entièrement temporaire, à supprimer au go-live backend
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface IFrbMockData {
  frbRatingPerimeter: string; // 'Y' | 'N'
  frbModelCode: string;
}

const FRB_MOCK_STORAGE_KEY = 'DEBUG_frbRatingPerimeter'; // TODO-MOCK

@Injectable({ providedIn: 'root' })
export class FrbMockService {
  getFrbData(): Observable<IFrbMockData> {
    // TODO-MOCK: lit le localStorage, coché = 'Y', décoché/absent = 'N'
    const isChecked = localStorage.getItem(FRB_MOCK_STORAGE_KEY) === 'true';
    return of({
      frbRatingPerimeter: isChecked ? 'Y' : 'N',
      frbModelCode: 'PLACM010', // 🔧 TODO-MOCK: fixe pour l'instant, change ici pour tester BR04
    }).pipe(delay(200));
  }
}

// TODO-MOCK: méthode entièrement temporaire
onFrbRatingPerimeterMockToggle(checked: boolean): void {
  localStorage.setItem('DEBUG_frbRatingPerimeter', String(checked));
}

<!-- TODO-MOCK: binding temporaire ajouté sur la checkbox existante -->
<div
  class="checkbox"
  (click)="onFrbRatingPerimeterMockToggle(!frbRatingPerimeterChecked)"
>
  FRB Rating Perimeter
</div>


// TODO-MOCK: à garder tant qu'on n'a pas le vrai backend, mais devient transparent
// (le service retourne toujours 'N' par défaut si rien n'est coché en localStorage)
this.frbMockService.getFrbData().subscribe(frbData => {
  this.frbRatingPerimeter = frbData.frbRatingPerimeter;
  this.frbModelCode = frbData.frbModelCode;
  this.checkFrbSrpAuthorization();
  this.initRatingPolicySelectionForm();
});


localStorage.setItem('DEBUG_frbRatingPerimeter', 'true'); // active le mock
localStorage.setItem('DEBUG_frbRatingPerimeter', 'false'); // désactive
