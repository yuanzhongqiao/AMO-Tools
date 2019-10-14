import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs } from '../system-and-equipment-curve.service';

@Injectable()
export class EquipmentCurveService {


  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
  }

  //equipment curve
  getEquipmentCurveFormFromObj(obj: EquipmentInputs): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      measurementOption: [obj.measurementOption, Validators.required],
      baselineMeasurement: [obj.baselineMeasurement, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: [obj.modificationMeasurementOption, Validators.required],
      modifiedMeasurement: [obj.modifiedMeasurement, [Validators.required, Validators.min(0)]],
    });
    form.controls.modificationMeasurementOption.disable();
    form = this.setModifiedMeasurementMinMax(form);
    return form;
  }

  getEquipmentCurveDefault(): EquipmentInputs {
    return {
      measurementOption: 1,
      baselineMeasurement: 1800,
      modificationMeasurementOption: 1,
      modifiedMeasurement: 1800,
    }
  }

  getEquipmentCurveObjFromForm(form: FormGroup): EquipmentInputs {
    return {
      measurementOption: form.controls.measurementOption.value,
      baselineMeasurement: form.controls.baselineMeasurement.value,
      modificationMeasurementOption: form.controls.modificationMeasurementOption.value,
      modifiedMeasurement: form.controls.modifiedMeasurement.value
    }
  }

  setModifiedMeasurementMinMax(form: FormGroup): FormGroup {
    if (form.controls.baselineMeasurement.value) {
      let min: number = form.controls.baselineMeasurement.value * .5;
      let max: number = form.controls.baselineMeasurement.value * 1.5;
      form.controls.modifiedMeasurement.setValidators([Validators.required, Validators.min(min), Validators.max(max)]);
      form.controls.modifiedMeasurement.updateValueAndValidity();
      return form;
    } else {
      return form;
    }

  }

  //by equation
  getByEquationFormFromObj(obj: ByEquationInputs): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      maxFlow: [obj.maxFlow, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      equationOrder: [obj.equationOrder, Validators.required],
      constant: [obj.constant, [Validators.required, Validators.min(0)]],
      flow: [obj.flow, Validators.required],
      flowTwo: [obj.flowTwo, Validators.required],
      flowThree: [obj.flowThree, Validators.required],
      flowFour: [obj.flowFour, Validators.required],
      flowFive: [obj.flowFive, Validators.required],
      flowSix: [obj.flowSix, Validators.required]
    });
    return form;
  }

  getByEquationDefault(flowUnit: string, distanceUnit: string): ByEquationInputs {
    let tmpMaxFlow = 1020;
    let tmpConstant = 356.96;
    if (flowUnit !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(flowUnit) * 100) / 100;
    }
    if (distanceUnit !== 'ft') {
      tmpConstant = Math.round(this.convertUnitsService.value(tmpConstant).from('ft').to(distanceUnit) * 100) / 100;
    }
    return {
      maxFlow: tmpMaxFlow,
      equationOrder: 3,
      constant: tmpConstant,
      flow: -0.0686,
      flowTwo: 0.000005,
      flowThree: -0.00000008,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0
    }
  }

  getByEquationObjFromForm(form: FormGroup): ByEquationInputs {
    return {
      maxFlow: form.controls.maxFlow.value,
      equationOrder: form.controls.equationOrder.value,
      constant: form.controls.constant.value,
      flow: form.controls.flow.value,
      flowTwo: form.controls.flowTwo.value,
      flowThree: form.controls.flowThree.value,
      flowFour: form.controls.flowFour.value,
      flowFive: form.controls.flowFive.value,
      flowSix: form.controls.flowSix.value
    }
  }

  //by data
  getByDataDefault(settings: Settings): ByDataInputs {
    let tmpMaxFlow = 1020;
    let tmpFlow1 = 100;
    let tmpFlow2 = 630;
    let tmpFlow3 = 1020;
    let yValue0 = 355;
    let yValue1 = 351;
    let yValue2 = 294;
    let yValue3 = 202;
    let yValueConstant = 356.96;
    if (settings.flowMeasurement !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow1 = Math.round(this.convertUnitsService.value(tmpFlow1).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow2 = Math.round(this.convertUnitsService.value(tmpFlow2).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      tmpFlow3 = Math.round(this.convertUnitsService.value(tmpFlow3).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (settings.distanceMeasurement !== 'ft') {
      yValueConstant = Math.round(this.convertUnitsService.value(yValueConstant).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue0 = Math.round(this.convertUnitsService.value(yValue0).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue1 = Math.round(this.convertUnitsService.value(yValue1).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue2 = Math.round(this.convertUnitsService.value(yValue2).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      yValue3 = Math.round(this.convertUnitsService.value(yValue3).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }
    return {
      dataRows: [
        { flow: 0, yValue: yValue0 },
        { flow: tmpFlow1, yValue: yValue1 },
        // { flow: 200, head: 343.6188 },
        // { flow: 300, head: 335.9542 },
        // { flow: 400, head: 324.9089 },
        // { flow: 480, head: 314.7216 },
        // { flow: 560, head: 304.5332 },
        { flow: tmpFlow2, yValue: yValue2 },
        // { flow: 690, head: 284.1775 },
        // { flow: 800, head: 264.6842 },
        // { flow: 900, head: 241.8114 },
        // { flow: 970, head: 222.3425 },
        { flow: tmpFlow3, yValue: yValue3 }
      ],
      dataOrder: 3
    }
  }

  getByDataFormFromObj(inputObj: ByDataInputs): FormGroup {
    let tmpFormArray: FormArray = new FormArray([]);
    if (inputObj.dataRows !== undefined && inputObj.dataRows !== null) {
      //iterate through dataRows and create controls for them
      inputObj.dataRows.forEach(dataRow => {
        let tmpDataRowForm = this.formBuilder.group({
          flow: [dataRow.flow, [Validators.required, Validators.max(1000000)]],
          yValue: [dataRow.yValue, [Validators.required, Validators.min(0)]]
        });
        tmpFormArray.push(tmpDataRowForm);
      });
    }

    let tmpForm: FormGroup = this.formBuilder.group({
      dataRows: [tmpFormArray],
      dataOrder: [inputObj.dataOrder, Validators.required]
    });
    return tmpForm;
  }

  getByDataObjFromForm(form: FormGroup): ByDataInputs {
    let tmpFormArray: FormArray = form.controls.dataRows.value;
    let dataRows: Array<{ flow: number, yValue: number }> = tmpFormArray.value;
    return {
      dataRows: dataRows,
      dataOrder: form.controls.dataOrder.value
    }
  }
}

