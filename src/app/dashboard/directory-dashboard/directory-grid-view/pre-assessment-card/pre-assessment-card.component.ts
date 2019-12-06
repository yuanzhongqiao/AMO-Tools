import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Calculator } from '../../../../shared/models/calculators';
import { Directory } from '../../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreAssessmentService } from '../../../../calculator/utilities/pre-assessment/pre-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import { CalculatorDbService } from '../../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { DashboardService } from '../../../dashboard.service';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pre-assessment-card',
  templateUrl: './pre-assessment-card.component.html',
  styleUrls: ['./pre-assessment-card.component.css']
})
export class PreAssessmentCardComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  index: number;


  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;

  allDirectories: Array<Directory>;
  directory: Directory;
  editForm: FormGroup;
  copyForm: FormGroup;
  numUnits: number = 0;
  energyUsed: number = 0;
  energyCost: number = 0;
  preAssessmentExists: boolean;
  dropdownOpen: boolean = false;

  settings: Settings;

  updateSidebarDataSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder, private preAssessmentService: PreAssessmentService, private calculatorDbService: CalculatorDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    this.updateSidebarDataSub = this.dashboardService.updateSidebarData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.calculator.directoryId);
      this.allDirectories = this.directoryDbService.getAll();
      this.settings = this.settingsDbService.getByDirectoryId(this.calculator.directoryId);
      this.checkPreAssessment();
      this.calculateData();
    });
  }

  ngOnDestroy() {
    this.updateSidebarDataSub.unsubscribe();
  }

  calculateData() {
    if (this.preAssessmentExists) {
      this.numUnits = this.calculator.preAssessments.length;
      let tmpResults = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'MMBtu');
      this.energyUsed = _.sumBy(tmpResults, 'value');
      this.energyCost = _.sumBy(tmpResults, 'energyCost');
    } else {
      this.energyCost = 0;
      this.energyUsed = 0;
      this.numUnits = 0;
    }
  }

  checkPreAssessment() {
    if (this.calculator) {
      if (this.calculator.preAssessments) {
        if (this.calculator.preAssessments.length > 0) {
          this.preAssessmentExists = true;
        } else {
          this.preAssessmentExists = false;
        }
      } else {
        this.preAssessmentExists = false;
      }
    }
  }

  deletePreAssessment() {
    this.indexedDbService.deleteCalculator(this.calculator.id).then(() => {
      this.calculatorDbService.setAll().then(() => {
        this.hideDeleteModal();
      });
    });
  }

  showPreAssessment() {
    console.log('SHOW')
    this.directoryDashboardService.showPreAssessmentModalIndex.next(this.index);
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.calculator.name],
      'directoryId': [this.calculator.directoryId]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }

  save() {
    this.calculator.name = this.editForm.controls.name.value;
    this.calculator.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putCalculator(this.calculator).then(val => {
      this.calculatorDbService.setAll().then(() => {
        this.hideEditModal();
      });
    });
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  showCopyModal() {
    this.copyForm = this.formBuilder.group({
      'name': [this.calculator.name + ' (copy)', Validators.required],
      'directoryId': [this.calculator.directoryId, Validators.required]
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  createCopy() {
    let calculatorCopy: Calculator = JSON.parse(JSON.stringify(this.calculator));
    delete calculatorCopy.id;
    calculatorCopy.name = this.copyForm.controls.name.value;
    calculatorCopy.directoryId = this.copyForm.controls.directoryId.value;
    this.indexedDbService.addCalculator(calculatorCopy).then(calculatorId => {
      this.calculatorDbService.setAll().then(() => {
        this.hideCopyModal();
      });
    });
  }
}
