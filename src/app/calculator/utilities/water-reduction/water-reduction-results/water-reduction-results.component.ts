import { Component, OnInit, Input, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WaterReductionResults } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-water-reduction-results',
  templateUrl: './water-reduction-results.component.html',
  styleUrls: ['./water-reduction-results.component.css']
})
export class WaterReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  waterReductionResults: WaterReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results) {
      this.updateTableString();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
