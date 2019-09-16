import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PhastReportComponent } from './phast-report.component';
import { EnergyUsedComponent } from './energy-used/energy-used.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { ResultsDataComponent } from './results-data/results-data.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { ReportSankeyComponent } from './report-sankey/report-sankey.component';
import { SankeyModule } from '../sankey/sankey.module';
import { PhastPieChartComponent } from './report-graphs/phast-pie-chart/phast-pie-chart.component';
import { PhastBarChartComponent } from './report-graphs/phast-bar-chart/phast-bar-chart.component';
// import { ChartsModule } from 'ng2-charts';
import { PhastReportService } from './phast-report.service';
import { ExecutiveSummaryService } from './executive-summary.service';
import { PhastInputSummaryModule } from './phast-input-summary/phast-input-summary.module';
import { ReportGraphsPrintComponent } from './report-graphs/report-graphs-print/report-graphs-print.component';
import { ModalModule } from 'ngx-bootstrap';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { PieChartModule } from '../../shared/pie-chart/pie-chart.module';
import { SimpleTooltipModule } from '../../shared/simple-tooltip/simple-tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SankeyModule,
    // ChartsModule,
    SharedModule,
    PhastInputSummaryModule,
    ModalModule,
    PrintOptionsMenuModule,
    FacilityInfoSummaryModule,
    PercentGraphModule,
    PieChartModule,
    SimpleTooltipModule
  ],
  declarations: [PhastReportComponent, EnergyUsedComponent, ExecutiveSummaryComponent, ResultsDataComponent, ReportGraphsComponent, ReportSankeyComponent, PhastPieChartComponent, PhastBarChartComponent, ReportGraphsPrintComponent],
  exports: [PhastReportComponent, ResultsDataComponent],
  providers: [PhastReportService, ExecutiveSummaryService]
})
export class PhastReportModule { }
