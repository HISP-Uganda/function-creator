import {action, computed, observable} from 'mobx';

import * as _ from 'lodash'

const mockData = [];
for (let i = 0; i < 20; i++) {
    mockData.push({
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        disabled: i % 3 < 1,
    });
}


export class Test {
    @observable selectedPeriods = [];
    @observable availablePeriods = [];
    @observable selectedUnits = undefined;
    @observable periodType = 'Monthly';
    @observable currentYear = new Date().getFullYear();
    @observable showPeriod = false;
    @observable showUnit = false;



    @action setSelectedPeriods = (val) => this.selectedPeriods = val;
    @action setSelectedUnits = (val) => this.selectedUnits = val;
    @action setAvailablePeriods = (val) => this.availablePeriods = val;
    @action setYear = (val) => this.currentYear = val;
    @action addOneYear = () => this.setYear(this.currentYear + 1);
    @action subOneYear = () => this.setYear(this.currentYear - 1);
    @action setPeriodType = (val) => this.periodType = val;

    @action setShowPeriod = (val) => this.showPeriod = val;
    @action setShowUnit = (val) => this.showUnit = val;

    @action closeOUDialog = () => this.setShowUnit(false);
    @action closePeriodDialog = () => this.setShowPeriod(false);

    @action openOUDialog = () => this.setShowUnit(true);
    @action openPeriodDialog = () => this.setShowPeriod(true);

    @action okOuDialog = () => {
        console.log('Working');
        this.closeOUDialog();
    };

    @action okPeriodDialog = () => {
        console.log('Working Period');
        this.closePeriodDialog();
    };


    @computed get getPeriodArray() {
        const last_year = this.currentYear - 1;
        switch (this.periodType) {
            case 'Monthly':
                return [
                    {
                        key: this.currentYear + '12',
                        title: 'December ' + this.currentYear,
                        description: 'December ' + this.currentYear
                    },
                    {
                        key: this.currentYear + '11',
                        title: 'November ' + this.currentYear,
                        description: 'November ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '10',
                        title: 'October ' + this.currentYear,
                        description: 'October ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '09',
                        title: 'September ' + this.currentYear,
                        description: 'September ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '08',
                        title: 'August ' + this.currentYear,
                        description: 'August ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '07',
                        title: 'July ' + this.currentYear,
                        description: 'July ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '06',
                        title: 'June ' + this.currentYear,
                        description: 'June ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '05',
                        title: 'May ' + this.currentYear,
                        description: 'May ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '04',
                        title: 'April ' + this.currentYear,
                        description: 'April ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '03',
                        title: 'March ' + this.currentYear,
                        description: 'March ' + this.currentYear
                    },
                    {
                        key: this.currentYear + '02',
                        title: 'February ' + this.currentYear,
                        description: 'February ' + this.currentYear
                    },
                    {
                        key: this.currentYear + '01',
                        title: 'January ' + this.currentYear,
                        description: 'January ' + this.currentYear
                    }
                ];
            case 'BiMonthly':
                return [
                    {
                        key: this.currentYear + '01B',
                        title: 'January - February ' + this.currentYear,
                        description: 'January - February ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '02B',
                        title: 'March - April ' + this.currentYear,
                        description: 'March - April ' + this.currentYear
                    },
                    {
                        key: this.currentYear + '03B',
                        title: 'May - June ' + this.currentYear,
                        description: 'May - June ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '04B',
                        title: 'July - August ' + this.currentYear,
                        description: 'July - August ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '05B',
                        title: 'September - October ' + this.currentYear,
                        description: 'September - October ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + '06B',
                        title: 'November - December ' + this.currentYear,
                        description: 'November - December ' + this.currentYear,
                    }
                ];
            case 'Quarterly':
                return [
                    {
                        key: this.currentYear + 'Q4',
                        title: 'October - December ' + this.currentYear,
                        description: 'October - December ' + this.currentYear
                    },
                    {
                        key: this.currentYear + 'Q3',
                        title: 'July - September ' + this.currentYear,
                        description: 'July - September ' + this.currentYear
                    },
                    {
                        key: this.currentYear + 'Q2',
                        title: 'April - June ' + this.currentYear,
                        description: 'April - June ' + this.currentYear
                    },
                    {
                        key: this.currentYear + 'Q1',
                        title: 'January - March ' + this.currentYear,
                        description: 'January - March ' + this.currentYear
                    }
                ];
            case 'SixMonthly':
                return [
                    {
                        key: this.currentYear + 'S1',
                        title: 'January - June ' + this.currentYear,
                        description: 'January - June ' + this.currentYear,
                    },
                    {
                        key: this.currentYear + 'S2',
                        title: 'July - December ' + this.currentYear,
                        description: 'July - December ' + this.currentYear
                    }
                ];
            case 'SixMonthlyApril':
                const useYear = this.currentYear + 1;
                return [
                    {
                        key: this.currentYear + 'AprilS2',
                        title: 'October ' + this.currentYear + ' - March ' + useYear,
                        description: 'October ' + this.currentYear + ' - March ' + useYear,
                    },
                    {
                        key: this.currentYear + 'AprilS1',
                        title: 'April - September ' + this.currentYear,
                        description: 'April - September ' + this.currentYear,
                    }
                ];
            case 'FinancialOct':
                return _.range(0, 12).map((i) => {
                    const useYear = this.currentYear - i;
                    const currentYear = useYear + 1;

                    return {
                        key: useYear + 'Oct',
                        title: 'October ' + useYear + ' - September ' + currentYear,
                        description: 'October ' + useYear + ' - September ' + currentYear,
                    }
                });


            case 'Yearly':
                return _.range(0, 12).map((i) => {
                    const useYear = this.currentYear - i;
                    return {
                        key: useYear,
                        title: useYear,
                        description: useYear
                    }
                });

            case 'FinancialJuly':

                return _.range(0, 12).map((i) => {
                    const useYear = this.currentYear - i;
                    const currentYear = useYear + 1;
                    return {
                        key: useYear + 'July',
                        title: 'July ' + useYear + ' - June ' + currentYear,
                        description: 'July ' + useYear + ' - June ' + currentYear
                    }
                });


            case 'FinancialApril':

                return _.range(0, 12).map((i) => {
                    const useYear = this.currentYear - i;
                    const currentYear = useYear + 1;
                    return {
                        key: useYear + 'April',
                        title: 'April ' + useYear + ' - March ' + currentYear,
                        description: 'April ' + useYear + ' - March ' + currentYear
                    }
                });
            case 'Relative Weeks':
                return [
                    {
                        key: 'THIS_WEEK',
                        title: 'This Week',
                        description: 'This Week',
                    },
                    {
                        key: 'LAST_WEEK',
                        title: 'Last Week',
                        description: 'Last Week',
                    },
                    {
                        key: 'LAST_4_WEEK',
                        title: 'Last 4 Weeks',
                        description: 'Last 4 Weeks',
                    },
                    {
                        key: 'LAST_12_WEEK',
                        title: 'last 12 Weeks',
                        description: 'last 12 Weeks',
                    },
                    {
                        key: 'LAST_52_WEEK',
                        title: 'Last 52 weeks',
                        description: 'Last 52 weeks',
                    }
                ];
            case 'RelativeMonth':
                return [
                    {
                        key: 'THIS_MONTH',
                        title: 'This Month',
                        description: 'This Month',
                    },
                    {
                        key: 'LAST_MONTH',
                        title: 'Last Month',
                        description: 'Last Month',
                    },
                    {
                        key: 'LAST_3_MONTHS',
                        title: 'Last 3 Months',
                        description: 'Last 3 Months',
                    },
                    {
                        key: 'LAST_6_MONTHS',
                        title: 'Last 6 Months',
                        description: 'Last 6 Months',
                    },
                    {
                        key: 'LAST_12_MONTHS',
                        title: 'Last 12 Months',
                        description: 'Last 12 Months'
                    },
                    {
                        key: `${this.currentYear}01;${this.currentYear}02;${this.currentYear}03;${this.currentYear}04;${this.currentYear}05;${this.currentYear}06;${this.currentYear}07;${this.currentYear}08;${this.currentYear}09;${this.currentYear}10;${this.currentYear}11;${this.currentYear}12`,
                        title: 'Month This Year',
                        description: 'Month This Year',
                    },
                    {
                        key: `${last_year}01;${last_year}02;${last_year}03;${last_year}04;${last_year}05;${last_year}06;${last_year}07;${last_year}08;${last_year}09;${last_year}10;${last_year}11;${last_year}12`,
                        title: 'Month Last Year',
                        description: 'Month Last Year',
                    }
                ];
            case 'RelativeBiMonth':
                return [
                    {
                        key: 'THIS_BIMONTH',
                        title: 'This Bi-month',
                        description: 'This Bi-month',
                    },
                    {
                        key: 'LAST_BIMONTH',
                        title: 'Last Bi-month',
                        description: 'Last Bi-month',
                    },
                    {
                        key: 'LAST_6_BIMONTHS',
                        title: 'Last 6 Bi-Month',
                        description: 'Last 6 Bi-Month',
                    }
                ];
            case 'RelativeQuarter':
                return [
                    {
                        key: 'THIS_QUARTER',
                        title: 'This Quarter',
                        description: 'This Quarter',
                    },
                    {
                        key: 'LAST_QUARTER',
                        title: 'Last Quarter',
                        description: 'Last Quarter',
                    },
                    {
                        key: 'LAST_4_QUARTERS',
                        title: 'Last 4 Quarters',
                        description: 'Last 4 Quarters',
                    },
                    {
                        key: `${this.currentYear}Q1;${this.currentYear}Q2;${this.currentYear}Q3;${this.currentYear}Q4`,
                        title: 'Quarters This Year',
                        description: 'Quarters This Year',
                    },
                    {
                        key: `${last_year}Q1;${last_year}Q2;${last_year}Q3;${last_year}Q4`,
                        title: 'Quarters Last Year',
                        description: 'Quarters Last Year',
                    }
                ];
            case 'RelativeSixMonthly':
                return [
                    {
                        key: 'THIS_SIX_MONTH',
                        title: 'This Six-month',
                        description: 'This Six-month',
                    },
                    {
                        key: 'LAST_SIX_MONTH',
                        title: 'Last Six-month',
                        description: 'Last Six-month',
                    },
                    {
                        key: 'LAST_2_SIXMONTHS',
                        title: 'Last 2 Six-month',
                        description: 'Last 2 Six-month',
                    }
                ];
            case 'RelativeFinancialYear':
                return [
                    {
                        key: 'THIS_FINANCIAL_YEAR',
                        title: 'This Financial Year',
                        description: 'This Financial Year',
                    },
                    {
                        key: 'LAST_FINANCIAL_YEAR',
                        title: 'Last Financial Year',
                        description: 'Last Financial Year',
                    },
                    {
                        key: 'LAST_5_FINANCIAL_YEARS',
                        title: 'Last 5 Financial Years',
                        description: 'Last 5 Financial Years',
                    }
                ];
            case 'RelativeYear':
                return [
                    {
                        key: 'THIS_YEAR',
                        title: 'This Year',
                        description: 'This Year',
                    },
                    {
                        key: 'LAST_YEAR',
                        title: 'Last Year',
                        description: 'Last Year',
                    },
                    {
                        key: 'LAST_5_YEARS',
                        title: 'Last 5 Five Years',
                        description: 'Last 5 Five Years',
                    }
                ];
            default:
                return [];
        }

    };

    @action
    handleChange = (nextTargetKeys, direction, moveKeys) => {
        this.setSelectedPeriods(nextTargetKeys);
    };
    @action
    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setAvailablePeriods([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

}
