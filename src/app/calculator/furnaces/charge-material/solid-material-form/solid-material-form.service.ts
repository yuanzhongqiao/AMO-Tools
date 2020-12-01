import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, SolidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class SolidMaterialFormService {

  constructor(private formBuilder: FormBuilder) { }

  initSolidForm(assesmentLossNum?: number): FormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 0;
    
    let formGroup = this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeatOfSolidMaterial': ['', [Validators.required, Validators.min(0)]],
      'materialLatentHeatOfFusion': ['', [Validators.required, Validators.min(0)]],
      'materialHeatOfLiquid': ['', [Validators.required, Validators.min(0)]],
      'materialMeltingPoint': ['', Validators.required],
      'feedRate': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'waterContentAsCharged': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'waterContentAsDischarged': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'initialTemperature': ['', Validators.required],
      'chargeMaterialDischargeTemperature': ['', Validators.required],
      'waterVaporDischargeTemperature': [0, Validators.required],
      'percentChargeMelted': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'percentChargeReacted': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [0, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': ['Endothermic', Validators.required],
      'additionalHeatRequired': [0, Validators.required],
      'name': ['Material #' + lossNumber]
    });

    if (!assesmentLossNum) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required,  GreaterThanValidator.greaterThan(0), Validators.max(100)]));
    }

    return formGroup;
  }

  getSolidChargeMaterialForm(chargeMaterial: ChargeMaterial, inAssessment: boolean): FormGroup {
    let reactionType = 'Endothermic';
    if (chargeMaterial.solidChargeMaterial.thermicReactionType !== 0) {
      reactionType = 'Exothermic';
    }
    //FUEL FIRED SOLID
    let formGroup = this.formBuilder.group({
      'materialId': [chargeMaterial.solidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatOfSolidMaterial': [chargeMaterial.solidChargeMaterial.specificHeatSolid, [Validators.required, Validators.min(0)]],
      'materialLatentHeatOfFusion': [chargeMaterial.solidChargeMaterial.latentHeat, [Validators.required, Validators.min(0)]],
      'materialHeatOfLiquid': [chargeMaterial.solidChargeMaterial.specificHeatLiquid, [Validators.required, Validators.min(0)]],
      'materialMeltingPoint': [chargeMaterial.solidChargeMaterial.meltingPoint, Validators.required],
      'feedRate': [chargeMaterial.solidChargeMaterial.chargeFeedRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'waterContentAsCharged': [chargeMaterial.solidChargeMaterial.waterContentCharged, [Validators.required, Validators.min(0), Validators.max(100)]],
      'waterContentAsDischarged': [chargeMaterial.solidChargeMaterial.waterContentDischarged, [Validators.required, Validators.min(0), Validators.max(100)]],
      'initialTemperature': [chargeMaterial.solidChargeMaterial.initialTemperature, Validators.required],
      'chargeMaterialDischargeTemperature': [chargeMaterial.solidChargeMaterial.dischargeTemperature, Validators.required],
      'waterVaporDischargeTemperature': [chargeMaterial.solidChargeMaterial.waterVaporDischargeTemperature, Validators.required],
      'percentChargeMelted': [chargeMaterial.solidChargeMaterial.chargeMelted, [Validators.required, Validators.min(0), Validators.max(100)]],
      'percentChargeReacted': [chargeMaterial.solidChargeMaterial.chargeReacted, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [chargeMaterial.solidChargeMaterial.reactionHeat, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.solidChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
    }

    formGroup = this.setInitialTempValidator(formGroup);
    return formGroup;
  }

  setInitialTempValidator(formGroup: FormGroup) {
    let dischargeTemperature = formGroup.controls.chargeMaterialDischargeTemperature.value;
    if (dischargeTemperature) {
      formGroup.controls.initialTemperature.setValidators([Validators.required, Validators.max(dischargeTemperature)]);
      formGroup.controls.initialTemperature.markAsDirty();
      formGroup.controls.initialTemperature.updateValueAndValidity();
    }
    debugger;
    return formGroup;
}


  buildSolidChargeMaterial(solidForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (solidForm.controls.endothermicOrExothermic.value === 'Exothermic') {
      reactionType = 1;
    }
    let tmpSolidMaterial: ChargeMaterial = {
      name: solidForm.controls.name.value,
      chargeMaterialType: 'Solid',
      solidChargeMaterial: {
        materialId: solidForm.controls.materialId.value,
        thermicReactionType: reactionType,
        specificHeatSolid: solidForm.controls.materialSpecificHeatOfSolidMaterial.value,
        latentHeat: solidForm.controls.materialLatentHeatOfFusion.value,
        specificHeatLiquid: solidForm.controls.materialHeatOfLiquid.value,
        meltingPoint: solidForm.controls.materialMeltingPoint.value,
        chargeFeedRate: solidForm.controls.feedRate.value,
        waterContentCharged: solidForm.controls.waterContentAsCharged.value,
        waterContentDischarged: solidForm.controls.waterContentAsDischarged.value,
        initialTemperature: solidForm.controls.initialTemperature.value,
        dischargeTemperature: solidForm.controls.chargeMaterialDischargeTemperature.value,
        waterVaporDischargeTemperature: solidForm.controls.waterVaporDischargeTemperature.value,
        chargeMelted: solidForm.controls.percentChargeMelted.value,
        chargeReacted: solidForm.controls.percentChargeReacted.value,
        reactionHeat: solidForm.controls.heatOfReaction.value,
        additionalHeat: solidForm.controls.additionalHeatRequired.value,
        availableHeat: solidForm.controls.availableHeat? solidForm.controls.availableHeat.value : '',
      }
    };
    return tmpSolidMaterial;
  }

  checkSolidWarnings(material: SolidChargeMaterial): SolidMaterialWarnings {
    return {
      dischargeTempWarning: this.checkDischargeTemperature(material),
      initialOverMeltWarning: this.checkInitialOverMelting(material)
    };
  }

  checkDischargeTemperature(material: SolidChargeMaterial): string {
    if ((material.dischargeTemperature > material.meltingPoint) && material.chargeMelted === 0) {
      return 'The discharge temperature is higher than the melting point, please enter proper percentage for charge melted.';
    } else if ((material.dischargeTemperature < material.meltingPoint) && material.chargeMelted > 0) {
      return 'The discharge temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    } else {
      return null;
    }
  }

  checkInitialOverMelting(material: SolidChargeMaterial): string {
    if (material.initialTemperature > material.meltingPoint && material.chargeMelted <= 0) {
      return "The initial temperature is higher than the melting point, please enter proper percentage for charge melted.";
    }
    else if ((material.initialTemperature < material.meltingPoint) && material.chargeMelted > 0){
      return 'The initial temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    } else {
      return null;
    }
  }

}

export interface SolidMaterialWarnings {
  dischargeTempWarning: string;
  initialOverMeltWarning: string;
}
