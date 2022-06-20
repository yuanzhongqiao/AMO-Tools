import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment/compressed-air-assessment.service';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
 
import { Assessment } from '../../../../shared/models/assessment';
import { CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { LogToolField } from '../../../log-tool-models';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Directory } from '../../../../shared/models/directory';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { AssessmentService } from '../../../../dashboard/assessment.service';
import { Settings } from '../../../../shared/models/settings';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { DayTypeAnalysisService } from '../../day-type-analysis.service';
import { LogToolService } from '../../../log-tool.service';
import { InventoryService } from '../../../../compressed-air-assessment/inventory/inventory.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-select-assessment-modal',
  templateUrl: './select-assessment-modal.component.html',
  styleUrls: ['./select-assessment-modal.component.css'],
})
export class SelectAssessmentModalComponent implements OnInit {
  @Output('close')
  close: EventEmitter<boolean> = new EventEmitter<boolean>();


  @ViewChild('selectAssessmentModal', { static: false }) public selectAssessmentModal: ModalDirective;

  compressedAirAssessments: Array<Assessment>;
  directories: Array<Directory>
  addNewAssessment: boolean = false;
  newAssessmentForm: FormGroup;
  constructor(private assessmentDbService: AssessmentDbService, private logToolService: LogToolService,
    private compressedAirAssessmentService: CompressedAirAssessmentService, private directoryDbService: DirectoryDbService,
    private formBuilder: FormBuilder, private assessmentService: AssessmentService, private settingsDbService: SettingsDbService,
    private dayTypeAnalysisService: DayTypeAnalysisService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.setDirectories();
    this.setAssessments();
    this.initForm();
  }

  async setAssessments() {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    this.compressedAirAssessments = allAssessments.filter(assessment => { return assessment.type == "CompressedAir" });
    this.compressedAirAssessments = this.compressedAirAssessments.filter(assessment => {return !assessment.compressedAirAssessment.modifications || assessment.compressedAirAssessment.modifications.length == 0});
    this.compressedAirAssessments = _.orderBy(this.compressedAirAssessments, 'modifiedDate');
  }

  ngAfterViewInit() {
    this.showModal();
  }
  async setDirectories() {
    this.directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  closeModal() {
    this.close.emit(true);
  }

  showModal() {
    this.selectAssessmentModal.show();
  }

  hideModal() {
    this.selectAssessmentModal.hide();
    this.close.emit(true);
  }

  initForm() {
    this.newAssessmentForm = this.formBuilder.group({
      'assessmentName': ['New Assessment', Validators.required],
      'assessmentType': ['CompressedAir', Validators.required],
      'directoryId': [1, Validators.required]
    });
    this.newAssessmentForm.controls.assessmentType.disable();
  }

  async selectAssessment(assessment: Assessment) {
    assessment.compressedAirAssessment = this.setDayTypesFromLogTool(assessment.compressedAirAssessment)
    
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.updateWithObservable(assessment));
    this.assessmentDbService.setAll(assessments);
    this.compressedAirAssessmentService.mainTab.next('system-setup');
    this.compressedAirAssessmentService.setupTab.next('day-types');
    // this.router.navigateByUrl('/compressed-air/' + assessment.id);
    this.assessmentService.goToAssessment(assessment, 'system-setup', 'day-types');

  }

  setDayTypesFromLogTool(compressedAirAssessment: CompressedAirAssessment): CompressedAirAssessment {
    this.dayTypeAnalysisService.dayTypeSummaries.getValue();
    let logToolFields: Array<LogToolField> = new Array();
    let fields: Array<LogToolField> = this.logToolService.fields;
    fields.forEach(field => {
      if (!field.isDateField && field.useField) {
        logToolFields.push(field);
      }
    });
    compressedAirAssessment.logToolData = {
      logToolFields: logToolFields,
      dayTypeSummaries: this.dayTypeAnalysisService.dayTypeSummaries.getValue()
    }
    compressedAirAssessment.logToolData.dayTypeSummaries.forEach(summary => {
      delete summary.data
    });
    compressedAirAssessment.compressedAirDayTypes = new Array();

    compressedAirAssessment.logToolData.dayTypeSummaries.forEach(dayTypeSummary => {
      if (dayTypeSummary.dayType.useDayType && dayTypeSummary.dayType.label != 'Excluded') {
        compressedAirAssessment = this.inventoryService.addNewDayType(compressedAirAssessment, dayTypeSummary.dayType.label, dayTypeSummary.dayType.dayTypeId);
      }
    });
    return compressedAirAssessment;
  }

  async createAssessment() {
    if (this.newAssessmentForm.valid) {
      let tmpAssessment = this.assessmentService.getNewAssessment('CompressedAir');
      tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
      tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
      let settings: Settings = this.settingsDbService.getByDirectoryId(tmpAssessment.directoryId);
      tmpAssessment.compressedAirAssessment = this.assessmentService.getNewCompressedAirAssessment(settings);
      // this.addAssessment(tmpAssessment, '/compressed-air/');
      let assessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
      tmpAssessment.id = assessment.id;
      let updatedAssessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
      this.assessmentDbService.setAll(updatedAssessments);
      this.selectAssessment(tmpAssessment);
    }
  }

  showAddNewAssessment() {
    this.addNewAssessment = true;
  }

  hideAddNewAssessment() {
    this.addNewAssessment = false;
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }
}
