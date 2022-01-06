import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";

export const MockWasteWater: Assessment = {
  isExample: true,
  name: "Waste Water Example",
  type: "WasteWater",
  selected: false,
  wasteWater: {
    setupDone: true,
    baselineData: {
      name: 'Baseline',
      id: Math.random().toString(36).substr(2, 9),
      activatedSludgeData: {
        Temperature: 20,
        So: 200,
        Volume: 1,
        FlowRate: 1,
        InertVSS: 40,
        OxidizableN: 35,
        Biomass: 0.85,
        InfluentTSS: 200,
        InertInOrgTSS: 20,
        EffluentTSS: 8,
        RASTSS: 10000,
        MLSSpar: 3000,
        FractionBiomass: 0.1,
        BiomassYeild: 0.6,
        HalfSaturation: 60,
        MicrobialDecay: 0.1,
        MaxUtilizationRate: 8,
        CalculateGivenSRT: false,
        DefinedSRT: 0
      },
      aeratorPerformanceData: {
        OperatingDO: 4.5,
        Alpha: 0.84,
        Beta: 0.92,
        Aerator: 'Surface high speed',
        SOTR: 2.7,
        Aeration: 150,
        Elevation: 200,
        OperatingTime: 24,
        TypeAerators: 1,
        Speed: 100,
        AnoxicZoneCondition: false
      },
      operations: {
        MaxDays: 100,
        TimeIncrement: .5,
        operatingMonths: 12,
        EnergyCostUnit: 0.09
      },
      co2SavingsData: {
        energyType: 'electricity',
        energySource: '',
        fuelType: '',
        totalEmissionOutputRate: 0,
        electricityUse: 0,
        eGridRegion: '',
        eGridSubregion: 'SRTV',
        totalEmissionOutput: 0,
        userEnteredBaselineEmissions: false,
        userEnteredModificationEmissions: false,
        zipcode: '37830',
      }
    },
    modifications: [
      {
        name: 'Reduce Aeration Operating Power',
        id: Math.random().toString(36).substr(2, 9),
        activatedSludgeData: {
          Temperature: 20,
          So: 200,
          Volume: 1,
          FlowRate: 1,
          InertVSS: 40,
          OxidizableN: 35,
          Biomass: 0.85,
          InfluentTSS: 200,
          InertInOrgTSS: 20,
          EffluentTSS: 8,
          RASTSS: 10000,
          MLSSpar: 3000,
          FractionBiomass: 0.1,
          BiomassYeild: 0.6,
          HalfSaturation: 60,
          MicrobialDecay: 0.1,
          MaxUtilizationRate: 8,
          CalculateGivenSRT: false,
          DefinedSRT: 0
        },
        aeratorPerformanceData: {
          OperatingDO: 2.93,
          Alpha: 0.84,
          Beta: 0.92,
          Aerator: 'Surface high speed',
          SOTR: 2.7,
          Aeration: 100,
          Elevation: 200,
          OperatingTime: 24,
          TypeAerators: 1,
          Speed: 100,
          AnoxicZoneCondition: false
        },
        operations: {
          MaxDays: 100,
          TimeIncrement: .5,
          operatingMonths: 12,
          EnergyCostUnit: 0.09
        },
        co2SavingsData: {
          energyType: 'electricity',
          energySource: '',
          fuelType: '',
          totalEmissionOutputRate: 0,
          electricityUse: 0,
          eGridRegion: '',
          eGridSubregion: 'SRTV',
          totalEmissionOutput: 0,
          userEnteredBaselineEmissions: false,
          userEnteredModificationEmissions: false,
          zipcode: '37830',
        }
      },
    ],
    systemBasics: {
      equipmentNotes: ''
    }
  }
};


export const MockWasteWaterSettings: Settings = {
  "language": "English",
  "currency": "$",
  "unitsOfMeasure": "Imperial",
  "distanceMeasurement": "ft",
  "flowMeasurement": "MGD",
  "powerMeasurement": "hp",
  "pressureMeasurement": "psi",
  "steamPressureMeasurement": "psig",
  "steamTemperatureMeasurement": "F",
  "steamSpecificEnthalpyMeasurement": "btuLb",
  "steamSpecificEntropyMeasurement": "btulbF",
  "steamSpecificVolumeMeasurement": "ft3lb",
  "steamMassFlowMeasurement": "klb",
  "steamPowerMeasurement": "kW",
  "steamVolumeMeasurement": "gal",
  "steamVolumeFlowMeasurement": "gpm",
  "steamVacuumPressure": "psia",
  "currentMeasurement": null,
  "viscosityMeasurement": null,
  "voltageMeasurement": null,
  "energySourceType": "Fuel",
  "furnaceType": null,
  "energyResultUnit": "MMBtu",
  "customFurnaceName": null,
  "temperatureMeasurement": "F",
  "appVersion": "0.3.3-beta",
  "fanCurveType": null,
  "fanConvertedConditions": null,
  "phastRollupUnit": "MMBtu",
  "phastRollupFuelUnit": "MMBtu",
  "phastRollupElectricityUnit": "MMBtu",
  "phastRollupSteamUnit": "MMBtu",
  "defaultPanelTab": "results",
  "fuelCost": 3.99,
  "steamCost": 4.69,
  "electricityCost": 0.066,
  "densityMeasurement": "lbscf",
  "fanFlowRate": "ft3/min",
  "fanPressureMeasurement": "inH2o",
  "fanBarometricPressure": "inHg",
  "fanSpecificHeatGas": "btulbF",
  "fanPowerMeasurement": "hp",
  "fanTemperatureMeasurement": "F",
  "steamEnergyMeasurement": "MMBtu",
  "disableTutorial": true,
  "disableDashboardTutorial": true,
  "disablePsatSetupTutorial": true,
  "disablePsatAssessmentTutorial": true,
  "disablePsatReportTutorial": true,
  "disablePhastSetupTutorial": true,
  "disablePhastAssessmentTutorial": true,
  "disablePhastReportTutorial": true,
  "disableFsatSetupTutorial": true,
  "disableFsatAssessmentTutorial": true,
  "disableFsatReportTutorial": true,
  facilityInfo: {
    companyName: "ORNL",
    facilityName: "ORNL Test Facility",
    address: {
      street: "1 Bethel Valley Rd.",
      city: "Oak Ridge",
      state: "TN",
      country: "U.S.",
      zip: "37831"
    },
    facilityContact: {
      contactName: "T. Owner",
      phoneNumber: 8655767658,
      email: "t.owner@ornl.com"
    },
    assessmentContact: {
      contactName: "D.O. Energy",
      phoneNumber: 1234567890,
      email: "AMO_ToolHelpDesk@ee.doe.gov"
    },
    date: "Tue Dec 04 2018"
  },
  "commonRollupUnit": "MMBtu",
  "pumpsRollupUnit": "MWh",
  "fansRollupUnit": "MWh",
  "steamRollupUnit": "MMBtu",
  "wasteWaterRollupUnit": "MWh",
  "compressedAirRollupUnit": "MWh"
};
