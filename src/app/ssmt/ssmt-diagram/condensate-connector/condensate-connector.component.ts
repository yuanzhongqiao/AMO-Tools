import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-condensate-connector',
  templateUrl: './condensate-connector.component.html',
  styleUrls: ['./condensate-connector.component.css']
})
export class CondensateConnectorComponent implements OnInit {
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  returnCondensate: SteamPropertiesOutput;
  
  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string){
    this.emitSetHover.emit(str);
  }
}
