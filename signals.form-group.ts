<div class="crf-mat-expansion-content">
  <mat-card class="crf-mat-expansion-content-card">
    <mat-card-content>
      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversClosingDateLabel">Date de clôture</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="closingDatePicker"
              [formControl]="operationForm.controls.closingDate"
              placeholder="Date de clôture"
              i18n-placeholder="@@financialDriversClosingDateLabel"
              aria-required="true"
            />
            <mat-datepicker-toggle matIconSuffix [for]="closingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #closingDatePicker></mat-datepicker>
          </mat-form-field>
        </div>

        @if (
          (operationForm.controls.closingDate.touched || validationInProgress()) &&
          operationForm.controls.closingDate.errors &&
          operationForm.controls.closingDate.errors['financialDriversClosingDateRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }

        @if (
          (operationForm.controls.closingDate.touched || validationInProgress()) &&
          operationForm.controls.closingDate.errors &&
          operationForm.controls.closingDate.errors['financialDriversClosingDate21Months']
        ) {
          <div class="field-error-container" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div>
        }
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversSeniorGrossFinancialDebtLabel">
          Dette Financière Brute Senior
        </div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(operationForm.get('seniorGrossFinancialDebt'))"
            [formFieldLabel]="'financialDriversSeniorGrossFinancialDebtPlaceholder'"
            [placeholderKey]="'financialDriversSeniorGrossFinancialDebtPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="reference-currency-column">
            <div class="reference-currency-row">
              <div class="reference-currency-item">
                <bnpp-workflow-select-list
                  [placeholder]="'financialDriversUnitPlaceholder'"
                  [itemsList]="referenceCurrencyUnitList"
                  [colorTheme]="'RATING_THEME'"
                  [selectControl]="$any(operationForm.get('unit'))"
                ></bnpp-workflow-select-list>
              </div>
            </div>
          </div>
        </div>

        <div class="row-content">
          <bnpp-workflow-autocomplete
            class="w-100"
            [placeholder]="'financialDriversCurrencyPlaceholder'"
            [itemsList]="filteredCurrencyList()"
            [autocompleteControl]="$any(operationForm.get('currency'))"
            [inputChangedValueEvent]="onSearchCurrencies($event)"
            [colorTheme]="'RATING_THEME'"
          ></bnpp-workflow-autocomplete>
        </div>

        @if (
          (operationForm.controls.unit.touched || validationInProgress()) &&
          operationForm.controls.unit.errors &&
          operationForm.controls.unit.errors['financialDriversUnitRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }

        @if (
          (operationForm.controls.currency.touched || validationInProgress()) &&
          operationForm.controls.currency.errors &&
          operationForm.controls.currency.errors['financialDriversCurrencyRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }
      </div>

      @for (field of manualFields(); track field.key) {
        <div class="row-item fade-in">
          <div class="row-label">
            <span>{{ field.label }}</span>
          </div>

          <div class="row-content">
            <bnpp-workflow-input
              class="w-100"
              [formControl]="$any(getControl(field.key))"
              [formFieldLabel]="field.placeholder"
              [placeholderKey]="field.placeholder"
              [inputType]="'number'"
            ></bnpp-workflow-input>
          </div>

          <div class="row-content">
            <div class="data-container readonly-meta-container">
              <span class="data-text" i18n="@@financialDriversUnitLabel">Unité</span>
              <span class="text-capitalize data-indicator">
                {{ selectedUnitLabel() }}
              </span>
            </div>
          </div>

          <div class="row-content">
            <div class="data-container readonly-meta-container">
              <span class="data-text" i18n="@@financialDriversCurrencyLabel">Devise</span>
              <span class="text-capitalize data-indicator">
                {{ selectedCurrencyLabel() }}
              </span>
            </div>
          </div>
        </div>

        @if (
          field.positiveErrorKey &&
          (getControl(field.key).touched || validationInProgress()) &&
          getControl(field.key).errors &&
          getControl(field.key).errors![field.positiveErrorKey]
        ) {
          <div class="field-error-container" i18n="@@positiveValueMessage">
            Ce champ doit être une valeur positive
          </div>
        }
      }

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@dataLabel">Data</div>

        <div class="row-content">
          <div class="data-container">
            <span class="data-text" i18n="@@financialDriversDebtToEquityFormulaLabel">
              Dette sur Capitaux Propres = (Dette Financière Brute Senior + Dette Financière Brute
              Junior/Mezzanine) / (Fonds Propres + Quasi-fonds Propres)
            </span>

            @if (isComputing()) {
              <bnpp-progress-pulse-loader></bnpp-progress-pulse-loader>
            } @else {
              <span class="text-capitalize data-indicator">
                {{ debtToEquityDisplay() || '/' }}
              </span>
            }
          </div>
        </div>

        <div class="row-content">
          <div class="data-container">
            <!-- ADDED: formula changes depending on AMORTIZING or BULLET -->
            @if (isAmortizing()) {
              <span class="data-text" i18n="@@financialDriversDscrFormulaLabel">
                Debt-Service Coverage Ratio (DSCR) = CFADS / (Principal Paid + Interest Expense)
              </span>
            } @else {
              <span class="data-text" i18n="@@financialDriversIcrFormulaLabel">
                Interest Coverage Ratio (ICR) = (EBITDA - Maintenance Capex - Tax Payments) /
                Interest Expenses
              </span>
            }

            @if (isComputing()) {
              <bnpp-progress-pulse-loader></bnpp-progress-pulse-loader>
            } @else {
              <span class="text-capitalize data-indicator">
                {{ secondaryRatioDisplay() || '/' }}
              </span>
            }
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityLabel">
          Debt to Equity ajusté (si nécessaire)
        </div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(operationForm.get('adjustedDebtToEquity'))"
            [formFieldLabel]="'financialDriversAdjustedDebtToEquityPlaceholder'"
            [placeholderKey]="'financialDriversAdjustedDebtToEquityPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text" i18n="@@financialDriversUnitLabel">Unité</span>
            <span class="text-capitalize data-indicator">
              {{ selectedUnitLabel() }}
            </span>
          </div>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text" i18n="@@financialDriversCurrencyLabel">Devise</span>
            <span class="text-capitalize data-indicator">
              {{ selectedCurrencyLabel() }}
            </span>
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversClosingDateOfAdjustedDebtToEquityLabel">
          Date de clôture du Debt to Equity ajusté
        </div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="adjustedDebtToEquityDatePicker"
              [formControl]="operationForm.controls.adjustedDebtToEquityClosingDate"
              [placeholder]="'financialDriversAdjustedDebtToEquityClosingDatePlaceholder'"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="adjustedDebtToEquityDatePicker"
            ></mat-datepicker-toggle>
            <mat-datepicker #adjustedDebtToEquityDatePicker></mat-datepicker>
          </mat-form-field>
        </div>

        @if (
          (operationForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
          operationForm.controls.adjustedDebtToEquityClosingDate.errors &&
          operationForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquityClosingDateRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }

        @if (
          (operationForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
          operationForm.controls.adjustedDebtToEquityClosingDate.errors &&
          operationForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquity21Months']
        ) {
          <div class="field-error-container" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div>
        }
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversCommentInCaseOfAdjustedDebtToEquityLabel">
          Commentaire en cas de Debt to Equity ajusté
        </div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100">
            <textarea
              matInput
              rows="3"
              [formControl]="operationForm.controls.adjustedDebtToEquityComment"
              [placeholder]="'financialDriversAdjustedDebtToEquityCommentPlaceholder'"
            ></textarea>
          </mat-form-field>
        </div>

        @if (
          (operationForm.controls.adjustedDebtToEquityComment.touched || validationInProgress()) &&
          operationForm.controls.adjustedDebtToEquityComment.errors &&
          operationForm.controls.adjustedDebtToEquityComment.errors['financialDriversAdjustedDebtToEquityCommentRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversAdjustedDSCRICRLabel">
          DSCR/ICR ajusté (si nécessaire)
        </div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(operationForm.get('adjustedDscrIcr'))"
            [formFieldLabel]="'financialDriversAdjustedDscrIcrPlaceholder'"
            [placeholderKey]="'financialDriversAdjustedDscrIcrPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text" i18n="@@financialDriversUnitLabel">Unité</span>
            <span class="text-capitalize data-indicator">
              {{ selectedUnitLabel() }}
            </span>
          </div>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text" i18n="@@financialDriversCurrencyLabel">Devise</span>
            <span class="text-capitalize data-indicator">
              {{ selectedCurrencyLabel() }}
            </span>
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversClosingDateOfAdjustedDSCRICRLabel">
          Date d’arrêté de DSCR/ICR override
        </div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="adjustedDscrIcrDatePicker"
              [formControl]="operationForm.controls.adjustedDscrIcrClosingDate"
              [placeholder]="'financialDriversAdjustedDscrIcrClosingDatePlaceholder'"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="adjustedDscrIcrDatePicker"
            ></mat-datepicker-toggle>
            <mat-datepicker #adjustedDscrIcrDatePicker></mat-datepicker>
          </mat-form-field>
        </div>

        @if (
          (operationForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
          operationForm.controls.adjustedDscrIcrClosingDate.errors &&
          operationForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcrClosingDateRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }

        @if (
          (operationForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
          operationForm.controls.adjustedDscrIcrClosingDate.errors &&
          operationForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcr21Months']
        ) {
          <div class="field-error-container" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div>
        }
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@financialDriversCommentInCaseOfAdjustedDSCRICRLabel">
          Commentaire en cas d’ajustement DSCR/ICR
        </div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100">
            <textarea
              matInput
              rows="3"
              [formControl]="operationForm.controls.adjustedDscrIcrComment"
              [placeholder]="'financialDriversAdjustedDscrIcrCommentPlaceholder'"
            ></textarea>
          </mat-form-field>
        </div>

        @if (
          (operationForm.controls.adjustedDscrIcrComment.touched || validationInProgress()) &&
          operationForm.controls.adjustedDscrIcrComment.errors &&
          operationForm.controls.adjustedDscrIcrComment.errors['financialDriversAdjustedDscrIcrCommentRequired']
        ) {
          <div class="field-error-container" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
        }
      </div>

      <div class="row-item fade-in">
        <div class="row-label" i18n="@@dataLabel">Data</div>

        <div class="row-content">
          <div class="reference-currency-column">
            <div class="reference-currency-row">
              <div class="reference-currency-item">
                <bnpp-workflow-select-list
                  [placeholder]="'financialDriversLiquidityRiskPlaceholder'"
                  [itemsList]="liquidityRiskList"
                  [colorTheme]="'RATING_THEME'"
                  [selectControl]="$any(operationForm.get('liquidityRisk'))"
                ></bnpp-workflow-select-list>
              </div>
            </div>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>
