import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { PSAT, PsatOutputs, PsatInputs } from "../models/psat";
import { ConvertUnitsService } from "../convert-units/convert-units.service";
import { Settings } from "../../shared/models/settings";
import { PsatService } from "../../psat/psat.service";
import * as Plotly from "plotly.js";
import { CompareService } from "../../psat/compare.service";
import { DecimalPipe } from "@angular/common";
import { PsatSankeyNode } from '../../shared/models/psat/sankey.model';

@Component({
  selector: 'app-psat-sankey',
  templateUrl: './psat-sankey.component.html',
  styleUrls: ['./psat-sankey.component.css']
})
export class PsatSankeyComponent implements OnInit {
  @Input()
  psat: PSAT; //baseline
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  @Input()
  isBaseline: boolean;
  @Input()
  baseline: PSAT;
  @Input()
  baselineResults: PsatInputs;
  @Input()
  modResults: PsatInputs;

  selectedResults: PsatOutputs;
  selectedInputs: PsatInputs;

  width: number;
  height: number;

  firstChange: boolean = true;

  motor: number;
  drive: number;
  pump: number;

  gradientStartColor: string = '#1F1EDC';
  gradientEndColor: string = '#3390DE';
  nodeStartColor: string = 'rgba(31, 30, 220, .9)';
  nodeArrowColor: string = 'rgba(51, 144, 222, .9)';
  connectingNodes: Array<number> = [];
  connectingLinkPaths: Array<number> = [];

  constructor(
    private psatService: PsatService,
    private convertUnitsService: ConvertUnitsService,
    private compareService: CompareService,
    private _dom: ElementRef,
    private renderer: Renderer2,
    private decimalPipe: DecimalPipe
  ) { }

  ngOnInit() {
    if (!this.baseline && !this.isBaseline) {
      this.baseline = this.compareService.baselinePSAT;
    }
  }

  ngAfterViewInit() {
    if (!this.baselineResults && !this.modResults) {
      this.getResults();
    } else {
      this.selectedResults = this.baselineResults || this.modResults;
    }
    this.sankey(this.selectedResults);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.psat) {
      if (!changes.psat.firstChange) {
        this.getResults();
        this.sankey(this.selectedResults);
      }
    }
  }

  getResults() {
    this.selectedInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    let isPsatValid: boolean = this.psatService.isPsatValid(
      this.selectedInputs,
      this.isBaseline
    );
    if (isPsatValid) {
      if (this.isBaseline) {
        this.selectedResults = this.psatService.resultsExisting(
          this.selectedInputs,
          this.settings
        );
      } else {
        this.selectedResults = this.psatService.resultsModified(
          this.selectedInputs,
          this.settings
        );
      }
    } else {
      this.selectedResults = this.psatService.emptyResults();
    }
  }

  closeSankey() {
    Plotly.purge(this.ngChart.nativeElement);
  }

  sankey(results: PsatOutputs) {
    const links: Array<{ source: number, target: number }> = [];
    let nodes: Array<PsatSankeyNode> = [];

    this.closeSankey();
    this.calcLosses(results);

    this.buildNodes(results, nodes);
    this.buildLinks(nodes, links);

    const sankeyLink = {
      value: nodes.map(node => node.value),
      source: links.map(link => link.source),
      target: links.map(link => link.target),
      hoverinfo: 'none',
      line: {
        color: this.nodeStartColor,
        width: 0
      },
    };

    const sankeyData = {
      type: "sankey",
      orientation: "h",
      valuesuffix: "%",
      ids: nodes.map(node => node.id),
      textfont: {
        color: 'rgba(0, 0, 0)',
        size: 16
      },
      arrangement: 'freeform',
      node: {
        pad: 50,
        line: {
          color: this.nodeStartColor,
          width: 0
        },
        label: nodes.map(node => node.name),
        x: nodes.map(node => node.x),
        y: nodes.map(node => node.y),
        color: nodes.map(node => node.nodeColor),
        hoverinfo: 'all',
        hovertemplate: '%{value}<extra></extra>',
        hoverlabel: {
          font: {
            size: 16,
            color: 'rgba(255, 255, 255)'
          },
          align: 'auto',
        }
      },
      link: sankeyLink
    };

    const layout = {
      title: "",
      autosize: true,
      yaxis: {
        automargin: true,
      },
      xaxis: {
        automargin: true,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 50,
        t: 100,
        pad: 300,
      }
    };

    const config = {
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ],
      responsive: true
    };

    Plotly.react(this.ngChart.nativeElement, [sankeyData], layout, config);
    this.addGradientElement();
    this.buildSvgArrows();
  }

  buildNodes(results: PsatOutputs, nodes): Array<PsatSankeyNode> {
    const motorConnectorValue: number = results.motor_power - this.motor;
    let driveConnectorValue: number = 0;
    let usefulOutput: number = 0;

    if (this.drive > 0) {
      driveConnectorValue = motorConnectorValue - this.drive;
      usefulOutput = driveConnectorValue - this.pump;
    } else {
      usefulOutput = motorConnectorValue - this.pump;
    }

    nodes.push(
      {
        name: "Energy Input " + this.decimalPipe.transform(results.motor_power, '1.0-0') + " kW",
        value: 100,
        x: .1,
        y: .6,
        source: 0,
        target: [1,2],
        isConnector: true,
        nodeColor: this.nodeStartColor,
        id: 'originConnector'
      },
      {
        name: "",
        value: 0,
        x: .25,
        y: .6,
        source: 1,
        target: [2, 3],
        isConnector: true,
        nodeColor: this.nodeStartColor,
        id: 'inputConnector'
      },
      {
        name: "",
        value: (motorConnectorValue / results.motor_power) * 100,
        x: .5,
        y: .6,
        source: 2,
        target: [4, 5],
        isConnector: true,
        nodeColor: this.nodeStartColor,
        id: 'motorConnector'
      },
      {
        name: "Motor Losses " + this.decimalPipe.transform(this.motor, '1.0-0') + " kW",
        value: (this.motor / results.motor_power) * 100,
        x: .5,
        y: .10,
        source: 3,
        target: [],
        isConnector: false,
        nodeColor: this.nodeArrowColor,
        id: 'motorLosses'
      },
    );
    if (this.drive > 0) {
      nodes.push(
        {
          name: "Drive Losses " + this.decimalPipe.transform(this.drive, '1.0-0') + "kW",
          value: (this.drive / results.motor_power) * 100,
          x: .6,
          y: .25,
          source: 4,
          target: [],
          isConnector: false,
          nodeColor: this.nodeArrowColor,
          id: 'driveLosses'
        },
        {
          name: "",
          value: (driveConnectorValue / results.motor_power) * 100,
          x: .7,
          y: .6,
          source: 5,
          target: [6,7],
          isConnector: true,
          nodeColor: this.nodeStartColor,
          id: 'driveConnector'
        },
      );
    }
    nodes.push(
      {
        name: "Pump Losses " + this.decimalPipe.transform(this.pump, '1.0-0') + "kW",
        value: (this.pump / results.motor_power) * 100,
        x: .8,
        y: .15,
        source: this.drive > 0 ? 6 : 4,
        target: [],
        isConnector: false,
        nodeColor: this.nodeArrowColor,
        id: 'pumpLosses'
      },
      {
        name: "Useful Output " + this.decimalPipe.transform(usefulOutput, '1.0-0') + " kW",
        value: (usefulOutput / results.motor_power) * 100,
        x: .85,
        y: .65,
        source: this.drive > 0 ? 7 : 5,
        target: [],
        isConnector: false,
        nodeColor: this.nodeArrowColor,
        id: 'usefulOutput'
      }
    );

    return nodes;
  }

  buildLinks(nodes, links) {
    this.connectingLinkPaths.push(0);
    
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isConnector) {
          this.connectingNodes.push(i); 
          if (i !== 0 && i-1 !== 0) {
            this.connectingLinkPaths.push(i - 1);
          }
      }
      for (let j = 0; j < nodes[i].target.length; j++) {
          links.push(
            {
              source: nodes[i].source,
              target: nodes[i].target[j]
            }
          )
        }
    }
  }

  buildSvgArrows() {
    const rects = this._dom.nativeElement.querySelectorAll('.node-rect');
    const arrowOpacity = '0.9';
    const arrowShape = 'polygon(100% 50%, 0 0, 0 100%)'

    for (let i = 0; i < rects.length; i++) {
      if (!this.connectingNodes.includes(i)) {
        const height = rects[i].getAttribute('height');
        const defaultY = rects[i].getAttribute('y');

        rects[i].setAttribute('y', `${defaultY - (height / 2.75)}`);
        rects[i].setAttribute('style', `width: ${height}px; height: ${height * 1.75}px; clip-path:  ${arrowShape}; 
         stroke-width: 0.5; stroke: rgb(255, 255, 255); stroke-opacity: 0.5; fill: ${this.gradientEndColor}; fill-opacity: ${arrowOpacity};`);
      }
    }
  }

  addGradientElement(): void {
    const mainSVG = this._dom.nativeElement.querySelector('.main-svg')
    const svgDefs = this._dom.nativeElement.querySelector('defs')

    svgDefs.innerHTML = `
    <linearGradient id="psatLinkGradient">
      <stop offset="10%" stop-color="${this.gradientStartColor}" />
      <stop offset="100%" stop-color="${this.gradientEndColor}" />
    </linearGradient>
    `
    // Insert our gradient Def
    this.renderer.appendChild(mainSVG, svgDefs);
  }

  calcLosses(results) {
    var motorShaftPower;
    var pumpShaftPower;
    if (this.settings.powerMeasurement === "hp") {
      motorShaftPower = this.convertUnitsService
        .value(results.motor_shaft_power)
        .from("hp")
        .to("kW");
      pumpShaftPower = this.convertUnitsService
        .value(results.pump_shaft_power)
        .from("hp")
        .to("kW");
    } else {
      motorShaftPower = results.motor_shaft_power;
      pumpShaftPower = results.pump_shaft_power;
    }
    this.motor = results.motor_power * (1 - results.motor_efficiency / 100);
    this.drive = motorShaftPower - pumpShaftPower;
    this.pump =
      (results.motor_power - this.motor - this.drive) *
      (1 - results.pump_efficiency / 100);
  }
}
