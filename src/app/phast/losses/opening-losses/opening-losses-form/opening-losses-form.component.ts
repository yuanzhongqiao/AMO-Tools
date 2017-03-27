import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var converter: any;
@Component({
  selector: 'app-opening-losses-form',
  templateUrl: './opening-losses-form.component.html',
  styleUrls: ['./opening-losses-form.component.css']
})
export class OpeningLossesFormComponent implements OnInit {
  @Input()
  openingLossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  totalArea: number = 0.0;
  constructor() { }

  ngOnInit() {
  }

  checkForm() {
    if (this.openingLossesForm.status == 'VALID') {
      console.log('check')
      this.calculate.emit(true);
    }
  }

  getArea() {
    if (this.openingLossesForm.value.openingType == 'Round') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID") {
        this.openingLossesForm.controls.heightOfOpening.setValue(0);
        console.log(this.openingLossesForm.value.heightOfOpening)
        let radiusInches = this.openingLossesForm.value.lengthOfOpening;
        let radiusFeet = converter(radiusInches).from('in').to('ft') / 2;
        this.totalArea = Math.PI * Math.pow(radiusFeet, 2);
        this.checkForm();
      }
    } else if (this.openingLossesForm.value.openingType == 'Rectangular (Square)') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID" && this.openingLossesForm.controls.heightOfOpening.status == "VALID") {
        let lengthInches = this.openingLossesForm.value.lengthOfOpening;
        let heightInches = this.openingLossesForm.value.heightOfOpening;
        let lengthFeet = converter(lengthInches).from('in').to('ft');
        let heightFeet = converter(heightInches).from('in').to('ft');
        this.totalArea = lengthFeet * heightFeet;
        this.checkForm();
      }
    } else {
      this.totalArea = 0.0;
    }
  }

}
