import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperatingHours } from '../models/operations';

@Injectable()
export class OperatingHoursModalService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: OperatingHours): FormGroup {
    return this.formBuilder.group(
      {
        'weeksPerYear': [obj.weeksPerYear, [Validators.min(0), Validators.max(52), Validators.required]],
        'daysPerWeek': [obj.daysPerWeek, [Validators.min(0), Validators.max(7), Validators.required]],
        'hoursPerDay': [obj.hoursPerDay, [Validators.min(0), Validators.max(24), Validators.required]],
        'minutesPerHour': [obj.minutesPerHour, [Validators.min(0), Validators.max(60), Validators.required]],
        'secondsPerMinute': [obj.secondsPerMinute, [Validators.min(0), Validators.max(60), Validators.required]]
      }
    )
  }

  getObjectFromForm(form: FormGroup): OperatingHours {
    let opHours: OperatingHours = {
      weeksPerYear: form.controls.weeksPerYear.value,
      daysPerWeek: form.controls.daysPerWeek.value,
      hoursPerDay: form.controls.hoursPerDay.value,
      minutesPerHour: form.controls.minutesPerHour.value,
      secondsPerMinute: form.controls.secondsPerMinute.value,
    }
    opHours.hoursPerYear = this.calculateHoursPerYear(opHours);
    return opHours;
  }

  calculateHoursPerYear(opHours: OperatingHours): number {
    return opHours.daysPerWeek * opHours.hoursPerDay * opHours.minutesPerHour * opHours.weeksPerYear;
  }
}
