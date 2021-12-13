import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { eGridRegion } from '../../calculator/utilities/co2-savings/co2-savings-form/electricityGridRegions';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import * as _ from 'lodash';
import { AssessmentCo2SavingsService } from './assessment-co2-savings.service';
import { FormGroup } from '@angular/forms';
import { EGridService, SubRegionData, SubregionEmissions } from '../helper-services/e-grid.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assessment-co2-savings',
  templateUrl: './assessment-co2-savings.component.html',
  styleUrls: ['./assessment-co2-savings.component.css']
})
export class AssessmentCo2SavingsComponent implements OnInit {
  @Input()
  co2SavingsData: Co2SavingsData;
  @Input()
  isFormDisabled: boolean;
  @Input()
  inBaseline: boolean;
  @Input()
  currentField: string;
  @Output('emitUpdateCo2SavingsData')
  emitUpdateCo2SavingsData = new EventEmitter<Co2SavingsData>();
  @Output('emitCurrentField')
  emitCurrentField = new EventEmitter<string>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();


  form: FormGroup;
  hasValidSubRegion: boolean;
  subregions: Array<{
    subregion: string,
    outputRate: number
  }>;
  zipCodeSubRegionData: Array<string>;
  co2SavingsDataSub: Subscription;
  constructor(private assessmentCo2Service: AssessmentCo2SavingsService, private egridService: EGridService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initCo2SavingsSubscription();
  }
  
  ngOnDestroy() {
    this.assessmentCo2Service.baselineCo2SavingsData.next(undefined);
    this.assessmentCo2Service.modificationCo2SavingsData.next(undefined);
    this.co2SavingsDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isFormDisabled && !changes.isFormDisabled.firstChange) {
      if (this.isFormDisabled) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      this.cd.detectChanges();
    }
  }

  initCo2SavingsSubscription() {
    // Use subscriptions to asynchronous data changes when both BL and MOD forms are open
    if (this.inBaseline) {
      this.assessmentCo2Service.baselineCo2SavingsData.next(this.co2SavingsData);
      this.co2SavingsDataSub = this.assessmentCo2Service.baselineCo2SavingsData.subscribe(baselineCo2SavingsData => {
        if (baselineCo2SavingsData) {
          this.co2SavingsData = baselineCo2SavingsData
          this.initForm();
        }
      });
    } else {
      this.assessmentCo2Service.modificationCo2SavingsData.next(this.co2SavingsData);
      this.co2SavingsDataSub = this.assessmentCo2Service.modificationCo2SavingsData.subscribe(modificationCo2SavingsData => {
        if (modificationCo2SavingsData) {
          this.co2SavingsData = modificationCo2SavingsData
          this.initForm();
        }
      });
    }
  }

  disableForm() {
    this.form.controls.eGridSubregion.disable();
    this.form.controls.zipcode.disable();
    this.form.controls.totalEmissionOutputRate.disable();
  }

  enableForm() {
    if (this.inBaseline) {
      this.form.controls.eGridSubregion.enable();
      this.form.controls.zipcode.enable();
    }
    this.form.controls.totalEmissionOutputRate.enable();
  }

  initForm() {
    this.form = this.assessmentCo2Service.getEmissionsForm(this.co2SavingsData);
    this.form.controls.energyType.disable();
    
    // Regions are the same for Mod
    if (!this.inBaseline) {
      this.form.controls.zipcode.disable();
      this.form.controls.eGridSubregion.disable();
    }

    if (this.isFormDisabled) {
      this.disableForm()
    };

    this.setSubRegionData();
  }

  // focusField(str: string = 'co2Savings') {
  //   this.emitCurrentField.emit(str);
  // }
  focusField(str: string) {
    this.emitCurrentField.emit('co2Savings');
    // this.emitChangeField.emit(str);
  }

  setUserEmissionsOutput() {
    if (this.inBaseline) {
      this.form.controls.userEnteredBaselineEmissions.patchValue(true);
    } else {
      this.form.controls.userEnteredModificationEmissions.patchValue(true);
    }
    this.calculate();
  }

  setZipcode() {
    this.form.controls.userEnteredBaselineEmissions.patchValue(false);
    this.setUserEnteredModificationEmissions(false);
    this.setSubRegionData();
  }

  setUserEnteredModificationEmissions(isUserEnteredValue: boolean) {
    let modificationCo2SavingsData: Co2SavingsData = this.assessmentCo2Service.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData) {
      modificationCo2SavingsData.userEnteredModificationEmissions = isUserEnteredValue;
      this.assessmentCo2Service.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }

  setSubRegionData() {
    this.zipCodeSubRegionData = [];

    let subRegionData: SubRegionData = _.find(this.egridService.subRegionsByZipcode, (val) => this.form.controls.zipcode.value === val.zip);
    if (subRegionData) {
      subRegionData.subregions.forEach(subregion => {
        if (subregion !== '') {
          this.zipCodeSubRegionData.push(subregion);
        }
      });
      if (this.inBaseline) {
        this.setBaselineSubregionForm();
      } else {
        this.setModificationSubregionForm()
      }
    } else {
      // not a valid zip, form select is hidden, disabled
      this.form.controls.eGridSubregion.disable();
      this.form.controls.totalEmissionOutputRate.patchValue(null);
      this.form.controls.eGridSubregion.patchValue(null);
    }
    this.calculate();
  }

  setBaselineSubregionForm() {
      if (this.form.controls.eGridSubregion.value === null) {
        // set the first from the subregion list as default
        this.form.controls.eGridSubregion.patchValue(this.zipCodeSubRegionData[0]);
      }
      this.hasValidSubRegion = true;

      this.setSubregionControlStatus();
      if (!this.form.controls.userEnteredBaselineEmissions.value) {
        this.setSubRegionEmissionsOutput();
      }
  }

  setModificationSubregionForm() {
    // set selected baseline subregion value
    this.form.controls.eGridSubregion.patchValue(this.co2SavingsData.eGridSubregion);
    this.hasValidSubRegion = true;
    this.setSubregionControlStatus();

    if (!this.form.controls.userEnteredModificationEmissions.value) {
      this.setSubRegionEmissionsOutput();
    }
  }

  setSubregionControlStatus() {
    if (this.zipCodeSubRegionData.length === 0) {
      // none found - form select is hidden, set form val to null
      this.form.controls.eGridSubregion.disable();
      this.form.controls.eGridSubregion.patchValue(null);
    } else if (this.zipCodeSubRegionData.length === 1) {
      // if only one result, no need to choose from select list
      this.form.controls.eGridSubregion.disable();
    } else if (this.inBaseline && !this.isFormDisabled) {
      this.form.controls.eGridSubregion.enable();
    }
    this.cd.detectChanges();
  }

  setSubRegionEmissionsOutput() {
    // setting default, so mod should not be user entered
    if (!this.inBaseline) {
      this.form.controls.userEnteredModificationEmissions.patchValue(false);
    } else {
      this.setUserEnteredModificationEmissions(false);
    }

    let subregionEmissions: SubregionEmissions = _.find(this.egridService.co2Emissions, (val) => { return this.form.controls.eGridSubregion.value === val.subregion; });
    if (subregionEmissions) {
      this.form.patchValue({
        totalEmissionOutputRate: subregionEmissions.co2Emissions
      });
      this.calculate();
    }
  }

  setLockedModificationValues() {
    let modificationCo2SavingsData: Co2SavingsData = this.assessmentCo2Service.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData) {
      modificationCo2SavingsData.eGridSubregion = this.co2SavingsData.eGridSubregion;
      modificationCo2SavingsData.zipcode = this.co2SavingsData.zipcode;
      this.assessmentCo2Service.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }
  
  calculate() {
    this.co2SavingsData = this.assessmentCo2Service.getCo2SavingsData(this.form);
    if (this.inBaseline) {
      this.setLockedModificationValues();
    }
    // emit results up to parent component  to save on the ssmt/psat/fsat/etc object
    this.emitUpdateCo2SavingsData.emit(this.co2SavingsData);
  }
}
