import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, UseAutomaticSequencer } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-use-automatic-sequencer',
  templateUrl: './use-automatic-sequencer.component.html',
  styleUrls: ['./use-automatic-sequencer.component.css']
})
export class UseAutomaticSequencerComponent implements OnInit {


  selectedModificationIdSub: Subscription;
  useAutomaticSequencer: UseAutomaticSequencer;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  dayTypeOptions: Array<CompressedAirDayType>;
  selectedDayTypeId: string;
  adjustedCompressors: Array<CompressorInventoryItem>;
  requiredAirflow: Array<number>;
  availableAirflow: Array<number>;
  hasError: boolean;
  adjustedProfileSummary: Array<ProfileSummary>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;
        this.selectedDayTypeId = this.dayTypeOptions[0].dayTypeId;
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('useAutomaticSequencer');
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.useAutomaticSequencer = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer));
      if (this.selectedDayTypeId && this.compressedAirAssessment && (!this.useAutomaticSequencer.profileSummary || this.useAutomaticSequencer.profileSummary.length == 0)) {
        this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
      }
      this.setAdjustedCompressors();
      this.setAdjustedSummary();
      this.setAirflowData();
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceSystemAirPressure.order,
        modification.reduceAirLeaks.order
      ];
      allOrders = allOrders.filter(order => { return order != 100 });
      let numOrdersOn: number = allOrders.length;
      for (let i = 1; i <= numOrdersOn + 1; i++) {
        this.orderOptions.push(i);
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].useAutomaticSequencer = this.useAutomaticSequencer;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.useAutomaticSequencer.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'useAutomaticSequencer', previousOrder, newOrder);
    }
    this.setAdjustedCompressors();
    this.setAdjustedSummary();
    this.setAirflowData();
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }

  resetOrdering() {
    this.useAutomaticSequencer.profileSummary = JSON.parse(JSON.stringify(this.compressedAirAssessment.systemProfile.profileSummary));
    this.useAutomaticSequencer.profileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(item => {return item.itemId == summary.compressorId});
      summary.automaticShutdownTimer = compressor.compressorControls.automaticShutdown;
    });
    this.save(false);
  }

  setAdjustedCompressors() {
    this.adjustedCompressors = this.compressedAirAssessmentResultsService.useAutomaticSequencerAdjustCompressor(this.useAutomaticSequencer, JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems)), this.useAutomaticSequencer.profileSummary, this.selectedDayTypeId);
  }

  setAdjustedSummary() {
    if (this.selectedDayTypeId && this.compressedAirAssessment) {
      let dayType: CompressedAirDayType = this.dayTypeOptions.find(dayTypeOption => { return dayTypeOption.dayTypeId == this.selectedDayTypeId });
      let baselineProfileSummary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateDayTypeProfileSummary(this.compressedAirAssessment, dayType);
      let adjustedCompressors: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems));
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];

      let modificationOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceAirLeaks.order,
        modification.reduceSystemAirPressure.order,
        modification.reduceRuntime.order
      ];
      modificationOrders = modificationOrders.filter(order => { return order != 100 && order <= this.useAutomaticSequencer.order });
      this.adjustedProfileSummary = this.compressedAirAssessmentResultsService.adjustProfileSummary(dayType, baselineProfileSummary, adjustedCompressors, modification, modificationOrders).adjustedProfileSummary;
    }
  }

  setAirflowData() {
    this.availableAirflow = new Array();
    this.requiredAirflow = new Array();
    if (this.selectedDayTypeId && this.compressedAirAssessment && this.adjustedProfileSummary && this.useAutomaticSequencer.order != 100) {
      for (let i = 0; i < 24; i++) {
        this.requiredAirflow.push(0);
        this.availableAirflow.push(0);
      }
      this.adjustedProfileSummary.forEach(summary => {
        if (summary.dayTypeId == this.selectedDayTypeId) {
          for (let i = 0; i < 24; i++) {
            if (summary.profileSummaryData[i].order != 0) {
              this.requiredAirflow[i] = this.requiredAirflow[i] + summary.profileSummaryData[i].airflow;
            }
            let profileSummary: ProfileSummary = this.useAutomaticSequencer.profileSummary.find(sequencerSummary => {return summary.compressorId == sequencerSummary.compressorId && summary.dayTypeId == sequencerSummary.dayTypeId});
            let intervalItem: ProfileSummaryData = profileSummary.profileSummaryData.find(data => {return data.timeInterval == i});
            if (intervalItem.order != 0) {
              this.availableAirflow[i] = this.availableAirflow[i] + this.getFullLoadCapacity(profileSummary.compressorId);
            }
          }
        }
      });
      this.hasError = false;
      for (let i = 0; i < this.requiredAirflow.length; i++) {
        if (this.availableAirflow[i] < this.requiredAirflow[i]) {
          this.hasError = true;
        }
      }
    }
  }

  
  getFullLoadCapacity(compressorId: string): number {
    let compressor: CompressorInventoryItem = this.adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
    return compressor.performancePoints.fullLoad.airflow;
  }
}
