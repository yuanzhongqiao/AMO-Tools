import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayType } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
@Component({
  selector: 'app-day-types',
  templateUrl: './day-types.component.html',
  styleUrls: ['./day-types.component.css']
})
export class DayTypesComponent implements OnInit {

  addNewDayType: boolean = false;
  newDayTypeName: string = "New Day Type";
  newDayTypeColor: string = "#6a28d7";
  dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> };
  dayTypesSub: Subscription;
  daySummaries: Array<DaySummary>;
  selectedDays: Array<string> = [];
  weekdaySelected: boolean = true;
  weekendSelected: boolean = true;
  excludedSelected: boolean = true;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypes = val;
    });
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;
  }

  ngOnDestroy() {
    this.dayTypesSub.unsubscribe();
  }

  showAddNewDayType() {
    this.addNewDayType = true;
  }

  hideAddNewDayType() {
    this.addNewDayType = false;
  }

  submitNewDayType() {
    let dates: Array<Date> = new Array();
    this.selectedDays.forEach(date => {
      this.dayTypeAnalysisService.removeFromPrimary(new Date(date));
      dates.push(new Date(date));
    });
    let dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> } = this.dayTypeAnalysisService.dayTypes.getValue();
    dayTypes.addedDayTypes.push({
      color: this.newDayTypeColor,
      label: this.newDayTypeName,
      useDayType: true,
      dates: dates
    });
    this.dayTypeAnalysisService.dayTypes.next(dayTypes);
    this.hideAddNewDayType();
  }

  setDayTypes() {
    this.dayTypeAnalysisService.dayTypes.next(this.dayTypes);
  }
}
