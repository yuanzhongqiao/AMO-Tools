import { Injectable } from '@angular/core';
import { ImportExportModel } from './importExportModel';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';

import * as _ from 'lodash';
import { reject } from 'q';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Calculator } from '../models/calculators';
import { Settings } from '../models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';


@Injectable()
export class ImportExport2Service {
  constructor(private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService) { }


  getSelected(dir: Directory) {
    let assessments: Array<Assessment> = _.filter(dir.assessments, (assessment) => { return assessment.selected == true });
    let subDirs: Array<Directory> = _.filter(dir.subDirectory, (subDir) => { return subDir.selected == true });
    let assessmentObjs: Array<ImportExportModel> = new Array<ImportExportModel>();
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        assessmentObjs.push(obj);
      })
    }
    if (subDirs) {
      subDirs.forEach(dir => {
        let objs = this.getSubDirData(dir, assessmentObjs);
        assessmentObjs.concat(objs);
      })
    }
    return assessmentObjs;
  }

  getAssessmentObj(assessment: Assessment): ImportExportModel {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment.id);
    let directory: Directory = this.directoryDbService.getById(assessment.directoryId);
    let model: ImportExportModel = {
      assessment: assessment,
      settings: settings,
      directory: directory
    }
    return model;
  }

  getSubDirData(subDir: Directory, assessmentObjs: Array<ImportExportModel>) {
    let subDirAssessments = this.getSubDirSelected(subDir, assessmentObjs);
    return subDirAssessments;
  }

  getSubDirSelected(dir: Directory, assessmentObjs: Array<ImportExportModel>) {
    if (dir.assessments) {
      dir.assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        assessmentObjs.push(obj);
      })
    } else {
      let assessments = this.assessmentDbService.getByDirectoryId(dir.id);
      if (assessments) {
        assessments.forEach(assessment => {
          let obj = this.getAssessmentObj(assessment);
          assessmentObjs.push(obj);
        })
      }
    }
    if (dir.subDirectory) {
      dir.subDirectory.forEach(subDir => {
        let objs = this.getSubDirSelected(subDir, assessmentObjs);
        assessmentObjs.concat(objs);
      })
    }else{
      let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
      if(subDirs){
        subDirs.forEach(subDir => {
          let objs = this.getSubDirSelected(subDir, assessmentObjs);
          assessmentObjs.concat(objs);
        })
      }
    }
    return assessmentObjs;
  }

}
