import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';

import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';
import { PsatTabsComponent } from './psat-tabs/psat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { PumpFluidComponent } from './pump-fluid/pump-fluid.component';
import { MotorComponent } from './motor/motor.component';
import { FieldDataComponent } from './field-data/field-data.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';
import { DataPanelComponent } from './data-panel/data-panel.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { BaselineComponent } from './modify-conditions/baseline/baseline.component';
import { AdjustmentComponent } from './modify-conditions/adjustment/adjustment.component';
import { AdjustmentSelectedComponent } from './modify-conditions/adjustment-selected/adjustment-selected.component';
import { AdjustmentPumpFluidComponent } from './modify-conditions/adjustment-selected/adjustment-pump-fluid/adjustment-pump-fluid.component';
import { AdjustmentMotorComponent } from './modify-conditions/adjustment-selected/adjustment-motor/adjustment-motor.component';
import { AdjustmentFieldDataComponent } from './modify-conditions/adjustment-selected/adjustment-field-data/adjustment-field-data.component';
import { PsatReportComponent } from './psat-report/psat-report.component';
import { InputSummaryComponent } from './psat-report/input-summary/input-summary.component';
import { OutputSummaryComponent } from './psat-report/output-summary/output-summary.component';
import { ChartSummaryComponent } from './psat-report/chart-summary/chart-summary.component';
import { PsatChartComponent } from './psat-chart/psat-chart.component';

@NgModule({
  declarations: [
    PsatComponent,
    PsatBannerComponent,
    PsatTabsComponent,
    SystemBasicsComponent,
    PumpFluidComponent,
    MotorComponent,
    FieldDataComponent,
    ModifyConditionsComponent,
    SettingsPanelComponent,
    DataPanelComponent,
    HelpPanelComponent,
    BaselineComponent,
    AdjustmentComponent,
    AdjustmentSelectedComponent,
    AdjustmentPumpFluidComponent,
    AdjustmentMotorComponent,
    AdjustmentFieldDataComponent,
    PsatReportComponent,
    InputSummaryComponent,
    OutputSummaryComponent,
    ChartSummaryComponent,
    PsatChartComponent
  ],
  exports: [

  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartsModule
  ],
  providers: [
  ]
})

export class PsatModule { }
