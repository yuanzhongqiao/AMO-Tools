import { Component, OnInit } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { ActivatedRoute } from '@angular/router';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { DirectoryItem, FilterDashboardBy } from '../../shared/models/directory-dashboard';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../assessment.service';

@Component({
  selector: 'app-directory-dashboard',
  templateUrl: './directory-dashboard.component.html',
  styleUrls: ['./directory-dashboard.component.css']
})
export class DirectoryDashboardComponent implements OnInit {

  directory: Directory;
  dashboardView: string;
  dashboardViewSub: Subscription;
  directoryId: number;
  showDeleteItemsModal: boolean;
  showDeleteItemsModalSub: Subscription;
  showPreAssessmentModalSub: Subscription;
  showPreAssessmentModalIndex: { index: number, isNew: boolean };
  updateDashboardDataSub: Subscription;

  directoryItems: Array<DirectoryItem>;
  displayAddPreAssessment: boolean;

  filterDashboardBy: FilterDashboardBy;
  filterDashboardBySub: Subscription;
  sortBy: { value: string, direction: string };
  sortBySub: Subscription;

  dashboardCollapsed: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService,
    private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe(params => {
      this.directoryId = Number(params['id']);
      this.directoryDashboardService.selectedDirectoryId.next(this.directoryId);
      this.directory = this.directoryDbService.getById(this.directoryId);
      this.setDirectoryItems();
    });
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      if (val) {
        this.directory = this.directoryDbService.getById(this.directoryId);
        this.setDirectoryItems();
      }
    });
    this.showDeleteItemsModalSub = this.directoryDashboardService.showDeleteItemsModal.subscribe(val => {
      this.showDeleteItemsModal = val;
    });
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.showPreAssessmentModalSub = this.directoryDashboardService.showPreAssessmentModalIndex.subscribe(val => {
      this.showPreAssessmentModalIndex = val;
    });
    this.filterDashboardBySub = this.directoryDashboardService.filterDashboardBy.subscribe(val => {
      this.filterDashboardBy = val;
    });
    this.sortBySub = this.directoryDashboardService.sortBy.subscribe(val => {
      this.sortBy = val;
    });

    if(!this.settingsDbService.globalSettings.disableDashboardTutorial){
      this.assessmentService.showTutorial.next('dashboard-tutorial');
    }
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.showDeleteItemsModalSub.unsubscribe();
    this.showPreAssessmentModalSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
    this.filterDashboardBySub.unsubscribe();
    this.sortBySub.unsubscribe();
  }

  setDirectoryItems() {
    this.directoryItems = this.directoryDashboardService.getDirectoryItems(this.directory);
    let preAssessmentExists = this.directoryItems.find((item) => { return item.type == 'calculator' });
    if (preAssessmentExists == undefined) {
      this.displayAddPreAssessment = true;
    } else {
      this.displayAddPreAssessment = false;
    }
  }

  collapseDashboard() {
    this.dashboardCollapsed = !this.dashboardCollapsed;
    window.dispatchEvent(new Event("resize"));
  }
}

