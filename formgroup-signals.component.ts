import { TestBed } from '@angular/core/testing';
import { PgnnrRatingBlockComponent } from './pgnnr-rating-block.component';
import { RatingValidationResult } from '../models/rating-validation-result.model'; // adapte le chemin

// ─── Résultats attendus ───────────────────────────────────────────
const OK: RatingValidationResult       = { severity: 'none',    target: 'none',   code: null };
const FAIL_ERROR: RatingValidationResult  = { severity: 'error',   target: 'rating', code: 'supportConsistency' };
const FAIL_WARNING: RatingValidationResult = { severity: 'warning', target: 'rating', code: 'supportConsistency' };

// ─── Helper ──────────────────────────────────────────────────────
/**
 * Mock tous les signaux/méthodes du composant utilisés dans ratingConsistencyResult.
 * Les valeurs par défaut représentent un cas "neutre" (pas de rating proposé).
 */
function mockSignals(
  component: PgnnrRatingBlockComponent,
  overrides: {
    ratingProposedValue?:       unknown;
    supportDirection?:          string;
    supportStrength?:           string;
    hasComment?:                boolean;
    isCrBetterThanIr?:          boolean;
    isCrWorseThanIr?:           boolean;
    isCrSupportBetterThanIr?:   boolean;
    isCrSupportBetterThanMrc?:  boolean;
    isCrBetweenIrAndMrc?:       boolean;
    isCrBetweenIrAndCrSupport?: boolean;
    isCrBelowGeometricMean?:    boolean;
  } = {},
) {
  const defaults = {
    ratingProposedValue:       null,
    supportDirection:          'POSITIVE',
    supportStrength:           'WEAK',
    hasComment:                false,
    isCrBetterThanIr:          false,
    isCrWorseThanIr:           false,
    isCrSupportBetterThanIr:   false,
    isCrSupportBetterThanMrc:  false,
    isCrBetweenIrAndMrc:       false,
    isCrBetweenIrAndCrSupport: false,
    isCrBelowGeometricMean:    false,
  };

  const cfg = { ...defaults, ...overrides };

  jest.spyOn(component as any, 'ratingProposedValue').mockReturnValue(cfg.ratingProposedValue);
  jest.spyOn(component as any, 'supportDirectionValue').mockReturnValue(cfg.supportDirection);
  jest.spyOn(component as any, 'supportStrengthValue').mockReturnValue(cfg.supportStrength);
  jest.spyOn(component as any, 'hasComment').mockReturnValue(cfg.hasComment);
  jest.spyOn(component as any, 'isCrBetterThanIr').mockReturnValue(cfg.isCrBetterThanIr);
  jest.spyOn(component as any, 'isCrWorseThanIr').mockReturnValue(cfg.isCrWorseThanIr);
  jest.spyOn(component as any, 'isCrSupportBetterThanIr').mockReturnValue(cfg.isCrSupportBetterThanIr);
  jest.spyOn(component as any, 'isCrSupportBetterThanMrc').mockReturnValue(cfg.isCrSupportBetterThanMrc);
  jest.spyOn(component as any, 'isCrBetweenIrAndMrc').mockReturnValue(cfg.isCrBetweenIrAndMrc);
  jest.spyOn(component as any, 'isCrBetweenIrAndCrSupport').mockReturnValue(cfg.isCrBetweenIrAndCrSupport);
  jest.spyOn(component as any, 'isCrBelowGeometricMean').mockReturnValue(cfg.isCrBelowGeometricMean);
}

// ─── Setup ───────────────────────────────────────────────────────
describe('PgnnrRatingBlockComponent › ratingConsistencyResult', () => {
  let component: PgnnrRatingBlockComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PgnnrRatingBlockComponent],
    });
    component = TestBed.createComponent(PgnnrRatingBlockComponent).componentInstance;
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Early return ─────────────────────────────────────────────
  describe('ratingProposedValue === null', () => {
    it('retourne ok sans vérifier la direction', () => {
      mockSignals(component, { ratingProposedValue: null });
      expect(component.ratingConsistencyResult).toEqual(OK);
    });
  });

  // ─── Direction inconnue ───────────────────────────────────────
  describe('direction inconnue', () => {
    it('retourne ok par défaut', () => {
      mockSignals(component, { ratingProposedValue: 1, supportDirection: 'UNKNOWN' });
      expect(component.ratingConsistencyResult).toEqual(OK);
    });
  });

  // ─── NEGATIVE ─────────────────────────────────────────────────
  describe('NEGATIVE', () => {
    const base = { ratingProposedValue: 1, supportDirection: 'NEGATIVE' };

    describe('WEAK', () => {
      it('ok si CR = IR', () => {
        mockSignals(component, { ...base, supportStrength: 'WEAK', isCrBetterThanIr: false, isCrWorseThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail(error) si CR ≠ IR et pas de commentaire', () => {
        mockSignals(component, { ...base, supportStrength: 'WEAK', isCrBetterThanIr: true, isCrWorseThanIr: false, hasComment: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('fail(warning) si CR ≠ IR avec commentaire', () => {
        mockSignals(component, { ...base, supportStrength: 'WEAK', isCrBetterThanIr: true, hasComment: true });
        expect(component.ratingConsistencyResult).toEqual(FAIL_WARNING);
      });
    });

    describe('STRONG', () => {
      it('ok si CR worse than IR', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrWorseThanIr: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR pas worse than IR', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrWorseThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('VERY_STRONG', () => {
      it('ok si CR worse than IR', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrWorseThanIr: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR pas worse than IR', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrWorseThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('strength inconnue', () => {
      it('retourne ok par défaut', () => {
        mockSignals(component, { ...base, supportStrength: 'UNKNOWN' });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });
    });
  });

  // ─── POSITIVE ─────────────────────────────────────────────────
  describe('POSITIVE', () => {
    const base = { ratingProposedValue: 1, supportDirection: 'POSITIVE' };

    describe('UNDETERMINED', () => {
      it('ok si CR = IR', () => {
        mockSignals(component, { ...base, supportStrength: 'UNDETERMINED', isCrBetterThanIr: false, isCrWorseThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR ≠ IR', () => {
        mockSignals(component, { ...base, supportStrength: 'UNDETERMINED', isCrBetterThanIr: true });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('WEAK', () => {
      it('ok si CR = IR', () => {
        mockSignals(component, { ...base, supportStrength: 'WEAK', isCrBetterThanIr: false, isCrWorseThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR ≠ IR', () => {
        mockSignals(component, { ...base, supportStrength: 'WEAK', isCrWorseThanIr: true });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('STRONG', () => {
      it('fail si CR(Support) pas mieux que IR (pré-requis)', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrSupportBetterThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('ok si CR(Support) > MRC et CR ∈ [IR, MRC]', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true, isCrBetweenIrAndMrc: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR(Support) > MRC mais CR ∉ [IR, MRC]', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true, isCrBetweenIrAndMrc: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('ok si CR(Support) ≤ MRC et CR ∈ [IR, CR(Support)]', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: false, isCrBetweenIrAndCrSupport: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR(Support) ≤ MRC et CR ∉ [IR, CR(Support)]', () => {
        mockSignals(component, { ...base, supportStrength: 'STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: false, isCrBetweenIrAndCrSupport: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('VERY_STRONG', () => {
      it('fail si CR(Support) pas mieux que IR (pré-requis)', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('ok si CR(Support) > MRC et CR ∈ [IR, CR(Support)] ET CR < geometric_mean', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true, isCrBetweenIrAndCrSupport: true, isCrBelowGeometricMean: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR(Support) > MRC mais CR ∉ [IR, CR(Support)]', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true, isCrBetweenIrAndCrSupport: false, isCrBelowGeometricMean: true });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('fail si CR(Support) > MRC et CR ∈ [IR, CR(Support)] mais CR ≥ geometric_mean', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true, isCrBetweenIrAndCrSupport: true, isCrBelowGeometricMean: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('ok si CR(Support) ≤ MRC et CR ∈ [IR, CR(Support)]', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: false, isCrBetweenIrAndCrSupport: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });

      it('fail si CR(Support) ≤ MRC et CR ∉ [IR, CR(Support)]', () => {
        mockSignals(component, { ...base, supportStrength: 'VERY_STRONG', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: false, isCrBetweenIrAndCrSupport: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });
    });

    describe('ABSOLUTE', () => {
      it('fail si CR(Support) pas mieux que IR', () => {
        mockSignals(component, { ...base, supportStrength: 'ABSOLUTE', isCrSupportBetterThanIr: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('fail si CR(Support) pas mieux que MRC', () => {
        mockSignals(component, { ...base, supportStrength: 'ABSOLUTE', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: false });
        expect(component.ratingConsistencyResult).toEqual(FAIL_ERROR);
      });

      it('ok si CR(Support) > IR et CR(Support) > MRC', () => {
        mockSignals(component, { ...base, supportStrength: 'ABSOLUTE', isCrSupportBetterThanIr: true, isCrSupportBetterThanMrc: true });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });
    });

    describe('strength inconnue', () => {
      it('retourne ok par défaut', () => {
        mockSignals(component, { ...base, supportStrength: 'UNKNOWN' });
        expect(component.ratingConsistencyResult).toEqual(OK);
      });
    });
  });

  // ─── hasComment sur un fail ───────────────────────────────────
  describe('severity selon hasComment', () => {
    it('severity = error si hasComment = false', () => {
      mockSignals(component, { ratingProposedValue: 1, supportDirection: 'NEGATIVE', supportStrength: 'WEAK', isCrBetterThanIr: true, hasComment: false });
      expect(component.ratingConsistencyResult.severity).toBe('error');
    });

    it('severity = warning si hasComment = true', () => {
      mockSignals(component, { ratingProposedValue: 1, supportDirection: 'NEGATIVE', supportStrength: 'WEAK', isCrBetterThanIr: true, hasComment: true });
      expect(component.ratingConsistencyResult.severity).toBe('warning');
    });
  });
});
