import { Injectable } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayType } from '../day-type-analysis.service';
import { LogToolService } from '../../log-tool.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class DayTypeGraphService {


  selectedGraphType: BehaviorSubject<string>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolService: LogToolService) {
    this.selectedGraphType = new BehaviorSubject<string>('daily');
  }

  getDayTypeScatterPlotData(): Array<{ xData: Array<any>, yData: Array<number>, name: string, color: string }> {
    let dayTypePlotData: Array<{ xData: Array<any>, yData: Array<number>, name: string, color: string }> = new Array();
    if (this.selectedGraphType.getValue() == 'daily') {
      this.dayTypeAnalysisService.daySummaries.forEach((daySummary) => {
        let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(daySummary.dayData);
        let color: string = this.getDateColor(daySummary);
        dayTypePlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: daySummary.date.toUTCString(), color: color });
      })
    } else {
      let dayTypeSummaries = this.dayTypeAnalysisService.dayTypeSummaries.getValue();
      dayTypeSummaries.forEach(summary => {
        let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(summary.data);
        let color: string = summary.dayType.color;
        dayTypePlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: summary.dayType.label, color: color });
      })
    }
    return dayTypePlotData;
  }

  getDayAverages(dayItems: Array<any>): { xData: Array<any>, yData: Array<number> } {
    let uniqHours = _.uniqBy(dayItems, (dayItem) => {
      if (dayItem[this.logToolService.dateField]) {
        let date = new Date(dayItem[this.logToolService.dateField]);
        return date.getHours();
      };
    });
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    uniqHours.forEach(hourItem => {
      let tmpDay: Date = new Date(hourItem[this.logToolService.dateField]);
      let filteredDaysByHour = _.filter(dayItems, (dayItem) => {
        if (dayItem[this.logToolService.dateField]) {
          let date = new Date(dayItem[this.logToolService.dateField]);
          let dateVal = date.getHours();
          let compareVal = tmpDay.getHours();
          return compareVal == dateVal;
        };
      });
      let dayMean: number = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[this.dayTypeAnalysisService.selectedDataField.getValue().fieldName] });
      yData.push(dayMean);
      xData.push(tmpDay.getHours());
    })
    return { xData: xData, yData: yData };
  }

  getDateColor(daySummary: DaySummary): string {
    let typeOfDay: DayType = this.dayTypeAnalysisService.getDayType(daySummary.date);
    if (typeOfDay) {
      return typeOfDay.color;
    } else {
      return;
    }
  }

}
