import { Component, OnInit, Input } from '@angular/core';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';

@Component({
  selector: 'app-energy-summary',
  templateUrl: './energy-summary.component.html',
  styleUrls: ['./energy-summary.component.css']
})
export class EnergySummaryComponent implements OnInit {
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput}>;
  @Input()
  settings: Settings;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment:Assessment;

  selectedModificationIndex: number;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    if (this.inRollup) {
      this.reportRollupService.selectedSsmt.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }
  }

  useModification() {
    this.reportRollupService.updateSelectedSsmt({assessment: this.assessment, settings: this.settings}, this.selectedModificationIndex);
  }
}
