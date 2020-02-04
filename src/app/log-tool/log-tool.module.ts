import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogToolComponent } from './log-tool.component';
import { LogToolBannerComponent } from './log-tool-banner/log-tool-banner.component';
import { RouterModule } from '@angular/router';
import { LogToolService } from './log-tool.service';
import { SystemSetupComponent } from './system-setup/system-setup.component';
import { HelpPanelComponent } from './system-setup/help-panel/help-panel.component';
import { VisualizeComponent } from './visualize/visualize.component';
import { ReportComponent } from './report/report.component';
import { SetupDataComponent } from './system-setup/setup-data/setup-data.component';
import { FormsModule } from '@angular/forms';
import { CleanDataComponent } from './system-setup/clean-data/clean-data.component';
import { DayTypeAnalysisComponent } from './day-type-analysis/day-type-analysis.component';
import { DayTypesComponent } from './day-type-analysis/day-types/day-types.component';
import { DayTypeGraphComponent } from './day-type-analysis/day-type-graph/day-type-graph.component';
import { DayTypeCalendarComponent } from './day-type-analysis/day-type-calendar/day-type-calendar.component';
import { DayTypeAnalysisService } from './day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from './day-type-analysis/day-type-graph/day-type-graph.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { VisualizeTabsComponent } from './visualize/visualize-tabs/visualize-tabs.component';
import { VisualizeGraphComponent } from './visualize/visualize-graph/visualize-graph.component';
import { VisualizeDataComponent } from './visualize/visualize-data/visualize-data.component';
import { VisualizeService } from './visualize/visualize.service';
import { VisualizeMenuComponent } from './visualize/visualize-menu/visualize-menu.component';
import { LogToolDataService } from './log-tool-data.service';
import { DayTypeTableComponent } from './day-type-analysis/day-type-table/day-type-table.component';
import { DayTypeMenuComponent } from './day-type-analysis/day-type-menu/day-type-menu.component';
import { DataTableComponent } from './system-setup/setup-data/data-table/data-table.component';
import { FieldUnitsModalComponent } from './system-setup/clean-data/field-units-modal/field-units-modal.component';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    LogToolComponent,
    LogToolBannerComponent,
    SystemSetupComponent,
    HelpPanelComponent,
    VisualizeComponent,
    ReportComponent,
    SetupDataComponent,
    CleanDataComponent,
    DayTypeAnalysisComponent,
    DayTypesComponent,
    DayTypeGraphComponent,
    DayTypeCalendarComponent,
    VisualizeTabsComponent,
    VisualizeGraphComponent,
    VisualizeDataComponent,
    VisualizeMenuComponent,
    DayTypeTableComponent,
    DayTypeMenuComponent,
    DataTableComponent,
    FieldUnitsModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbDatepickerModule,
    ModalModule
  ],
  providers: [
    LogToolService,
    DayTypeAnalysisService,
    DayTypeGraphService,
    VisualizeService,
    LogToolDataService
  ]
})
export class LogToolModule { }
