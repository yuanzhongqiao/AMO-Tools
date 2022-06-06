import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { CompressedAirAssessment, EndUse } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EndUseResults, EndUsesService, UpdatedEndUseData } from '../../end-uses/end-uses.service';

@Component({
  selector: 'app-end-use-table',
  templateUrl: './end-use-table.component.html',
  styleUrls: ['./end-use-table.component.css']
})
export class EndUseTableComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  // endUses: Array<EndUse>;
  compressedAirAssessment: CompressedAirAssessment;

  selectedEndUse: EndUse;
  selectedEndUseSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  confirmDeleteData: ConfirmDeleteData;

  settings: Settings;
  constructor(private endUsesService: EndUsesService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedEndUseSub = this.endUsesService.selectedEndUse.subscribe(val => {
      this.selectedEndUse = val;
    })
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && compressedAirAssessment.endUses) {
        this.compressedAirAssessment = compressedAirAssessment;
        console.log('compressedAirAssessment.endUses', this.compressedAirAssessment)
        this.compressedAirAssessment.endUses.forEach(endUse => {
          let results: EndUseResults = this.endUsesService.setEndUseResults(endUse, this.compressedAirAssessment, this.settings);
          endUse.averageCapacity = results.averagePercentCapacity;
          endUse.excessPressure = results.excessPressure;
        })
        // this.endUses.forEach(endUse => {
          // TODO check valid?
          // compressor.isValid = this.endUsesService.isCompressorValid(compressor);
        // });
        // this.hasInvalidCompressors = this.endUses.some(compressor => !compressor.isValid);
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  selectItem(item: EndUse) {
    this.endUsesService.selectedEndUse.next(item);
  }

  addNewEndUse() {
    let result: UpdatedEndUseData = this.endUsesService.addToAssessment(this.compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    this.endUsesService.selectedEndUse.next(result.endUse);
  }

  deleteEndUse() {
    let itemIndex: number = this.compressedAirAssessment.endUses.findIndex(endUse => { return endUse.endUseId == this.deleteSelectedId });
    this.compressedAirAssessment.endUses.splice(itemIndex, 1);

    this.compressedAirAssessment.modifications.forEach(modification => {
      modification.reduceRuntime.runtimeData = modification.reduceRuntime.runtimeData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.adjustCascadingSetPoints.setPointData = modification.adjustCascadingSetPoints.setPointData.filter(data => { return data.compressorId != this.deleteSelectedId });
      modification.useAutomaticSequencer.profileSummary = modification.useAutomaticSequencer.profileSummary.filter(summary => { return summary.compressorId != this.deleteSelectedId })
    });

    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
    this.endUsesService.selectedEndUse.next(this.compressedAirAssessment.endUses[0]);
  }

  openConfirmDeleteModal(endUse: EndUse) {
    this.confirmDeleteData = {
      modalTitle: 'Delete End Use',
      confirmMessage: `Are you sure you want to delete '${endUse.endUseName}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = endUse.endUseId;
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteEndUse: boolean) {
    if (deleteEndUse) {
      this.deleteEndUse();
    }
    this.showConfirmDeleteModal = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }

  createCopy(endUse: EndUse){
    let endUseCopy: EndUse = JSON.parse(JSON.stringify(endUse));
    endUseCopy.endUseId = Math.random().toString(36).substr(2, 9);
    endUseCopy.endUseName = endUseCopy.endUseName + ' (copy)';
    this.endUsesService.addToAssessment(this.compressedAirAssessment, endUseCopy);
  }
}
