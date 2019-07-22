import {action, computed, observable, toJS} from 'mobx';
import {Indicator} from './Indicator';
import {Rule} from "./Rule";
import {Condition} from "./Condition";
import {generateUid} from "../utils";
import * as _ from 'lodash';
import {Test} from "./Test";

class Store {

    @observable d2;
    @observable progress = 0;
    @observable dataElements;
    @observable spinning = true;
    @observable indicators = [];
    @observable indicator = new Indicator();

    @observable numeratorDialogOpen = false;
    @observable denominatorDialogOpen = false;

    @observable organisationUnitGroups = [];
    @observable organisationLevels = [];
    @observable showing = true;
    @observable indicatorValue = null;
    @observable search = {};
    @observable dataSets = [];
    @observable indicatorSearch = '';
    @observable dataSetSearch = '';
    @observable ouGroupSearch = '';
    @observable treeData = [];
    @observable testing = new Test();

    @observable orgUnitDialog = {
        open: false,
    };

    @observable root = undefined;
    @observable userOrgUnits = [];

    @observable selected = [];
    @observable group = [];
    @observable level = [];
    @observable levelOptions = [];
    @observable groupOptions = [];

    @observable selectedPeriods = [{
        id: 'LAST_QUARTER', name: 'Last quarter'
    }];
    @observable dialogOpened = false;

    @observable setOrgUnitDialog = (val) => this.orgUnitDialog = val;
    @observable setRoot = (val) => this.root = val;
    @observable setSelected = (val) => this.selected = val;
    @observable setGroup = (val) => this.group = val;
    @observable setUserOrgUnits = (val) => this.userOrgUnits = val;
    @observable setLevel = (val) => this.level = val;
    @observable setLevelOptions = (val) => this.levelOptions = val;
    @observable setGroupOptions = (val) => this.groupOptions = val;

    @action setD2 = (val) => this.d2 = val;
    @action addProgress = (val) => this.progress = this.progress + val;
    @action setSpinning = (val) => this.spinning = val;
    @action setDataElements = (val) => this.dataElements = val;
    @action setIndicators = (val) => this.indicators = val;
    @action setIndicator = (val) => this.indicator = val;
    @action setOrganisationUnitGroups = (val) => this.organisationUnitGroups = val;
    @action setOrganisationLevels = (val) => this.organisationLevels = val;
    @action setNumeratorDialogOpen = (val) => this.numeratorDialogOpen = val;
    @action setShowing = (val) => this.showing = val;
    @action startSpinning = () => this.setSpinning(true);
    @action stopSpinning = () => this.setSpinning(false);
    @action showIndicators = () => this.setShowing(true);
    @action showIndicator = () => this.setShowing(false);
    @action setIndicatorValue = (val) => this.indicatorValue = val;
    @action openNumerator = () => this.setNumeratorDialogOpen(true);
    @action setSearch = (field, val) => this.search = {[field]: val};
    @action setIndicatorSearch = (val) => this.indicatorSearch = val;
    @action setDataSets = (val) => this.dataSets = val;
    @action setTreeData = (val) => this.treeData = val;
    @action setDialogOpened = (val) => this.dialogOpened = val;

    @action setSelectedPeriods = (val) => {
        this.selectedPeriods = val;

    };

    @action onDeselect = (val) => {
        const toBeDeselected = val.map(v => v.id);
        const periods = this.selectedPeriods.filter(p => {
            return toBeDeselected.indexOf(p.id) === -1
        });

        this.setSelectedPeriods(periods);

    };
    @action searchChange = (field) => (event) => this.setSearch(field, event.target.value);
    @action searchIndicatorChange = (event) => this.setIndicatorSearch(event.target.value);

    @action closeNumerator = () => {
        this.indicator.setNumerator('');
        this.setNumeratorDialogOpen(false);
    };

    @action fetchRootOrganisations = async () => {
        const api = this.d2.Api.getApi();
        const {organisationUnits} = await api.get('organisationUnits.json?level=1&fields=id~rename(key),name~rename(title)');
        this.setTreeData(organisationUnits)
    };


    @action onUpdate = async (selectedPeriods) => {
        if (selectedPeriods.length > 0) {
            await this.call();
        }
        this.setDialogOpened(false);
    };

    @action onClose = () => {
        this.setDialogOpened(false);
    };

    @action togglePeriodDialog = () => {
        this.setDialogOpened(!this.dialogOpened);
    };

    @action onReorder = () => {

    };

    @action fetchRoot = () => {
        this.d2
            .models
            .organisationUnits
            .list({
                paging: false,
                level: 1,
                fields: `id,path,displayShortName~rename(displayName),children::isNotEmpty`,
            })
            .then((rootLevel) => rootLevel.toArray()[0])
            .then((loadRootUnit) => {
                this.setSelected([{id: loadRootUnit.id, path: loadRootUnit.path}]);
                this.setRoot(loadRootUnit)
            });

        this.loadOrgUnitLevels();
        this.loadOrgUnitGroups();
    };

    fetchLevels = async () => {
        const api = this.d2.Api.getApi();
        const {organisationUnitLevels} = await api.get('organisationUnitLevels.json?fields=level');
        const a = organisationUnitLevels.map((l) => {
            return l.level;
        });
        return Math.max.apply(Math, a);
    };

    formatDate = (date) => {
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        const monthString = month < 10 ? '0' + month : month;

        return `${year}${monthString}`
    };


    @action onOrgUnitSelect = async () => {
        // const selectedOrgUnits = this.userOrgUnits.length > 0
        //     ? this.userOrgUnits
        //     : this.selected;
        // console.log(this.userOrgUnits);
        // this.setSelected(selectedOrgUnits);

        if (this.selected.length > 0 && this.selectedPeriods.length > 0) {
            await this.call();
        }
        // console.log(selectedOrgUnits.join(', '));
        // console.log(this.level);
        // console.log(this.group);
        this.setOrgUnitDialog(false);
    };

    @action onLevelChange = (event) => {
        this.setLevel(event.target.value)
    };

    @action onGroupChange = (event) => {
        this.setGroup(event.target.value);
    };

    @action onDeselectAllClick = () => {
        this.setSelected([])
    };


    @action toggleDialog = () => {
        this.setOrgUnitDialog({
            open: !this.orgUnitDialog.open,
        })
    };

    @action loadOrgUnitGroups = () => {
        this.d2
            .models
            .organisationUnitGroups
            .list({
                fields: `id,displayShortName~rename(displayName)`,
                paging: false,
            })
            .then((collection) => collection.toArray())
            .then((groupOptions) => this.setGroupOptions(groupOptions));
    };

    @action loadOrgUnitLevels = () => {
        this.d2
            .models
            .organisationUnitLevels
            .list({paging: false})
            .then((collection) => collection.toArray())
            .then((levelOptions) => this.setLevelOptions(levelOptions));
    };


    @action handleOrgUnitClick = (event, orgUnit) => {
        if (this.selected.some((ou) => ou.path === orgUnit.path)) {
            this.setSelected(this.selected.filter((ou) => ou.path !== orgUnit.path))
        } else {
            this.setSelected([
                ...this.selected,
                {id: orgUnit.id, displayName: orgUnit.displayName, path: orgUnit.path},
            ]);
        }
    };

    @action handleMultipleOrgUnitsSelect = (children) => {
        const selected = [
            ...this.selected,
            ...children.map((orgUnit) => ({
                id: orgUnit.id,
                displayName: orgUnit.displayName,
                path: orgUnit.path,
            })),
        ];

        this.setSelected(selected);
    };

    @action handleUserOrgUnitClick = (event, checked) => {
        if (checked) {
            this.setUserOrgUnits([...this.userOrgUnits, {id: event.target.name}])
        } else {
            this.setUserOrgUnits(this.userOrgUnits.filter((ou) => ou.id !== event.target.name))
        }
    };


    getLastMonthsOfQuarter = (quarter, numberOfMonthsAgo) => {
        const splitData = quarter.split('Q');

        let date;

        let dates = [];

        switch (splitData[1]) {
            case '1':
                date = new Date(splitData[0], 2, 31);
                break;
            case '2':
                date = new Date(splitData[0], 5, 30);
                break;
            case '3':
                date = new Date(splitData[0], 8, 30);
                break;
            case '4':
                date = new Date(splitData[0], 11, 31);
                break;
            default:
                date = new Date();
        }

        for (let i = 1; i <= numberOfMonthsAgo; i++) {
            let dateCopy = new Date(date.getFullYear(), date.getMonth() + 1, date.getDay());
            dateCopy.setMonth(dateCopy.getMonth() - i);
            dates = [...dates, this.formatDate(dateCopy)]
        }
        return dates;
    };


    getLastMonthsOfYear = (year, numberOfMonthsAgo) => {
        let dates = [];
        for (let i = 1; i <= numberOfMonthsAgo; i++) {
            dates = [...dates, `${year}${i < 10 ? '0' + i : i}`]
        }
        return dates;
    };

    getLastMonthsOfMonth = (month, numberOfMonthsAgo) => {
        let dates = [];
        const year = parseInt(month.slice(0, 4), 10);
        const foundMonth = parseInt(month.slice(4), 10) - 1;
        for (let i = 0; i < numberOfMonthsAgo; i++) {
            const dateCopy = new Date(year, foundMonth, 1);
            dateCopy.setMonth(dateCopy.getMonth() - i);
            dates = [...dates, this.formatDate(dateCopy)]
        }
        return dates;
    };

    whichPeriod = (period, lastMonths) => {
        if (period.split('Q').length === 2) {
            return this.getLastMonthsOfQuarter(period, lastMonths);
        } else if (/^(\d{4})$/.test(period)) {
            return this.getLastMonthsOfYear(period, lastMonths);
        } else if (/^(\d{6})$/.test(period)) {
            return this.getLastMonthsOfMonth(period, lastMonths);
        } else {
            return [];
        }
    };

    fetchDataElements = async (period, orgUnits, conditions) => {
        const api = this.d2.Api.getApi();
        let compare = '';
        const level = await this.fetchLevels();

        let pes = period;

        const all = conditions.map((de) => {
            const g = toJS(de.ouGroups).join(';');
            const l = toJS(de.ouLevels).join(';');
            if (de.comparator === '==') {
                compare = `measureCriteria=EQ:${de.value}`;
            } else if (de.comparator === '<') {
                compare = `measureCriteria=LT:${de.value}`;
            } else if (de.comparator === '<=') {
                compare = `measureCriteria=LE:${de.value}`;
            } else if (de.comparator === '>') {
                compare = `measureCriteria=GT:${de.value}`;
            } else if (de.comparator === '>=') {
                compare = `measureCriteria=GE:${de.value}`;
            }

            if (de.lastMonths > 0) {
                const foundPeriod = period.split(';')
                    .map((p) => {
                        return this.whichPeriod(p, de.lastMonths);
                    }).filter((d) => {
                        return d.length > 0;
                    });
                if (foundPeriod.length > 0) {
                    pes = _.flatten(foundPeriod).join(';')
                } else {
                    alert('All periods supplied do not support last months calculations, expected [monthly,quarterly and yearly periods], taking periods as they are')
                }
            }

            if (g !== '') {
                if (compare !== '') {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${g};${orgUnits};&${compare}&hierarchyMeta=true`);
                } else {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${g};${orgUnits}&hierarchyMeta=true`);
                }
            } else if (l !== '') {
                if (compare !== '') {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${l};${orgUnits}&${compare}&hierarchyMeta=true`);
                } else {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${l};${orgUnits}&hierarchyMeta=true`);
                }
            } else {
                if (compare !== '') {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${orgUnits};LEVEL-${level}&${compare}&hierarchyMeta=true`);
                } else {
                    return api.get(`analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}&dimension=ou:${orgUnits};LEVEL-${level}&hierarchyMeta=true`);
                }
            }


        });
        return await Promise.all(all);
    };

    fetchOrganisations = async (unit) => {
        const api = this.d2.Api.getApi();
        return await api.get(`organisationUnits/${unit}.json?includeDescendants=true&fields=organisationUnitGroups,level,id`);
    };

    fetchChildrenOrganisations = async (unit) => {
        const api = this.d2.Api.getApi();
        return await api.get(`organisationUnits.json?parent=${unit}&fields=id,name`);
    };

    fetchTopOrganisations = async (units) => {
        const api = this.d2.Api.getApi();
        const {organisationUnits} = await api.get(`organisationUnits.json?fields=id,name&filter=id:in:[${units}]`);
        const processed = organisationUnits.map((o) => {
            return [o.id, {
                name: o.name
            }];
        });

        return _.fromPairs(processed);
    };


    groupElements = (val1, val2) => {
        const a = _.groupBy(val1.values, (val) => {
            return val.ou + ',' + val.pe;
        });

        const b = _.groupBy(val2.values, (val) => {
            return val.ou + ',' + val.pe;
        });

        return {a, b};
    };

    subtract = (val1, val2) => {
        const {a, b} = this.groupElements(val1, val2);
        const aKeys = _.keys(a);
        const bKeys = _.keys(b);
        const all = _.union(aKeys, bKeys);
        return _.map(all, (d) => {
            const splitKeys = d.split(',');
            let result = {ou: splitKeys[0], pe: splitKeys[1]};
            if (aKeys.indexOf(d) !== -1 && bKeys.indexOf(d) !== -1) {
                const d1 = a[d][0];
                const d2 = b[d][0];
                result.value = d1.value - d2.value;
                result.hierarchy = d1.hierarchy;
            } else if (aKeys.indexOf(d) !== -1) {
                const d1 = a[d][0];
                result.value = d1.value;
                result.hierarchy = d1.hierarchy;
            } else if (bKeys.indexOf(d) !== -1) {
                const d2 = b[d][0];
                result.value = d2.value;
                result.hierarchy = d2.hierarchy;
            }

            return result;
        });
    };

    add = (val1, val2) => {
        const {a, b} = this.groupElements(val1, val2);
        const aKeys = _.keys(a);
        const bKeys = _.keys(b);
        const all = _.union(aKeys, bKeys);
        return _.map(all, (d) => {
            const splitKeys = d.split(',');
            let result = {ou: splitKeys[0], pe: splitKeys[1]};
            if (aKeys.indexOf(d) !== -1 && bKeys.indexOf(d) !== -1) {
                const d1 = a[d][0];
                const d2 = b[d][0];
                result.value = d1.value + d2.value;
                result.hierarchy = d1.hierarchy;
            } else if (aKeys.indexOf(d) !== -1) {
                const d1 = a[d][0];
                result.value = d1.value;
                result.hierarchy = d1.hierarchy;

            } else if (bKeys.indexOf(d) !== -1) {
                const d2 = b[d][0];
                result.value = d2.value;
                result.hierarchy = d2.hierarchy;
            }
            return result;
        })
    };

    and = (val1, val2) => {
        if (['2', '3'].indexOf(val1.type) !== -1 || ['2', '3'].indexOf(val2.type) !== -1) {
            const {a, b} = this.groupElements(val1, val2);
            const aKeys = _.keys(a);
            const bKeys = _.keys(b);
            const all = _.intersection(aKeys, bKeys);
            return _.map(all, (d) => {
                const splitKeys = d.split(',');
                let result = {
                    ou: splitKeys[0],
                    pe: splitKeys[1],

                };
                const d1 = a[d][0];
                result.value = d1.value;
                result.hierarchy = d1.hierarchy;
                return result;
            });
        } else if ((val1.type === '2' && val2.type === '1') || (val1.type === '3' && val2.type === '1')) {
            const units = val2.values.map((vl) => vl.id);
            return val1.values.filter((v) => {
                return units.indexOf(v.ou) !== -1;
            });
        } else if ((val1.type === '1' && val2.type === '2') || (val1.type === '1' && val2.type === '3')) {
            const units = val1.values.map((vl) => vl.id);
            return val2.values.filter((v) => {
                return units.indexOf(v.ou) !== -1;
            });
        }
    };

    or = (val1, val2) => {
        if (['2', '3'].indexOf(val1.type) !== -1 || ['2', '3'].indexOf(val2.type) !== -1) {
            const {
                a,
                b
            } = this.groupElements(val1, val2);
            const aKeys = _.keys(a);
            const bKeys = _.keys(b);
            const all = _.union(aKeys, bKeys);
            return _.map(all, (d) => {
                const splitKeys = d.split(',');
                let result = {
                    ou: splitKeys[0],
                    pe: splitKeys[1]
                };
                const obj = a[d] || b[d];
                const d1 = obj[0];
                result.value = d1.value;
                result.hierarchy = d1.hierarchy;
                return result;
            });
        } else if ((val1.type === '2' && val2.type === '1') || (val1.type === '3' && val2.type === '1')) {
            const units = val2.values.map((vl) => vl.id);
            return val1.values.filter((v) => {
                return units.indexOf(v.ou) !== -1;
            });
        } else if ((val1.type === '1' && val2.type === '2') || (val1.type === '1' && val2.type === '3')) {
            const units = val1.values.map((vl) => vl.id);
            return val2.values.filter((v) => {
                return units.indexOf(v.ou) !== -1;
            });
        }
    };

    process = async (unit, conditions, period) => {
        let final = {};
        const withOus = conditions.filter((condition) => {
            return condition.type === 'group' || condition.type === 'level';
        });

        const withElements = conditions.filter((condition) => {
            return condition.type === 'dataElement' || condition.type === 'dataSet';
        });

        const joined = conditions.filter((condition) => {
            return condition.type === 'Joiner';
        }).sort((a, b) => {
            return a.sortId > b.sortId ? 1 : -1;
        });

        if (withOus.length > 0) {
            const {organisationUnits} = await this.fetchOrganisations(unit);
            for (const withOu of withOus) {
                if (withOu.type === 'level') {
                    const found1 = organisationUnits.filter((organisation) => {
                        if (withOu.comparator === '==') {
                            return organisation.level === withOu.value;
                        } else if (withOu.comparator === '<') {
                            return organisation.level < withOu.value;
                        } else if (withOu.comparator === '<=') {
                            return organisation.level <= withOu.value;
                        } else if (withOu.comparator === '>') {
                            return organisation.level > withOu.value;
                        } else if (withOu.comparator === '>=') {
                            return organisation.level >= withOu.value;
                        } else if (withOu.comparator === 'IN') {
                            const units = withOu.value.split(',');
                            return units.indexOf(organisation.level) !== -1;
                        }
                    });

                    final = {
                        ...final, [withOu.name]: {
                            values: found1,
                            type: '1'
                        }
                    }

                } else if (withOu.type === 'group') {
                    const found2 = organisationUnits.filter((organisation) => {
                        if (withOu.comparator === '==') {
                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return ouGroup.id === withOu.value;
                            });
                            return filtered.length > 0;
                        } else if (withOu.comparator === '<') {
                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return ouGroup.id < withOu.value;
                            });
                            return filtered.length > 0;
                        } else if (withOu.comparator === '<=') {
                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return ouGroup.id <= withOu.value;
                            });
                            return filtered.length > 0;
                        } else if (withOu.comparator === '>') {
                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return ouGroup.id > withOu.value;
                            });
                            return filtered.length > 0;
                        } else if (withOu.comparator === '>=') {
                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return ouGroup.id >= withOu.value;
                            });
                            return filtered.length > 0;
                        } else if (withOu.comparator === 'IN') {
                            const units = withOu.value.split(',');

                            const filtered = organisation.organisationUnitGroups.filter((ouGroup) => {
                                return units.indexOf(ouGroup.id) !== -1
                            });
                            return filtered.length > 0;
                        }
                    });

                    final = {
                        ...final, [withOu.name]: {
                            values: found2,
                            type: '1'
                        }
                    }
                }
            }
        }

        const foundData = await this.fetchDataElements(period, unit, withElements);

        for (let i = 0; i < withElements.length; i++) {
            const dt = foundData[i];
            const current = withElements[i];
            const columns = dt.headers.map((h) => {
                return h.name;
            });

            const val = dt.rows.map((r) => {
                return Object.assign.apply({}, columns.map((v, i) => {
                    const obj = {};
                    obj[v] = r[i];
                    return obj;
                }));
            }).map((d) => {
                d.value = parseFloat(d.value);
                d.hierarchy = dt.metaData.ouHierarchy[d['ou']];

                return d;
            });
            final = {
                ...final, [current.name]: {
                    values: val,
                    type: '2',
                    lastMonths: current.lastMonths,
                    items: dt.metaData.items,
                    periods: dt.metaData.dimensions.pe,
                }
            };
        }

        for (const j of joined) {

            const condition1 = j.condition1;
            const condition2 = j.condition2;
            const data1 = final[condition1];
            const data2 = final[condition2];

            let data = null;

            switch (j.comparator) {
                case'+':
                    data = this.add(data1, data2);
                    break;

                case'-':
                    data = this.subtract(data1, data2);
                    break;

                case'||':
                    data = this.or(data1, data2);
                    break;

                case'&&':
                    data = this.and(data1, data2);
                    break;
                default:
                    console.log('Nothing provided');
            }
            switch (j.comparator1) {
                case '==':
                    data = data.filter((d) => {
                        return d.value === j.value
                    });
                    break;

                case '<':
                    data = data.filter((d) => {
                        return d.value < j.value
                    });
                    break;
                case '<=':
                    data = data.filter((d) => {
                        return d.value <= j.value
                    });
                    break;
                case '>':
                    data = data.filter((d) => {
                        return d.value > j.value
                    });
                    break;

                case '>=':
                    data = data.filter((d) => {
                        return d.value >= j.value
                    });
                    break;

                case '!=':
                    data = data.filter((d) => {
                        return d.value !== j.value
                    });
                    break;
            }
            final = {
                ...final, [j.name]: {
                    values: data,
                    type: '3',
                    items: _.assign({}, data1.items, data2.items),
                    periods: data1.periods,
                }
            };
        }

        return final;
    };


    @action
    call = async () => {
        const periods = this.selectedPeriods.map((p) => p.id);
        const organisations = this.selected.map((o) => o.id);
        if (periods.length > 0 && organisations.length > 0) {
            const joinedPeriods = periods.join(';');
            const joinedOrganisations = organisations.join(';');
            try {

                const rows = [];

                const num = this.indicator.rule.json.numerator;
                const den = this.indicator.rule.json.denominator;
                const final = await this.process(joinedOrganisations, this.indicator.rule.json.conditions, joinedPeriods);
                const numerator = final[num];
                const denominator = final[den];
                const foundItems = numerator && denominator ? {...numerator.items, ...denominator.items} : numerator.items;

                const periods = numerator.periods;

                const items = {
                    [this.indicator.rule.id]: {
                        name: this.indicator.rule.name
                    }
                };

                organisations.forEach((o) => {
                    items[o] = {
                        ...foundItems[o]
                    };
                });

                for (const ou of organisations) {
                    for (const pe of periods) {
                        items[pe] = {
                            ...foundItems[pe]
                        };
                        if (numerator && denominator) {
                            let n = 0;
                            let d = 0;
                            if (numerator.type === '2' || numerator.type === '3') {
                                if (numerator.lastMonths > 0) {
                                    let foundUnits = [];
                                    const whichPeriods = this.whichPeriod(pe, numerator.lastMonths);
                                    const searched = numerator.values.filter((f) => {
                                        return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    });

                                    const searchedGrouped = _.groupBy(searched, 'ou');

                                    _.forOwn(searchedGrouped, (val, key) => {
                                        if (val.length === whichPeriods.length) {
                                            foundUnits = [...foundUnits, key];
                                        }
                                    });
                                    n = foundUnits.length;
                                } else {
                                    const searched = numerator.values.filter((f) => {
                                        return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    }).map((v) => {
                                        return v.ou;
                                    });
                                    n = _.uniq(searched).length;
                                }
                            } else {
                                const searched = numerator.values.map((v) => {
                                    return v.id;
                                });
                                n = _.uniq(searched).length;
                            }

                            if (denominator.type === '2' || denominator.type === '3') {

                                if (denominator.lastMonths > 0) {
                                    let foundUnits = [];
                                    const whichPeriods = this.whichPeriod(pe, denominator.lastMonths);
                                    const searched = denominator.values.filter((f) => {
                                        return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    });

                                    const searchedGrouped = _.groupBy(searched, 'ou');

                                    _.forOwn(searchedGrouped, (val, key) => {
                                        if (val.length === whichPeriods.length) {
                                            foundUnits = [...foundUnits, key];
                                        }
                                    });

                                    n = foundUnits.length;

                                } else {
                                    const searched = denominator.values.filter((f) => {
                                        return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    }).map((v) => {
                                        return v.ou;
                                    });
                                    d = _.uniq(searched).length;
                                }

                            } else {
                                const searched = denominator.values.map((v) => {
                                    return v.id;
                                });
                                d = _.uniq(searched).length;
                            }

                            if (d > 0) {
                                const ind = (n / d) * 100;
                                rows.push([this.indicator.rule.id, pe, ou, '' + ind.toFixed(2)]);
                            } else {
                                rows.push([this.indicator.rule.id, pe, ou, '0']);
                            }

                        } else if (numerator) {
                            if (numerator.type === '2' || numerator.type === '3') {
                                if (numerator.lastMonths > 0) {
                                    let foundUnits = [];
                                    const whichPeriods = this.whichPeriod(pe, numerator.lastMonths);
                                    const searched = numerator.values.filter((f) => {
                                        return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    });

                                    const searchedGrouped = _.groupBy(searched, 'ou');


                                    _.forOwn(searchedGrouped, (val, key) => {
                                        if (val.length === whichPeriods.length) {
                                            foundUnits = [...foundUnits, key];
                                        }
                                    });

                                    rows.push([this.indicator.rule.id, pe, ou, '' + foundUnits.length]);
                                } else {
                                    const searched = numerator.values.filter((f) => {
                                        return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);
                                    }).map((v) => {
                                        return v.ou;
                                    });
                                    rows.push([this.indicator.rule.id, pe, ou, '' + _.uniq(searched).length]);
                                }
                            } else {
                                const searched = numerator.values.map((v) => {
                                    return v.id;
                                });
                                rows.push([this.indicator.rule.id, pe, ou, '' + _.uniq(searched).length]);

                            }
                        }
                    }
                }
                const sanitizedAnalyticsObject = {
                    headers: [{
                        "name": "dx",
                        "column": "Data",
                        "valueType": "TEXT",
                        "type": "java.lang.String",
                        "hidden": false,
                        "meta": true
                    }, {
                        "name": "pe",
                        "column": "Period",
                        "valueType": "TEXT",
                        "type": "java.lang.String",
                        "hidden": false,
                        "meta": true
                    }, {
                        "name": "ou",
                        "column": "Organisation unit",
                        "valueType": "TEXT",
                        "type": "java.lang.String",
                        "hidden": false,
                        "meta": true
                    }, {
                        "name": "value",
                        "column": "Value",
                        "valueType": "NUMBER",
                        "type": "java.lang.Double",
                        "hidden": false,
                        "meta": false
                    }],
                    metaData: {
                        items: items,
                        dimensions: {
                            "dx": [this.indicator.rule.id],
                            "pe": periods,
                            "ou": organisations
                        }
                    },
                    height: rows.length,
                    width: 4,
                    rows: rows
                };

                this.setIndicatorValue(sanitizedAnalyticsObject);


            } catch (e) {
                console.log(e);
            }

        }
    };

    @action
    loadIndicators = async () => {
        this.startSpinning();
        if (this.d2) {
            const api = this.d2.Api.getApi();
            try {
                const indicators = await api.get('dataStore/functions');
                const all = indicators.map((e) => {
                    return api.get(`dataStore/functions/${e}`);
                });
                const data = await Promise.all(all);
                const processed = data.map((ind) => {
                    const indicator = new Indicator();
                    indicator.setName(ind.name);
                    indicator.setId(ind.id);
                    indicator.setDescription(ind.description);
                    indicator.function = ind.function;
                    if (ind.rules.length > 0) {
                        const rules = ind.rules.map((rule) => {
                            const r = new Rule();
                            r.id = rule.id;
                            r.name = rule.name;
                            r.description = rule.description;
                            r.isDefault = rule.isDefault;
                            r.type = rule.type;

                            const conditions = rule.json.conditions;
                            r.json.denominator = rule.json.denominator;
                            r.json.numerator = rule.json.numerator;

                            if (conditions && conditions.length > 0) {
                                r.json.conditions = conditions.map((cond) => {
                                    const condition = new Condition();
                                    condition.name = cond.name;
                                    condition.id = cond.id;
                                    condition.value = cond.value;
                                    condition.dataElement = cond.dataElement;
                                    condition.comparator = cond.comparator;
                                    condition.type = cond.type;
                                    condition.active = cond.active;
                                    condition.comparator1 = cond.comparator1;
                                    condition.condition2 = cond.condition2;
                                    condition.condition1 = cond.condition1;
                                    condition.sortId = cond.sortId;
                                    condition.lastMonths = cond.lastMonths;
                                    condition.ouGroups = cond.ouGroups;
                                    condition.ouLevels = cond.ouLevels;
                                    return condition;
                                });
                            }
                            return r;
                        });
                        indicator.setRules(rules);

                    }
                    return indicator
                });
                this.setIndicators(processed);

            } catch (e) {
                console.log(e)
            }
        }
        this.stopSpinning();
    };

    @action
    loadOULevels = async () => {
        this.startSpinning();
        if (this.d2) {
            const api = this.d2.Api.getApi();
            try {
                const data = await api.get('filledOrganisationUnitLevels', {});
                this.setOrganisationLevels(data);
            } catch (e) {
                console.log(e)
            }
        }
        this.stopSpinning();
    };

    @action
    loadOUGroups = async () => {
        this.startSpinning();
        if (this.d2) {
            const api = this.d2.Api.getApi();
            try {
                const {organisationUnitGroups} = await api.get('organisationUnitGroups', {fields: 'id,name,code'});
                this.setOrganisationUnitGroups(organisationUnitGroups);
            } catch (e) {
                console.log(e)
            }
        }
        this.stopSpinning();
    };

    @action
    loadDataElements = async () => {
        this.startSpinning();
        if (this.d2) {
            const api = this.d2.Api.getApi();
            try {
                const {dataElements} = await api.get('dataElements', {
                    paging: false,
                    fields: 'id,name,code,categoryCombo[categoryOptionCombos[id,name]]',
                    filter: 'domainType:eq:AGGREGATE'
                });
                this.setDataElements(dataElements);
            } catch (e) {
                console.log(e);
            }
        }
        this.stopSpinning();
    };

    @action
    loadDataSets = async () => {
        this.startSpinning();
        if (this.d2) {
            const api = this.d2.Api.getApi();
            try {
                const {dataSets} = await api.get('dataSets', {
                    paging: false,
                    fields: 'id,name,code'
                });
                this.setDataSets(dataSets);
            } catch (e) {
                console.log(e);
            }
        }
        this.stopSpinning();
    };

    @action
    addIndicator = async () => {
        try {
            const mapping = _.findIndex(this.indicators, (indicator) => {
                return this.indicator.id === indicator.id;
            });

            if (mapping !== -1) {
                this.indicators.splice(mapping, 1, this.indicator);
            } else {
                const merged = [...this.indicators, this.indicator];
                this.setIndicators(merged);
            }
            await this.saveIndicator();
            this.setIndicator(new Indicator());
            this.showIndicators();
        } catch (e) {
            console.log(e)
        }
    };

    @action
    cancel = () => {
        this.setIndicator(new Indicator());
        this.showIndicators();
    };

    @action
    saveIndicator = async () => {
        this.indicator.addRule();
        const data = _.pick(this.indicator, ['id', 'name', 'description', 'rules', 'created', 'lastUpdated', 'href', 'function']);

        try {
            const namespace = await this.d2.dataStore.get('functions');
            namespace.set(this.indicator.id, data);
        } catch (e) {
            const namespace = await this.d2.dataStore.create('functions');
            namespace.set(this.indicator.id, data);
        }
    };

    @action
    setCurrentIndicator = (val) => {
        this.setIndicator(val);
        this.indicator.setRule(this.indicator.rules[0]);
        this.showIndicator();
    };

    @action
    deleteIndicator = async (val) => {
        const filtered = this.indicators.filter((indicator) => {
            return indicator.id !== val.id;
        });
        try {
            const namespace = await this.d2.dataStore.get('functions');
            namespace.delete(val.id);
            this.setIndicators(filtered);

        } catch (e) {
            console.log(e);
        }
    };

    @action
    duplicateIndicator = (val) => {
        val.id = generateUid();
        this.setIndicator(val);
        this.showIndicator();
    };


    @computed get possible() {
        if (this.indicator.condition.type === 'Joiner' && ['*', '-', '+', '/'].indexOf(this.indicator.condition.comparator) !== -1) {
            const found = this.indicator.rule.json.conditions.find((c) => {
                return c.name === this.indicator.condition.condition1;
            });
            return this.indicator.rule.json.conditions.filter((d) => {
                return d.name !== this.indicator.condition.condition1 && d.type === found.type
            });
        }
        return this.indicator.rule.json.conditions.filter((d) => {
            return d.name !== this.indicator.condition.condition1
        });
    }


    @computed get hideSignAndValueField() {
        return ['*', '-', '+', '/'].indexOf(this.indicator.condition.comparator) === -1
    }

    @computed get searchedDataElements() {
        const search = this.search['dataElements'];
        if (search && search !== '') {
            return this.dataElements.filter((dataElement) => {
                return dataElement.name.toLowerCase().includes(search.toLowerCase()) || (dataElement.code && dataElement.code.toLowerCase().includes(search.toLowerCase()));
            });
        }

        return this.dataElements;
    }

    @computed get searchedIndicators() {
        const search = this.search['indicators'];
        if (search && search !== '') {
            return this.indicators.filter((indicator) => {
                return indicator.name.toLowerCase().includes(search.toLowerCase());
            });
        }

        return this.indicators;
    }

    @computed get searchedDataSets() {
        const search = this.search['dataSets'];
        if (search && search !== '') {
            return this.dataSets.filter((dataSet) => {
                return dataSet.name.toLowerCase().includes(search.toLowerCase()) || (dataSet.code && dataSet.code.toLowerCase().includes(search.toLowerCase()));
            });
        }
        return this.dataSets;
    }

    @computed get searchedOUGroups() {
        const search = this.search['ouGroups'];
        if (search && search !== '') {
            return this.organisationUnitGroups.filter((ouGroup) => {
                return ouGroup.name.toLowerCase().includes(search.toLowerCase()) || (ouGroup.code && ouGroup.code.toLowerCase().includes(search.toLowerCase()));
            });
        }
        return this.organisationUnitGroups;
    }

    @computed get disableSubmit() {
        return this.indicator.name === '' || this.indicator.rule.json.denominator === '' || this.indicator.rule.json.numerator === '';
    }

    @computed get hideComparator() {
        return (['dataElement', 'dataSet'].indexOf(this.indicator.condition.type) !== -1
            && this.indicator.condition.dataElement !== '')
            || (['dataElement', 'dataSet'].indexOf(this.indicator.condition.type) === -1
                && this.indicator.condition.type !== '')
    }

    @computed get hideDataElement() {
        return this.indicator.condition.dataElement !== ''
            && this.indicator.condition.comparator !== ''
            && this.indicator.condition.comparator !== 'None'
    }

    @computed get processResult() {
        if (this.indicatorValue) {
            let data = {};

            this.indicatorValue.rows.forEach(r => {
                data = {...data, [`${r[1]}${r[2]}`]: r[3]}
            });

            return {
                data, periods: this.indicatorValue.metaData.dimensions.pe,
                units: this.indicatorValue.metaData.dimensions.ou,
                items: this.indicatorValue.metaData.items
            }

            // console.log(this.indicatorValue);
            // return this.indicatorValue;
        } else {
            return null;
        }
    }

    editCondition = args => {
        this.indicator.setCurrentCondition(args);
    };

    deleteCondition = args => {
        this.indicator.deleteCondition(args);
    };

    editIndicator = args => {
        this.setCurrentIndicator(args);
    };

    duplicate = args => {
        this.duplicateIndicator(args);
    };

    delete = async args => {
        await this.deleteIndicator(args);
    };

    @observable tableActions = {
        edit: this.editIndicator,
        duplicate: this.duplicate,
        delete: this.delete,
    };

    @observable conditionActions = {
        edit: this.editCondition,
        delete: this.deleteCondition,

    };


}

export const store = new Store();


