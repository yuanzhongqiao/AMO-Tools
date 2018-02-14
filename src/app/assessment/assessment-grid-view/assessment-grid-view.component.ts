import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Calculator } from '../../shared/models/calculators';
@Component({
  selector: 'app-assessment-grid-view',
  templateUrl: './assessment-grid-view.component.html',
  styleUrls: ['./assessment-grid-view.component.css']
})
export class AssessmentGridViewComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;
  @Input()
  directoryCalculator: Calculator;
  @Output('emitPreAssessment')
  emitPreAssessment = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  changeDirectory(dir?) {
    if (dir) {
      this.directoryChange.emit(dir);
    } else {
      this.directoryChange.emit(this.directory);
    }
  }

  viewPreAssessment() {
    this.emitPreAssessment.emit(true);
  }

}
