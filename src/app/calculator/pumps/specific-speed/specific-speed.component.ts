import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-specific-speed',
  templateUrl: './specific-speed.component.html',
  styleUrls: ['./specific-speed.component.css']
})
export class SpecificSpeedComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  speedForm: FormGroup;
  specificSpeed: number;
  efficiencyCorrection: number;
  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.psat) {
      this.speedForm = this.psatService.initForm();
      this.speedForm.patchValue({
        pumpType: this.psatService.getPumpStyleFromEnum(0),
        pumpRPM: 1780,
        flowRate: 2000,
        head: 277
      })
    } else {
      this.speedForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }

    //get settings if standalone
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          //convert defaults if standalone without default system settings
          if (results[0].flowMeasurement != 'gpm') {
            let tmpVal = this.convertUnitsService.value(this.speedForm.controls.flowRate.value).from('gpm').to(results[0].flowMeasurement);
            this.speedForm.patchValue({
              flowRate: this.psatService.roundVal(tmpVal, 2)
            })
          }
          if (results[0].distanceMeasurement != 'ft') {
            let tmpVal = this.convertUnitsService.value(this.speedForm.controls.head.value).from('ft').to(results[0].distanceMeasurement);

            this.speedForm.patchValue({
              head: this.psatService.roundVal(tmpVal, 2)
            })
          }
          this.settings = results[0];
        }
      )
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }
}
