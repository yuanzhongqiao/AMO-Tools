import { Injectable } from '@angular/core';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntimeData, SystemProfile } from '../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from './compressed-air-calculation.service';
import * as _ from 'lodash';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';

@Injectable()
export class CompressedAirAssessmentResultsService {

  constructor(private compressedAirCalculationService: CompressedAirCalculationService, private performancePointCalculationsService: PerformancePointCalculationsService) { }


  calculateBaselineResults(compressedAirAssessment: CompressedAirAssessment): BaselineResults {
    let dayTypeResults: Array<BaselineResult> = new Array();
    
    let totalFullLoadCapacity: number = this.getTotalCapacity(compressedAirAssessment.compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressedAirAssessment.compressorInventoryItems);
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {

      let baselineProfileSummary: Array<ProfileSummary> = this.calculateDayTypeProfileSummary(compressedAirAssessment, dayType);
      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment, dayType, baselineProfileSummary);
      let baselineResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(baselineProfileSummary, dayType, compressedAirAssessment.systemBasics.electricityCost);
      let totalOperatingHours: number = dayType.numberOfDays * 24;
      let averageAirFlow: number = _.meanBy(totals, (total) => { return total.airflow });
      let averagePower: number = _.meanBy(totals, (total) => {return total.power});
      dayTypeResults.push({
        cost: baselineResults.cost,
        energyUse: baselineResults.power,
        peakDemand: baselineResults.peakDemand,
        name: dayType.name,
        averageAirFlow: averageAirFlow,
        averageAirFlowPercentCapacity: averageAirFlow / totalFullLoadCapacity * 100,
        operatingDays: dayType.numberOfDays,
        totalOperatingHours: totalOperatingHours,
        loadFactorPercent: averagePower / totalFullLoadPower * 100
      });
    });

    let sumAverages: number = 0;
    let totalDays: number = 0;
    let sumAveragePercent: number = 0;
    let sumAverageLoadFactor: number = 0;
    dayTypeResults.forEach(result => {
      totalDays = totalDays + result.operatingDays;
      sumAverages = sumAverages + (result.averageAirFlow * result.operatingDays);
      sumAveragePercent = sumAveragePercent + (result.averageAirFlowPercentCapacity * result.operatingDays);
      sumAverageLoadFactor = sumAverageLoadFactor + (result.loadFactorPercent * result.operatingDays);
    });

    let annualEnergyCost: number = _.sumBy(dayTypeResults, (result) => { return result.cost });
    let peakDemand: number = _.maxBy(dayTypeResults, (result) => { return result.peakDemand }).peakDemand;
    let demandCost: number = peakDemand * 12 * compressedAirAssessment.systemBasics.demandCost;

    return {
      dayTypeResults: dayTypeResults,
      total:{
        cost: annualEnergyCost,
        peakDemand: peakDemand,
        energyUse: _.sumBy(dayTypeResults, (result) => { return result.energyUse }),
        name: 'System Totals',
        averageAirFlow: (sumAverages / totalDays),
        averageAirFlowPercentCapacity: sumAveragePercent / totalDays,
        operatingDays: totalDays,
        totalOperatingHours: totalDays * 24,
        loadFactorPercent: sumAverageLoadFactor / totalDays
      },
      demandCost: demandCost,
      totalAnnualOperatingCost: demandCost + annualEnergyCost
    }
  }



  calculateModificationResults(compressedAirAssessment: CompressedAirAssessment, modification: Modification): CompressedAirAssessmentResult {
    let modificationOrders: Array<number> = [
      modification.addPrimaryReceiverVolume.order,
      modification.adjustCascadingSetPoints.order,
      modification.improveEndUseEfficiency.order,
      modification.reduceRuntime.order,
      modification.reduceAirLeaks.order,
      modification.reduceSystemAirPressure.order,
      modification.useAutomaticSequencer.order,
      modification.useUnloadingControls.order,
    ]
    modificationOrders = modificationOrders.filter(order => { return order != 100 });
    let modificationResults: Array<DayTypeModificationResult> = new Array();
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      // let addReceiverVolumeResults: EemSavingsResults = this.getEmptyEemSavings();
      // let adjustCascadingSetPointsResults: EemSavingsResults = this.getEmptyEemSavings();
      // let improveEndUseEfficiencyResults: EemSavingsResults = this.getEmptyEemSavings();
      // let reduceAirLeaksResults: EemSavingsResults = this.getEmptyEemSavings();
      // let reduceRunTimeResults: EemSavingsResults = this.getEmptyEemSavings();
      // let reduceSystemAirPressureResults: EemSavingsResults = this.getEmptyEemSavings();
      // let useAutomaticSequencerResults: EemSavingsResults = this.getEmptyEemSavings();
      // let useUnloadingControlsResults: EemSavingsResults = this.getEmptyEemSavings();

      let baselineProfileSummary: Array<ProfileSummary> = this.calculateDayTypeProfileSummary(compressedAirAssessment, dayType);
      //1. start with flow allocation
      let adjustedProfileSummary: Array<ProfileSummary> = this.flowReallocation(compressedAirAssessment, dayType, modification, true, baselineProfileSummary);
      //2. iterate modification orders
      for (let i = 0; i < modificationOrders.length; i++) {
        let order: number = modificationOrders[i];
        if (modification.addPrimaryReceiverVolume.order == order) {

        } else if (modification.adjustCascadingSetPoints.order == order) {

        } else if (modification.improveEndUseEfficiency.order == order) {

        } else if (modification.reduceRuntime.order == order) {

        } else if (modification.reduceAirLeaks.order == order) {

        } else if (modification.reduceSystemAirPressure.order == order) {

        } else if (modification.useAutomaticSequencer.order == order) {

        } else if (modification.useUnloadingControls.order == order) {

        }
      }


      let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment, dayType, adjustedProfileSummary);
      let allSavingsResults: EemSavingsResults = this.calculateSavings(baselineProfileSummary, adjustedProfileSummary, dayType, compressedAirAssessment.systemBasics.electricityCost);

      
      modificationResults.push({
        adjustedProfileSummary: adjustedProfileSummary,
        profileSummaryTotals: totals,
        dayTypeId: dayType.dayTypeId,
        allSavingsResults: allSavingsResults,
        // flowReallocationResults: flowReallocationResults,
        // addReceiverVolumeResults: addReceiverVolumeResults,
        // adjustCascadingSetPointsResults: adjustCascadingSetPointsResults,
        // improveEndUseEfficiencyResults: improveEndUseEfficiencyResults,
        // reduceAirLeaksResults: reduceAirLeaksResults,
        // reduceRunTimeResults: reduceRunTimeResults,
        // reduceSystemAirPressureResults: reduceSystemAirPressureResults,
        // useAutomaticSequencerResults: useAutomaticSequencerResults,
        // useUnloadingControlsResults: useUnloadingControlsResults,
      });
    });
    return {
      dayTypeModificationResults: modificationResults,
      totalBaselineCost: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.baselineResults.cost }),
      totalBaselinePower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.baselineResults.power }),
      totalModificationCost: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.adjustedResults.cost }),
      totalModificationPower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.adjustedResults.power }),
      totalCostSavings: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.savings.cost }),
      totalCostPower: _.sumBy(modificationResults, (result) => { return result.allSavingsResults.savings.power }),
      modification: modification
    }
  }



  calculateDayTypeProfileSummary(compressedAirAssessment: CompressedAirAssessment, dayType: CompressedAirDayType): Array<ProfileSummary> {
    let inventoryItems: Array<CompressorInventoryItem> = compressedAirAssessment.compressorInventoryItems;
    let selectedProfileSummary: Array<ProfileSummary> = compressedAirAssessment.systemProfile.profileSummary;
    let selectedDayTypeSummary: Array<ProfileSummary> = new Array();
    let totalFullLoadCapacity: number = this.getTotalCapacity(inventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(inventoryItems);
    selectedProfileSummary.forEach(summary => {
      let compressor: CompressorInventoryItem = inventoryItems.find(item => { return item.itemId == summary.compressorId });
      if (summary.dayTypeId == dayType.dayTypeId) {
        summary.profileSummaryData.forEach(summaryData => {
          let computeFrom: 1 | 2 | 3;
          let computeFromVal: number;
          if (dayType.profileDataType == 'power') {
            computeFrom = 2;
            computeFromVal = summaryData.power;
          } else if (dayType.profileDataType == 'percentCapacity') {
            computeFrom = 1;
            computeFromVal = summaryData.percentCapacity;
          } else if (dayType.profileDataType == 'airflow') {
            computeFrom = 3;
            computeFromVal = summaryData.airflow;
          }
          let calcResult: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, computeFrom, computeFromVal, 0, true);
          summaryData.airflow = calcResult.capacityCalculated;
          summaryData.power = calcResult.powerCalculated;
          summaryData.percentCapacity = calcResult.percentageCapacity;
          summaryData.percentPower = calcResult.percentagePower;
          summaryData.percentSystemCapacity = (calcResult.capacityCalculated / totalFullLoadCapacity) * 100;
          summaryData.percentSystemPower = (calcResult.powerCalculated / totalFullLoadPower) * 100
        });
        selectedDayTypeSummary.push(summary);
      }
    });
    return selectedDayTypeSummary;
  }

  calculateProfileSummaryTotals(compressedAirAssessment: CompressedAirAssessment, selectedDayType: CompressedAirDayType, profileSummary: Array<ProfileSummary>): Array<ProfileSummaryTotal> {
    let totalSystemCapacity: number = this.getTotalCapacity(compressedAirAssessment.compressorInventoryItems);
    let totalFullLoadPower: number = this.getTotalPower(compressedAirAssessment.compressorInventoryItems);

    let allData: Array<ProfileSummaryData> = new Array();
    profileSummary.forEach(summary => {
      if (summary.dayTypeId == selectedDayType.dayTypeId) {
        allData = allData.concat(summary.profileSummaryData);
      }
    });
    let totals: Array<ProfileSummaryTotal> = new Array();
    let intervals: Array<number> = allData.map(data => { return data.timeInterval });
    intervals = _.uniq(intervals);
    intervals.forEach(interval => {
      let filteredData: Array<ProfileSummaryData> = allData.filter(data => { return data.timeInterval == interval && data.order != 0 });
      let totalAirFlow: number = _.sumBy(filteredData, 'airflow');
      let totalPower: number = _.sumBy(filteredData, 'power');
      totals.push({
        airflow: totalAirFlow,
        power: totalPower,
        percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
        percentPower: (totalPower / totalFullLoadPower) * 100,
        timeInterval: interval
      });
    });
    return totals;
  }

  flowReallocation(compressedAirAssessment: CompressedAirAssessment, dayType: CompressedAirDayType, modification: Modification, applyEEEMs: boolean, baselineProfileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(compressedAirAssessment, dayType, baselineProfileSummary);
    let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(baselineProfileSummary));
    adjustedProfileSummary = adjustedProfileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    adjustedProfileSummary.forEach(summary => {
      summary.profileSummaryData = new Array();
    });
    totals.forEach(total => {
      adjustedProfileSummary = this.calculatedNeededAirFlow(total, compressedAirAssessment, adjustedProfileSummary, dayType, modification, applyEEEMs);
    });
    return adjustedProfileSummary;
  }

  calculatedNeededAirFlow(total: ProfileSummaryTotal, compressedAirAssessment: CompressedAirAssessment, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, modification: Modification, applyEEEMs: boolean): Array<ProfileSummary> {
    let neededAirFlow: number = total.airflow;
    if (applyEEEMs) {
      //EEM: Reduce Air leaks
      if (modification.reduceAirLeaks.selected) {
        neededAirFlow = neededAirFlow - (modification.reduceAirLeaks.leakReduction / 100 * modification.reduceAirLeaks.leakFlow);
      }
      //EEM: Improve End use Efficiency
      if (modification.improveEndUseEfficiency.selected) {
        let reductionData: {
          dayTypeId: string;
          dayTypeName: string;
          data: Array<{
            hourInterval: number;
            applyReduction: boolean;
            reductionAmount: number;
          }>
        } = modification.improveEndUseEfficiency.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
        let intervalReductionData = reductionData.data.find(rData => { return rData.hourInterval == total.timeInterval });
        if (modification.improveEndUseEfficiency.reductionType == 'Fixed') {
          if (intervalReductionData.applyReduction) {
            neededAirFlow = neededAirFlow - modification.improveEndUseEfficiency.airflowReduction;
          }
        } else if (modification.improveEndUseEfficiency.reductionType == 'Variable') {
          if (intervalReductionData.reductionAmount) {
            neededAirFlow = neededAirFlow - intervalReductionData.reductionAmount;
          }
        }
      }
    }
    let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
    compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
      if (summary.dayTypeId == dayType.dayTypeId) {
        intervalData.push({
          compressorId: summary.compressorId,
          summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == total.timeInterval })
        });
      }
    });

    //adjust compressors
    let adjustedCompressors: Array<CompressorInventoryItem> = new Array();
    compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
      let compressorCopy: CompressorInventoryItem = JSON.parse(JSON.stringify(compressor));
      if (applyEEEMs) {
        //EEM: Use unloading controls
        if (modification.useUnloadingControls.selected) {
          compressorCopy = this.adjustCompressorControl(modification, compressorCopy);
        }
        //EEM: Reduce System Pressure
        if (modification.reduceSystemAirPressure.selected) {
          let originalPressure: number = compressorCopy.performancePoints.fullLoad.dischargePressure;
          compressorCopy.performancePoints.fullLoad.dischargePressure = compressorCopy.performancePoints.fullLoad.dischargePressure - modification.reduceSystemAirPressure.averageSystemPressureReduction;
          compressorCopy.performancePoints.fullLoad.isDefaultPressure = false;
          compressorCopy.performancePoints.fullLoad.airflow = this.calculateReducedAirFlow(compressorCopy.performancePoints.fullLoad.airflow, compressorCopy.performancePoints.fullLoad.dischargePressure, compressorCopy.inletConditions.atmosphericPressure, originalPressure);
          compressorCopy.performancePoints.fullLoad.isDefaultAirFlow = false;
          compressorCopy.performancePoints.fullLoad.isDefaultPower = true;
          compressorCopy.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(compressorCopy);
        }
      }
      adjustedCompressors.push(compressorCopy);
    });
    //calc totals for system percentages
    let totalFullLoadCapacity: number = this.getTotalCapacity(adjustedCompressors);
    let totalFullLoadPower: number = this.getTotalPower(adjustedCompressors);

    intervalData = _.orderBy(intervalData, (data) => { return data.summaryData.order });
    intervalData.forEach(data => {
      let isTurnedOn: boolean = data.summaryData.order != 0;
      let additionalRecieverVolume: number = 0
      if (applyEEEMs) {
        //EEM: Reduce run time
        if (modification.reduceRuntime.selected) {
          let reduceRuntime: ReduceRuntimeData = modification.reduceRuntime.runtimeData.find(dataItem => {
            return dataItem.compressorId == data.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
          });
          let intervalData: { isCompressorOn: boolean, timeInterval: number } = reduceRuntime.intervalData.find(iData => { return iData.timeInterval == data.summaryData.timeInterval });
          isTurnedOn = intervalData.isCompressorOn;
        }
        //EEM: Add primary receiver volume
        if (modification.addPrimaryReceiverVolume.selected) {
          additionalRecieverVolume = modification.addPrimaryReceiverVolume.increasedVolume;
        }
      }
      if ((data.summaryData.order != 0 && isTurnedOn) && Math.abs(neededAirFlow) > 0.01) {
        let compressor: CompressorInventoryItem = adjustedCompressors.find(item => { return item.itemId == data.compressorId });
        let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
        //calc with full load
        let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow, additionalRecieverVolume, true);
        let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
        //if excess air added then reduce amount and calc again
        if (tmpNeededAirFlow < 0) {
          calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressor, 3, fullLoadAirFlow + tmpNeededAirFlow, additionalRecieverVolume, true);
          tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
        }
        neededAirFlow = tmpNeededAirFlow;


        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: calculateFullLoad.powerCalculated,
          airflow: calculateFullLoad.capacityCalculated,
          percentCapacity: calculateFullLoad.percentageCapacity,
          timeInterval: data.summaryData.timeInterval,
          percentPower: calculateFullLoad.percentagePower,
          percentSystemCapacity: (calculateFullLoad.capacityCalculated / totalFullLoadCapacity) * 100,
          percentSystemPower: (calculateFullLoad.powerCalculated / totalFullLoadPower) * 100,
          order: data.summaryData.order,
        });
      } else {
        let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
        adjustedProfileSummary[adjustedIndex].profileSummaryData.push({
          power: 0,
          airflow: 0,
          percentCapacity: 0,
          timeInterval: data.summaryData.timeInterval,
          percentPower: 0,
          percentSystemCapacity: 0,
          percentSystemPower: 0,
          order: data.summaryData.order,
        });
      }
    });
    return adjustedProfileSummary;
  }


  adjustCompressorControl(modification: Modification, compressorCopy: CompressorInventoryItem): CompressorInventoryItem {
    let adjustedCompressor: AdjustedUnloadingCompressor = modification.useUnloadingControls.adjustedCompressors.find(adjustedCompressor => {
      return (adjustedCompressor.compressorId == compressorCopy.itemId);
    });
    let adjustedCompressorCopy: AdjustedUnloadingCompressor = JSON.parse(JSON.stringify(adjustedCompressor))
    compressorCopy.compressorControls.controlType = adjustedCompressorCopy.controlType;
    compressorCopy.performancePoints = adjustedCompressorCopy.performancePoints;
    compressorCopy.compressorControls.unloadPointCapacity = adjustedCompressorCopy.unloadPointCapacity;
    compressorCopy.compressorControls.automaticShutdown = adjustedCompressorCopy.automaticShutdown;
    return compressorCopy;
  }


  calculateSavings(profileSummary: Array<ProfileSummary>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): EemSavingsResults {
    let baselineResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(profileSummary, dayType, costKwh);
    let adjustedResults: { cost: number, power: number, peakDemand: number } = this.calculateEnergyAndCost(adjustedProfileSummary, dayType, costKwh);
    let savings: { cost: number, power: number, peakDemand: number, percentSavings: number } = {
      cost: baselineResults.cost - adjustedResults.cost,
      power: baselineResults.power - adjustedResults.power,
      peakDemand: baselineResults.peakDemand - adjustedResults.peakDemand,
      percentSavings: ((baselineResults.cost - adjustedResults.cost) / baselineResults.cost) * 100,
    };
    return {
      baselineResults: baselineResults,
      adjustedResults: adjustedResults,
      savings: savings,
      dayTypeId: dayType.dayTypeId
    }
  }


  calculateEnergyAndCost(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number): { cost: number, power: number, peakDemand: number } {
    let filteredSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    let flatSummaryData: Array<ProfileSummaryData> = _.flatMap(filteredSummary, (summary) => { return summary.profileSummaryData });
    flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
    let peakDemand: ProfileSummaryData = _.maxBy(flatSummaryData, 'power');
    let sumPower: number = _.sumBy(flatSummaryData, 'power');
    //todo: divide sumPower by hourInterval amount
    sumPower = sumPower * dayType.numberOfDays;
    let sumCost: number = sumPower * costKwh;
    return {
      cost: sumCost,
      peakDemand: peakDemand.power,
      power: sumPower
    }
  }

  calculateReducedAirFlow(c_usage: number, p_fl_rpred: number, p_alt: number, p_fl: number): number {
    let p: number = (p_fl_rpred + p_alt) / (p_fl + 14.7);
    return (c_usage - (c_usage - (c_usage * p)) * .6)
  }



  getEmptyEemSavings(): EemSavingsResults {
    return {
      baselineResults: {
        cost: 0,
        power: 0,
        peakDemand: 0
      },
      adjustedResults: {
        cost: 0,
        power: 0,
        peakDemand: 0
      },
      savings: {
        cost: 0,
        power: 0,
        peakDemand: 0,
        percentSavings: 0
      },
      dayTypeId: undefined,
    };
  }

  getTotalCapacity(inventoryItems: Array<CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
  }

  getTotalPower(inventoryItems: Array<CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
      return inventoryItem.performancePoints.fullLoad.power;
    });
  }

}


export interface CompressedAirAssessmentResult {
  dayTypeModificationResults: Array<DayTypeModificationResult>,
  totalBaselineCost: number,
  totalBaselinePower: number,
  totalModificationCost: number,
  totalModificationPower: number,
  totalCostSavings: number,
  totalCostPower: number,
  modification: Modification
}

export interface DayTypeModificationResult {
  adjustedProfileSummary: Array<ProfileSummary>,
  profileSummaryTotals: Array<ProfileSummaryTotal>,
  allSavingsResults: EemSavingsResults,
  // flowReallocationResults: EemSavingsResults,
  // addReceiverVolumeResults: EemSavingsResults,
  // adjustCascadingSetPointsResults: EemSavingsResults,
  // improveEndUseEfficiencyResults: EemSavingsResults,
  // reduceAirLeaksResults: EemSavingsResults,
  // reduceRunTimeResults: EemSavingsResults,
  // reduceSystemAirPressureResults: EemSavingsResults,
  // useAutomaticSequencerResults: EemSavingsResults,
  // useUnloadingControlsResults: EemSavingsResults,
  dayTypeId: string

}


export interface EemSavingsResults {
  baselineResults: { cost: number, power: number, peakDemand: number },
  adjustedResults: { cost: number, power: number, peakDemand: number },
  savings: { cost: number, power: number, peakDemand: number, percentSavings: number },
  dayTypeId: string,
}

export interface BaselineResults {
  total: BaselineResult,
  dayTypeResults: Array<BaselineResult>,
  demandCost: number,
  totalAnnualOperatingCost: number
}

export interface BaselineResult {
  cost: number,
  energyUse: number,
  peakDemand: number,
  name: string,
  averageAirFlow: number,
  averageAirFlowPercentCapacity: number,
  operatingDays: number,
  totalOperatingHours: number,
  loadFactorPercent: number

}