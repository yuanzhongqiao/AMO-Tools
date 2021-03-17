import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { AeratorPerformanceData, WasteWater, WasteWaterData } from '../../../../shared/models/waste-water';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from '../../../aerator-performance-form/aerator-performance-form.service';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-explore-aerator-form',
  templateUrl: './explore-aerator-form.component.html',
  styleUrls: ['./explore-aerator-form.component.css']
})
export class ExploreAeratorFormComponent implements OnInit {

  baselineForm: FormGroup;
  modificationForm: FormGroup;
  modificationData: WasteWaterData;
  baselineData: WasteWaterData;
  selectedModificationIdSub: Subscription;
  baselineWarnings: AeratorPerformanceWarnings;
  modificationWarnings: AeratorPerformanceWarnings;
  selectedModificationId: string;
  settings: Settings;
  showDOAlert: boolean = false;
  showOperatingTimeAlert: boolean = false;
  showSpeedAlert: boolean = false;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    this.baselineData = this.wasteWaterService.wasteWater.getValue().baselineData;
    this.baselineForm = this.aeratorPerformanceFormService.getFormFromObj(this.baselineData.aeratorPerformanceData);
    this.baselineWarnings = this.aeratorPerformanceFormService.checkWarnings(this.baselineData.aeratorPerformanceData);
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if (val) {
        this.selectedModificationId = val;
        this.modificationData = this.wasteWaterService.getModificationFromId();
        this.modificationForm = this.aeratorPerformanceFormService.getFormFromObj(this.modificationData.aeratorPerformanceData);
        this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(this.modificationData.aeratorPerformanceData);
        this.initExploreAearatorPerformance();
        this.initExploreReduceOxygen();
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  initExploreAearatorPerformance() {
    let hasOpportunity: boolean = (this.modificationData.aeratorPerformanceData.OperatingTime != this.baselineData.aeratorPerformanceData.OperatingTime ||
      this.modificationData.aeratorPerformanceData.Aeration != this.baselineData.aeratorPerformanceData.Aeration ||
      this.modificationData.aeratorPerformanceData.Speed != this.baselineData.aeratorPerformanceData.Speed);
    this.modificationData.exploreAeratorPerformance = { display: 'Modify Aerator Performance', hasOpportunity: hasOpportunity }
  }

  initExploreReduceOxygen() {
    let hasOpportunity: boolean = (this.modificationData.aeratorPerformanceData.OperatingDO != this.baselineData.aeratorPerformanceData.OperatingDO);
    this.modificationData.exploreReduceOxygen = { display: ' Reduce Supplied O<sub>2</sub>', hasOpportunity: hasOpportunity }
  }

  setExploreAeratorPerformance() {
    if (this.modificationData.exploreAeratorPerformance.hasOpportunity == false) {
      this.modificationForm.controls.OperatingTime.patchValue(this.modificationForm.controls.OperatingTime.value);
      this.modificationForm.controls.Aeration.patchValue(this.modificationForm.controls.Aeration.value);
      this.modificationForm.controls.Speed.patchValue(this.modificationForm.controls.Speed.value);
      this.save();
    }
  }

  setExploreReduceOxygen() {
    if (this.modificationData.exploreReduceOxygen.hasOpportunity == false) {
      this.modificationForm.controls.OperatingDO.patchValue(this.modificationForm.controls.OperatingDO.value);
      this.save();
    }
  }

  focusField(str: string) {
    this.wasteWaterService.modifyConditionsTab.next('aerator-performance');
    this.wasteWaterService.focusedField.next(str);
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let aeratorPerformanceData: AeratorPerformanceData = this.aeratorPerformanceFormService.getObjFromForm(this.modificationForm);
    this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    wasteWater.modifications[modificationIndex].aeratorPerformanceData = aeratorPerformanceData;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }


  calculateDO() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    let optimalDo: number = this.wasteWaterService.calculateModDo(modificationIndex);
    if (optimalDo == this.modificationForm.controls.OperatingDO.value) {
      this.showDOAlert = true;
      setTimeout(() => {
        this.showDOAlert = false;
      }, 1500);
    } else {
      this.modificationForm.controls.OperatingDO.patchValue(optimalDo);
      this.save();
    }
  }

  calculateOperatingTime() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    let optimalOperatingTime: number = this.wasteWaterService.calculateModOperatingTime(modificationIndex);
    if (optimalOperatingTime == this.modificationForm.controls.OperatingTime.value) {
      this.showOperatingTimeAlert = true;
      setTimeout(() => {
        this.showOperatingTimeAlert = false;
      }, 1500);
    } else {
      this.modificationForm.controls.OperatingTime.patchValue(optimalOperatingTime);
      this.save();
    }
  }
  calculateSpeed() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    let optimalSpeed: number = this.wasteWaterService.calculateModSpeed(modificationIndex);
    if (optimalSpeed == this.modificationForm.controls.Speed.value) {
      this.showSpeedAlert = true;
      setTimeout(() => {
        this.showSpeedAlert = false;
      }, 1500);
    } else {
      this.modificationForm.controls.Speed.patchValue(optimalSpeed);
      this.save();
    }
  }

}
