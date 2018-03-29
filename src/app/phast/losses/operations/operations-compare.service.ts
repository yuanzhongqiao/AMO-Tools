import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OperatingHours, OperatingCosts, PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class OperationsCompareService {

  baseline: PHAST;
  modification: PHAST;

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    return this.compareLoss();
  }

  compareLoss(): boolean {
    return (
      this.compareWeeksPerYear() ||
      this.compareDaysPerWeek() ||
      this.compareShiftsPerDay() ||
      this.compareHoursPerShift() ||
      this.compareHoursPerYear() ||
      this.compareFuelCost() ||
      this.compareSteamCost() ||
      this.compareElectricityCost()
    )
  }

  compareWeeksPerYear(): boolean {
    return this.compare(this.baseline.operatingHours.weeksPerYear, this.modification.operatingHours.weeksPerYear);
  }
  compareDaysPerWeek(): boolean {
    return this.compare(this.baseline.operatingHours.daysPerWeek, this.modification.operatingHours.daysPerWeek);
  }
  compareShiftsPerDay(): boolean {
    return this.compare(this.baseline.operatingHours.shiftsPerDay, this.modification.operatingHours.shiftsPerDay);
  }
  compareHoursPerShift(): boolean {
    return this.compare(this.baseline.operatingHours.hoursPerShift, this.modification.operatingHours.hoursPerShift);
  }
  compareHoursPerYear(): boolean {
    return this.compare(this.baseline.operatingHours.hoursPerYear, this.modification.operatingHours.hoursPerYear);
  }
  compareFuelCost(): boolean {
    return this.compare(this.baseline.operatingCosts.fuelCost, this.modification.operatingCosts.fuelCost);
  }
  compareSteamCost(): boolean {
    return this.compare(this.baseline.operatingCosts.steamCost, this.modification.operatingCosts.steamCost);
  }
  compareElectricityCost(): boolean {
    return this.compare(this.baseline.operatingCosts.electricityCost, this.modification.operatingCosts.electricityCost);
  }

  compare(a: any, b: any) {
    //if both exist
    if (a && b) {
      //compare
      if (a != b) {
        //not equal
        return true;
      } else {
        //equal
        return false;
      }
    }
    //check one exists
    else if ((a && !b) || (!a && b)) {
      //not equal
      return true
    } else {
      //equal
      return false;
    }
  }
}
