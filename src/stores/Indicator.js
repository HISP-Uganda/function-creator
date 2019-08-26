import {observable, action, computed} from 'mobx';
import {Condition} from "./Condition";

import {generateUid} from "../utils";
import {Rule} from "./Rule";
import _ from 'lodash';

export class Indicator {
    @observable id = generateUid();
    @observable name = '';
    @observable selectionEnd = 0;
    @observable description = '';
    @observable conditions = [];
    @observable rules = [];
    @observable conditionDialogOpen = false;
    @observable ruleDialogOpen = false;
    @observable rule = new Rule();
    @observable condition = new Condition();
    @observable created = new Date();
    @observable lastUpdated = new Date();
    @observable href = `http://localhost:8080/api/dataStore/functions/${this.id}`;
    @observable testDialogOpen = false;
    @observable dialogOpen = false;
    @observable function = 'async function fetchLevels() {\n' +
        '    var response = await fetch(\'../../organisationUnitLevels.json?fields=level\');\n' +
        '    var levels = await response.json();\n' +
        '    var a = levels.organisationUnitLevels.map(function (l) {\n' +
        '        return l.level;\n' +
        '    });\n' +
        '    return Math.max.apply(Math, a);\n' +
        '}\n' +
        '\n' +
        'async function fetchOrganisations(unit) {\n' +
        '    var level = await fetchLevels();\n' +
        '    var orgs = await fetch(`../../organisationUnits/${unit}.json?includeDescendants=true&fields=organisationUnitGroups,level,id`);\n' +
        '    var foundOus = await orgs.json();\n' +
        '    return foundOus.organisationUnits.filter(function (o) {\n' +
        '        return level === o.level;\n' +
        '    });\n' +
        '}\n' +
        '\n' +
        'async function fetchTopOrganisations(units) {\n' +
        '    var orgs = await fetch(`../../organisationUnits.json?fields=id,name&filter=id:in:[${units}]`);\n' +
        '    var foundOus = await orgs.json();\n' +
        '    var processed = foundOus.organisationUnits.map(function (o) {\n' +
        '        return [o.id, {\n' +
        '            name: o.name\n' +
        '        }];\n' +
        '    });\n' +
        '\n' +
        '    return _.fromPairs(processed);\n' +
        '}\n' +
        '\n' +
        'function formatDate(date) {\n' +
        '    let month = date.getMonth() + 1;\n' +
        '    let year = date.getFullYear();\n' +
        '    const monthString = month < 10 ? \'0\' + month : month;\n' +
        '\n' +
        '    return `${year}${monthString}`\n' +
        '}\n' +
        '\n' +
        'function getLastMonthsOfQuarter(quarter, numberOfMonthsAgo) {\n' +
        '    const splitData = quarter.split(\'Q\');\n' +
        '\n' +
        '    let date;\n' +
        '\n' +
        '    let dates = [];\n' +
        '\n' +
        '    switch (splitData[1]) {\n' +
        '        case \'1\':\n' +
        '            date = new Date(splitData[0], 2, 31);\n' +
        '            break;\n' +
        '        case \'2\':\n' +
        '            date = new Date(splitData[0], 5, 30);\n' +
        '            break;\n' +
        '        case \'3\':\n' +
        '            date = new Date(splitData[0], 8, 30);\n' +
        '            break;\n' +
        '        case \'4\':\n' +
        '            date = new Date(splitData[0], 11, 31);\n' +
        '            break;\n' +
        '        default:\n' +
        '            date = new Date();\n' +
        '    }\n' +
        '\n' +
        '    for (let i = 1; i <= numberOfMonthsAgo; i++) {\n' +
        '        let dateCopy = new Date(date.getFullYear(), date.getMonth() + 1, date.getDay());\n' +
        '        dateCopy.setMonth(dateCopy.getMonth() - i);\n' +
        '        dates = dates.concat(formatDate(dateCopy))\n' +
        '    }\n' +
        '\n' +
        '    return dates;\n' +
        '\n' +
        '}\n' +
        '\n' +
        '\n' +
        'function getLastMonthsOfYear(year, numberOfMonthsAgo) {\n' +
        '    let dates = [];\n' +
        '    for (let i = 1; i <= numberOfMonthsAgo; i++) {\n' +
        '        dates = dates.concat(`${year}${i < 10 ? \'0\' + i : i}`);\n' +
        '    }\n' +
        '    return dates;\n' +
        '}\n' +
        '\n' +
        'function getLastMonthsOfMonth(month, numberOfMonthsAgo) {\n' +
        '    let dates = [];\n' +
        '    const year = parseInt(month.slice(0, 4), 10);\n' +
        '    const foundMonth = parseInt(month.slice(4), 10) - 1;\n' +
        '    for (let i = 0; i < numberOfMonthsAgo; i++) {\n' +
        '        const dateCopy = new Date(year, foundMonth, 1);\n' +
        '        dateCopy.setMonth(dateCopy.getMonth() - i);\n' +
        '        dates = dates.concat(formatDate(dateCopy));\n' +
        '    }\n' +
        '    return dates;\n' +
        '}\n' +
        '\n' +
        'function whichPeriod(period, lastMonths) {\n' +
        '    if (period.split(\'Q\').length === 2) {\n' +
        '        return getLastMonthsOfQuarter(period, lastMonths);\n' +
        '    } else if (/^(\\d{4})$/.test(period)) {\n' +
        '        return getLastMonthsOfYear(period, lastMonths);\n' +
        '    } else if (/^(\\d{6})$/.test(period)) {\n' +
        '        return getLastMonthsOfMonth(period, lastMonths);\n' +
        '    } else {\n' +
        '        return [];\n' +
        '    }\n' +
        '\n' +
        '}\n' +
        '\n' +
        'async function fetchDataElements(period, orgUnits, conditions) {\n' +
        '    var compare = \'\';\n' +
        '    let pes = period;\n' +
        '    var all = conditions.map(async function (de) {\n' +
        '        const g = de.ouGroups.join(\';\');\n' +
        '        const l = de.ouLevels.join(\';\');\n' +
        '        if (de.comparator === \'==\') {\n' +
        '            compare = `&measureCriteria=EQ:${de.value}`;\n' +
        '        } else if (de.comparator === \'<\') {\n' +
        '            compare = `&measureCriteria=LT:${de.value}`;\n' +
        '        } else if (de.comparator === \'<=\') {\n' +
        '            compare = `&measureCriteria=LE:${de.value}`;\n' +
        '        } else if (de.comparator === \'>\') {\n' +
        '            compare = `&measureCriteria=GT:${de.value}`;\n' +
        '        } else if (de.comparator === \'>=\') {\n' +
        '            compare = `&measureCriteria=GE:${de.value}`;\n' +
        '        }\n' +
        '\n' +
        '        if (de.lastMonths > 0) {\n' +
        '            const foundPeriod = period.split(\';\')\n' +
        '                .map(function (p) {\n' +
        '                    return whichPeriod(p, de.lastMonths);\n' +
        '                }).filter(function (d) {\n' +
        '                    return d.length > 0;\n' +
        '                });\n' +
        '            if (foundPeriod.length > 0) {\n' +
        '                pes = _.flatten(foundPeriod).join(\';\')\n' +
        '            } else {\n' +
        '                alert(\'All periods supplied do not support last months calculations, expected [monthly,quarterly and yearly periods], taking periods as they are\')\n' +
        '            }\n' +
        '        }\n' +
        '        let ou = `&dimension=ou:${orgUnits}`;\n' +
        '        if (g !== \'\') {\n' +
        '            ou = `&dimension=ou:${g};${orgUnits}`\n' +
        '        } else if (l !== \'\') {\n' +
        '            ou = `&dimension=ou:${l};${orgUnits}`\n' +
        '        }\n' +
        '        var response = await fetch(`../../analytics.json?dimension=dx:${de.dataElement}&dimension=pe:${pes}${ou}${compare}&aggregationType=${de.aggregationType}&hierarchyMeta=true`);\n' +
        '        return response.json();\n' +
        '    });\n' +
        '    return await Promise.all(all);\n' +
        '}\n' +
        '\n' +
        'function groupElements(val1, val2) {\n' +
        '    const a = _.groupBy(val1.values, function (val) {\n' +
        '        return val.ou + \',\' + val.pe;\n' +
        '    });\n' +
        '\n' +
        '    const b = _.groupBy(val2.values, function (val) {\n' +
        '        return val.ou + \',\' + val.pe;\n' +
        '    });\n' +
        '\n' +
        '    return {\n' +
        '        a: a,\n' +
        '        b: b\n' +
        '    };\n' +
        '}\n' +
        '\n' +
        'function enumerateDates(startDate, num, what) {\n' +
        '    const dates = [];\n' +
        '    const currDate = moment(startDate).endOf(what);\n' +
        '    for (var i = 1; i <= num; i++) {\n' +
        '        dates.push(currDate.clone().subtract(i, \'months\').format(\'YYYYMM\'));\n' +
        '    }\n' +
        '    return dates;\n' +
        '}\n' +
        '\n' +
        'function getDate(input) {\n' +
        '    if (input.length === 6) {\n' +
        '        if (input.indexOf(\'Q\') !== -1) {\n' +
        '            return moment(input, \'YYYY[Q]Q\');\n' +
        '        }\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        '\n' +
        'function subtract(val1, val2) {\n' +
        '    const {\n' +
        '        a,\n' +
        '        b\n' +
        '    } = groupElements(val1, val2);\n' +
        '\n' +
        '    const aKeys = _.keys(a);\n' +
        '    const bKeys = _.keys(b);\n' +
        '    const all = _.union(aKeys, bKeys);\n' +
        '\n' +
        '    return _.map(all, function (d) {\n' +
        '        const splitKeys = d.split(\',\');\n' +
        '        let result = {\n' +
        '            ou: splitKeys[0],\n' +
        '            pe: splitKeys[1]\n' +
        '        };\n' +
        '        if (aKeys.indexOf(d) !== -1 && bKeys.indexOf(d) !== -1) {\n' +
        '            const d1 = a[d][0];\n' +
        '            const d2 = b[d][0];\n' +
        '            result.value = d1.value - d2.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '        } else if (aKeys.indexOf(d) !== -1) {\n' +
        '            const d1 = a[d][0];\n' +
        '            result.value = d1.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '        } else if (bKeys.indexOf(d) !== -1) {\n' +
        '            const d2 = b[d][0];\n' +
        '            result.value = d2.value;\n' +
        '            result.hierarchy = d2.hierarchy;\n' +
        '        }\n' +
        '        return result;\n' +
        '    });\n' +
        '}\n' +
        '\n' +
        '\n' +
        'function add(val1, val2) {\n' +
        '    const {\n' +
        '        a,\n' +
        '        b\n' +
        '    } = groupElements(val1, val2);\n' +
        '    const aKeys = _.keys(a);\n' +
        '    const bKeys = _.keys(b);\n' +
        '    const all = _.union(aKeys, bKeys);\n' +
        '    return _.map(all, function (d) {\n' +
        '        const splitKeys = d.split(\',\');\n' +
        '        let result = {\n' +
        '            ou: splitKeys[0],\n' +
        '            pe: splitKeys[1]\n' +
        '        };\n' +
        '        if (aKeys.indexOf(d) !== -1 && bKeys.indexOf(d) !== -1) {\n' +
        '            const d1 = a[d][0];\n' +
        '            const d2 = b[d][0];\n' +
        '            result.value = d1.value + d2.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '        } else if (aKeys.indexOf(d) !== -1) {\n' +
        '            const d1 = a[d][0];\n' +
        '            result.value = d1.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '        } else if (bKeys.indexOf(d) !== -1) {\n' +
        '            const d2 = b[d][0];\n' +
        '            result.value = d2.value;\n' +
        '            result.hierarchy = d2.hierarchy;\n' +
        '        }\n' +
        '\n' +
        '        return result;\n' +
        '    });\n' +
        '}\n' +
        '\n' +
        'function and(val1, val2) {\n' +
        '    if ([\'2\', \'3\'].indexOf(val1.type) !== -1 || [\'2\', \'3\'].indexOf(val2.type) !== -1) {\n' +
        '        const {\n' +
        '            a,\n' +
        '            b\n' +
        '        } = groupElements(val1, val2);\n' +
        '        const aKeys = _.keys(a);\n' +
        '        const bKeys = _.keys(b);\n' +
        '        const all = _.intersection(aKeys, bKeys);\n' +
        '        return _.map(all, function (d) {\n' +
        '            const splitKeys = d.split(\',\');\n' +
        '            let result = {\n' +
        '                ou: splitKeys[0],\n' +
        '                pe: splitKeys[1]\n' +
        '            };\n' +
        '            const d1 = a[d][0];\n' +
        '            result.value = d1.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '            return result;\n' +
        '        });\n' +
        '    } else if ((val1.type === \'2\' && val2.type === \'1\') || (val1.type === \'3\' && val2.type === \'1\')) {\n' +
        '        const units = val2.values.map(function (vl) {\n' +
        '            return vl.id\n' +
        '        });\n' +
        '        return val1.values.filter(function (v) {\n' +
        '            return units.indexOf(v.ou) !== -1;\n' +
        '        });\n' +
        '    } else if ((val1.type === \'1\' && val2.type === \'2\') || (val1.type === \'1\' && val2.type === \'3\')) {\n' +
        '        const units = val1.values.map(function (vl) {\n' +
        '            return vl.id\n' +
        '        });\n' +
        '        return val2.values.filter(function (v) {\n' +
        '            return units.indexOf(v.ou) !== -1;\n' +
        '        });\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'function isInGroups(organisationUnits, groups) {\n' +
        '    return organisationUnits.filter(function (organisation) {\n' +
        '        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '            return groups.indexOf(ouGroup.id) !== -1\n' +
        '        });\n' +
        '        return filtered.length > 0;\n' +
        '    }).map(function (u) {\n' +
        '        return u.id;\n' +
        '    });\n' +
        '}\n' +
        '\n' +
        'function isInLevels(organisationUnits, levels) {\n' +
        '    return organisationUnits.filter(function (organisation) {\n' +
        '        return levels.indexOf(organisation.level) !== -1;\n' +
        '    }).map(function (u) {\n' +
        '        return u.id;\n' +
        '    });\n' +
        '}\n' +
        '\n' +
        'function or(val1, val2) {\n' +
        '    if ([\'2\', \'3\'].indexOf(val1.type) !== -1 || [\'2\', \'3\'].indexOf(val2.type) !== -1) {\n' +
        '        const {\n' +
        '            a,\n' +
        '            b\n' +
        '        } = groupElements(val1, val2);\n' +
        '        const aKeys = _.keys(a);\n' +
        '        const bKeys = _.keys(b);\n' +
        '        const all = _.union(aKeys, bKeys);\n' +
        '        return _.map(all, function (d) {\n' +
        '            const splitKeys = d.split(\',\');\n' +
        '            let result = {\n' +
        '                ou: splitKeys[0],\n' +
        '                pe: splitKeys[1]\n' +
        '            };\n' +
        '            const obj = a[d] || b[d];\n' +
        '            const d1 = obj[0];\n' +
        '            result.value = d1.value;\n' +
        '            result.hierarchy = d1.hierarchy;\n' +
        '            return result;\n' +
        '        });\n' +
        '    } else if ((val1.type === \'2\' && val2.type === \'1\') || (val1.type === \'3\' && val2.type === \'1\')) {\n' +
        '        const units = val2.values.map(function (vl) {\n' +
        '            return vl.id\n' +
        '        });\n' +
        '        return val1.values.filter(function (v) {\n' +
        '            return units.indexOf(v.ou) !== -1;\n' +
        '        });\n' +
        '    } else if ((val1.type === \'1\' && val2.type === \'2\') || (val1.type === \'1\' && val2.type === \'3\')) {\n' +
        '        const units = val1.values.map(function (vl) {\n' +
        '            return vl.id\n' +
        '        });\n' +
        '        return val2.values.filter(function (v) {\n' +
        '            return units.indexOf(v.ou) !== -1;\n' +
        '        });\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'async function process(unit, conditions, period, num, den) {\n' +
        '    let final = {};\n' +
        '    const withOus = conditions.filter(function (condition) {\n' +
        '        return condition.type === \'group\' || condition.type === \'level\';\n' +
        '    });\n' +
        '\n' +
        '    const withElements = conditions.filter(function (condition) {\n' +
        '        return condition.type === \'dataElement\' || condition.type === \'dataSet\' || condition.type === \'indicator\';\n' +
        '    });\n' +
        '\n' +
        '    const joined = conditions.filter(function (condition) {\n' +
        '        return condition.type === \'Joiner\';\n' +
        '    }).sort(function (a, b) {\n' +
        '        return a.sortId > b.sortId ? 1 : -1;\n' +
        '    });\n' +
        '    if (withOus.length > 0) {\n' +
        '        const organisationUnits = await fetchOrganisations(unit);\n' +
        '        for (const withOu of withOus) {\n' +
        '            if (withOu.type === \'level\') {\n' +
        '                const found1 = organisationUnits.filter(function (organisation) {\n' +
        '                    if (withOu.comparator === \'==\') {\n' +
        '                        return organisation.level === withOu.value;\n' +
        '                    } else if (withOu.comparator === \'<\') {\n' +
        '                        return organisation.level < withOu.value;\n' +
        '                    } else if (withOu.comparator === \'<=\') {\n' +
        '                        return organisation.level <= withOu.value;\n' +
        '                    } else if (withOu.comparator === \'>\') {\n' +
        '                        return organisation.level > withOu.value;\n' +
        '                    } else if (withOu.comparator === \'>=\') {\n' +
        '                        return organisation.level >= withOu.value;\n' +
        '                    } else if (withOu.comparator === \'IN\') {\n' +
        '                        const units = withOu.value.split(\',\');\n' +
        '                        return units.indexOf(organisation.level) !== -1;\n' +
        '                    }\n' +
        '                    return false;\n' +
        '                });\n' +
        '\n' +
        '                final[withOu.name] = {\n' +
        '                    values: found1,\n' +
        '                    type: \'1\'\n' +
        '                }\n' +
        '            } else if (withOu.type === \'group\') {\n' +
        '                const found2 = organisationUnits.filter(function (organisation) {\n' +
        '                    if (withOu.comparator === \'==\') {\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return ouGroup.id === withOu.value;\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    } else if (withOu.comparator === \'<\') {\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return ouGroup.id < withOu.value;\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    } else if (withOu.comparator === \'<=\') {\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return ouGroup.id <= withOu.value;\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    } else if (withOu.comparator === \'>\') {\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return ouGroup.id > withOu.value;\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    } else if (withOu.comparator === \'>=\') {\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return ouGroup.id >= withOu.value;\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    } else if (withOu.comparator === \'IN\') {\n' +
        '                        const units = withOu.value.split(\',\');\n' +
        '\n' +
        '                        const filtered = organisation.organisationUnitGroups.filter(function (ouGroup) {\n' +
        '                            return units.indexOf(ouGroup.id) !== -1\n' +
        '                        });\n' +
        '                        return filtered.length > 0;\n' +
        '                    }\n' +
        '                    return false;\n' +
        '                });\n' +
        '\n' +
        '                final[withOu.name] = {\n' +
        '                    values: found2,\n' +
        '                    type: \'1\'\n' +
        '                }\n' +
        '\n' +
        '            }\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    const foundData = await fetchDataElements(period, unit, withElements);\n' +
        '\n' +
        '    for (let i = 0; i < withElements.length; i++) {\n' +
        '        const dt = foundData[i];\n' +
        '        console.log(dt);\n' +
        '        const current = withElements[i];\n' +
        '        const columns = dt.headers.map(function (h) {\n' +
        '            return h.name;\n' +
        '        });\n' +
        '\n' +
        '        let val = dt.rows.map(function (r) {\n' +
        '            return Object.assign.apply({}, columns.map(function (v, i) {\n' +
        '                const obj = {};\n' +
        '                obj[v] = r[i];\n' +
        '                return obj;\n' +
        '            }));\n' +
        '        }).map(function (d) {\n' +
        '\n' +
        '            if (current.otherCalculation) {\n' +
        '                const data = eval(d.value + current.otherCalculation);\n' +
        '                d.value = data;\n' +
        '            } else {\n' +
        '                d.value = parseFloat(d.value);\n' +
        '            }\n' +
        '            d.hierarchy = dt.metaData.ouHierarchy[d[\'ou\']];\n' +
        '            return d;\n' +
        '        });\n' +
        '\n' +
        '        final[current.name] = {\n' +
        '            values: val,\n' +
        '            type: \'2\',\n' +
        '            lastMonths: current.lastMonths,\n' +
        '            items: dt.metaData.items,\n' +
        '            periods: dt.metaData.dimensions.pe,\n' +
        '            period: period\n' +
        '\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    for (const j of joined) {\n' +
        '\n' +
        '        const condition1 = j.condition1;\n' +
        '        const condition2 = j.condition2;\n' +
        '        const data1 = final[condition1];\n' +
        '        const data2 = final[condition2];\n' +
        '\n' +
        '        let data = null;\n' +
        '\n' +
        '        switch (j.comparator) {\n' +
        '            case \'+\':\n' +
        '                data = add(data1, data2);\n' +
        '                break;\n' +
        '\n' +
        '            case \'-\':\n' +
        '                data = subtract(data1, data2);\n' +
        '                break;\n' +
        '\n' +
        '            case \'||\':\n' +
        '                data = or(data1, data2);\n' +
        '                break;\n' +
        '\n' +
        '            case \'&&\':\n' +
        '                data = and(data1, data2);\n' +
        '                break;\n' +
        '            default:\n' +
        '                console.log(\'Nothing provided\');\n' +
        '        }\n' +
        '        switch (j.comparator1) {\n' +
        '            case \'==\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value === j.value\n' +
        '                });\n' +
        '                break;\n' +
        '\n' +
        '            case \'<\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value < j.value\n' +
        '                });\n' +
        '                break;\n' +
        '            case \'<=\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value <= j.value\n' +
        '                });\n' +
        '                break;\n' +
        '            case \'>\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value > j.value\n' +
        '                });\n' +
        '                break;\n' +
        '\n' +
        '            case \'>=\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value >= j.value\n' +
        '                });\n' +
        '                break;\n' +
        '\n' +
        '            case \'!=\':\n' +
        '                data = data.filter(function (d) {\n' +
        '                    return d.value !== j.value\n' +
        '                });\n' +
        '                break;\n' +
        '            default:\n' +
        '                console.log(\'Nothing provided\');\n' +
        '        }\n' +
        '\n' +
        '        final[j.name] = {\n' +
        '            values: data,\n' +
        '            type: \'3\',\n' +
        '            periods: data1.periods,\n' +
        '            items: _.assign({}, data1.items, data2.items),\n' +
        '            period: period\n' +
        '        }\n' +
        '    }\n' +
        '    return final;\n' +
        '}\n' +
        '\n' +
        'async function call() {\n' +
        '    try {\n' +
        '        const ous = parameters.ou.split(\';\');\n' +
        '\n' +
        '        const rows = [];\n' +
        '\n' +
        '        const num = parameters.rule.json.numerator;\n' +
        '        const den = parameters.rule.json.denominator;\n' +
        '        const final = await process(parameters.ou, parameters.rule.json.conditions, parameters.pe);\n' +
        '        const numerator = final[num];\n' +
        '        const denominator = final[den];\n' +
        '        const foundItems = numerator && denominator ? _.assign({}, numerator.items, denominator.items) : numerator.items;\n' +
        '\n' +
        '        const periods = numerator.periods;\n' +
        '\n' +
        '        const items = {\n' +
        '            [parameters.rule.id]: {\n' +
        '                name: parameters.rule.name\n' +
        '            }\n' +
        '        };\n' +
        '\n' +
        '        ous.forEach((o) => {\n' +
        '            items[o] = _.assign({}, foundItems[o]);\n' +
        '        });\n' +
        '\n' +
        '        for (const ou of ous) {\n' +
        '            for (const pe of periods) {\n' +
        '                items[pe] = _.assign({}, foundItems[pe]);\n' +
        '                if (numerator && denominator) {\n' +
        '                    let n = 0;\n' +
        '                    let d = 0;\n' +
        '                    if (numerator.type === \'2\' || numerator.type === \'3\') {\n' +
        '                        if (numerator.lastMonths > 0) {\n' +
        '                            let foundUnits = [];\n' +
        '                            const whichPeriods = whichPeriod(pe, numerator.lastMonths);\n' +
        '                            const searched = numerator.values.filter(function (f) {\n' +
        '                                return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '\n' +
        '                            const searchedGrouped = _.groupBy(searched, \'ou\');\n' +
        '\n' +
        '                            _.forOwn(searchedGrouped, function (val, key) {\n' +
        '                                if (val.length === whichPeriods.length) {\n' +
        '                                    foundUnits = foundUnits.concat(key);\n' +
        '                                }\n' +
        '                            });\n' +
        '\n' +
        '                            n = foundUnits.length;\n' +
        '\n' +
        '                        } else {\n' +
        '                            const searched = numerator.values.filter(function (f) {\n' +
        '                                return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '                            if (parameters.rule.numIsOuCount) {\n' +
        '                                const filtered = searched.map((v) => {\n' +
        '                                    return v.ou;\n' +
        '                                });\n' +
        '                                n = _.uniq(filtered).length;\n' +
        '                            } else if (searched.length > 0) {\n' +
        '                                n = searched[0].value;\n' +
        '                            } else {\n' +
        '                                n = 0;\n' +
        '                            }\n' +
        '                        }\n' +
        '                    } else {\n' +
        '                        const searched = numerator.values.map(function (v) {\n' +
        '                            return v.id;\n' +
        '                        });\n' +
        '                        n = _.uniq(searched).length;\n' +
        '                    }\n' +
        '\n' +
        '                    if (denominator.type === \'2\' || denominator.type === \'3\') {\n' +
        '\n' +
        '                        if (denominator.lastMonths > 0) {\n' +
        '                            let foundUnits = [];\n' +
        '                            const whichPeriods = whichPeriod(pe, denominator.lastMonths);\n' +
        '                            const searched = denominator.values.filter(function (f) {\n' +
        '                                return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '\n' +
        '                            const searchedGrouped = _.groupBy(searched, \'ou\');\n' +
        '\n' +
        '                            _.forOwn(searchedGrouped, function (val, key) {\n' +
        '                                if (val.length === whichPeriods.length) {\n' +
        '                                    foundUnits = foundUnits.concat(key);\n' +
        '                                }\n' +
        '                            });\n' +
        '\n' +
        '                            d = foundUnits.length;\n' +
        '\n' +
        '                        } else {\n' +
        '                            const searched = denominator.values.filter(function (f) {\n' +
        '                                return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '                            if (parameters.rule.denIsOuCount) {\n' +
        '                                const filtered = searched.map((v) => {\n' +
        '                                    return v.ou;\n' +
        '                                });\n' +
        '                                d = _.uniq(filtered).length;\n' +
        '                            } else if (searched.length > 0) {\n' +
        '                                d = searched[0].value;\n' +
        '                            } else {\n' +
        '                                d = 0;\n' +
        '                            }\n' +
        '                        }\n' +
        '\n' +
        '                    } else {\n' +
        '                        const searched = denominator.values.map(function (v) {\n' +
        '                            return v.id;\n' +
        '                        });\n' +
        '                        d = _.uniq(searched).length;\n' +
        '                    }\n' +
        '\n' +
        '                    if (d > 0) {\n' +
        '                        const ind = (n / d) * 100;\n' +
        '                        rows.push([parameters.rule.id, pe, ou, \'\' + ind.toFixed(2)]);\n' +
        '                    } else {\n' +
        '                        rows.push([parameters.rule.id, pe, ou, \'0\']);\n' +
        '                    }\n' +
        '\n' +
        '                } else if (numerator) {\n' +
        '                    if (numerator.type === \'2\' || numerator.type === \'3\') {\n' +
        '                        if (numerator.lastMonths > 0) {\n' +
        '                            let foundUnits = [];\n' +
        '                            const whichPeriods = whichPeriod(pe, numerator.lastMonths);\n' +
        '                            const searched = numerator.values.filter(function (f) {\n' +
        '                                return whichPeriods.indexOf(f.pe) !== -1 && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '                            const searchedGrouped = _.groupBy(searched, \'ou\');\n' +
        '                            _.forOwn(searchedGrouped, function (val, key) {\n' +
        '                                if (val.length === whichPeriods.length) {\n' +
        '                                    foundUnits = [...foundUnits, key];\n' +
        '                                }\n' +
        '                            });\n' +
        '\n' +
        '                            rows.push([parameters.rule.id, pe, ou, \'\' + foundUnits.length]);\n' +
        '                        } else {\n' +
        '                            const searched = numerator.values.filter(function (f) {\n' +
        '                                return f.pe === pe && (f.hierarchy.indexOf(ou) !== -1 || f.ou === ou);\n' +
        '                            });\n' +
        '                            if (parameters.rule.numIsOuCount) {\n' +
        '                                const filtered = searched.map((v) => {\n' +
        '                                    return v.ou;\n' +
        '                                });\n' +
        '                                rows.push([parameters.rule.id, pe, ou, \'\' + _.uniq(filtered).length]);\n' +
        '                            } else if (searched.length > 0) {\n' +
        '                                rows.push([parameters.rule.id, pe, ou, \'\' + searched[0].value]);\n' +
        '                            } else {\n' +
        '                                rows.push([parameters.rule.id, pe, ou, \'-\']);\n' +
        '                            }\n' +
        '                        }\n' +
        '                    } else {\n' +
        '                        const searched = numerator.values.map(function (v) {\n' +
        '                            return v.id;\n' +
        '                        });\n' +
        '                        rows.push([parameters.rule.id, pe, ou, \'\' + _.uniq(searched).length]);\n' +
        '\n' +
        '                    }\n' +
        '                }\n' +
        '            }\n' +
        '        }\n' +
        '        var sanitizedAnalyticsObject = {\n' +
        '            headers: [{\n' +
        '                "name": "dx",\n' +
        '                "column": "Data",\n' +
        '                "valueType": "TEXT",\n' +
        '                "type": "java.lang.String",\n' +
        '                "hidden": false,\n' +
        '                "meta": true\n' +
        '            }, {\n' +
        '                "name": "pe",\n' +
        '                "column": "Period",\n' +
        '                "valueType": "TEXT",\n' +
        '                "type": "java.lang.String",\n' +
        '                "hidden": false,\n' +
        '                "meta": true\n' +
        '            }, {\n' +
        '                "name": "ou",\n' +
        '                "column": "Organisation unit",\n' +
        '                "valueType": "TEXT",\n' +
        '                "type": "java.lang.String",\n' +
        '                "hidden": false,\n' +
        '                "meta": true\n' +
        '            }, {\n' +
        '                "name": "value",\n' +
        '                "column": "Value",\n' +
        '                "valueType": "NUMBER",\n' +
        '                "type": "java.lang.Double",\n' +
        '                "hidden": false,\n' +
        '                "meta": false\n' +
        '            }],\n' +
        '            metaData: {\n' +
        '                items: items,\n' +
        '                dimensions: {\n' +
        '                    "dx": [parameters.rule.id],\n' +
        '                    "pe": periods,\n' +
        '                    "ou": ous\n' +
        '                }\n' +
        '            },\n' +
        '            height: rows.length,\n' +
        '            width: 4,\n' +
        '            rows: rows\n' +
        '        };\n' +
        '        parameters.success(sanitizedAnalyticsObject);\n' +
        '    } catch (e) {\n' +
        '        console.log(e);\n' +
        '        parameters.error(e);\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'call();';

    @observable numerator = '';
    @observable denominator = '';

    @action setNumerator = (val) => this.rule.json.numerator = val;
    @action setDenominator = (val) => this.rule.json.denominator = val;
    @action setSelectionEnd = (val) => this.selectionEnd = val;
    @action setId = (val) => this.id = val;
    @action setName = (val) => this.name = val;
    @action setDescription = (val) => this.description = val;
    @action setConditions = (val) => this.rule.json.conditions = val;
    @action setConditionDialogOpen = (val) => this.conditionDialogOpen = val;
    @action setDialogOpen = (val) => this.dialogOpen = val;
    @action setRuleDialogOpen = (val) => this.ruleDialogOpen = val;
    @action setCondition = (val) => this.condition = val;
    @action setRule = (val) => this.rule = val;
    @action setRules = (val) => this.rules = val;
    @action setFunction = (val) => this.function = val;

    @action openConditionDialog = () => this.setConditionDialogOpen(true);
    @action openRuleDialog = () => this.setRuleDialogOpen(true);

    @action deleteCondition = (val) => {
        const filtered = this.rule.json.conditions.filter((condition) => {
            return condition.id !== val.id;
        });

        this.setConditions(filtered);
    };

    @action openTestDialog = () => {
        this.testDialogOpen = true;
    };

    @action closeTestDialog = () => {
        this.testDialogOpen = false;
    };


    @action openDialog = () => {
        this.condition.type = 'Joiner';
        this.dialogOpen = true;
    };

    @action closeDialog = () => {
        this.setCondition(new Condition());
        this.dialogOpen = false;
    };

    @action closeConditionDialog = () => {
        this.setCondition(new Condition());
        this.setConditionDialogOpen(false)
    };

    @action closeRuleDialog = () => {
        this.setRuleDialogOpen(false);
    };

    @action okCondition = () => {
        this.addCondition();
        this.closeConditionDialog();
        this.closeDialog();
    };

    @action okRule = () => {
        this.addRule();
        this.closeRuleDialog()
    };


    @action valueChangeName = (event) => {
        this.setName(event.target.value);
    };

    @action valueChangeNumerator = (event) => {
        this.setNumerator(event.target.value);
    };

    @action valueChangeDenominator = (event) => {
        this.setDenominator(event.target.value);
    };

    @action valueChangeTestOrgUnit = (event) => {
        this.testOrgUnit = event.target.value;
    };

    @action valueChangeTestPeriod = (event) => {
        this.testPeriod = event.target.value;
    };

    @action valueChangeDescription = (event) => {
        this.setDescription(event.target.value);
    };

    @action valueChange = (what) => (event) => {
        if (what === 1) {
            this.setNumerator(event.target.value);
        } else if (what === 2) {
            this.setDenominator(event.target.value);
        }
        this.setSelectionEnd(event.target.selectionStart);
    };

    @action onClick = (event) => {
        this.setSelectionEnd(event.target.selectionStart);
    };

    @action addCondition = () => {

        const mapping = _.findIndex(this.rule.json.conditions, (condition) => {
            return this.condition.id === condition.id;
        });

        if (mapping !== -1) {
            this.rule.json.conditions.splice(mapping, 1, this.condition);
        } else {
            this.condition.sortId = this.rule.json.conditions.length + 1;
            const merged = [...this.rule.json.conditions, this.condition];
            this.setConditions(merged);
        }
    };

    @action addRule = () => {
        this.rule.name = this.name;
        this.rule.description = this.description;
        this.setRules([this.rule]);
    };

    @action setCurrentRule = (val) => () => {
        this.setRule(val);
        this.openRuleDialog();
    };

    @action setCurrentCondition = (val) => {
        this.setCondition(val);
        if (val.type === 'Joiner') {
            this.openDialog();
        } else {
            this.openConditionDialog();
        }
    };

    @computed get isDX() {
        return ['dataElement', 'dataSet', 'indicator'].indexOf(this.condition.type) !== -1
    }

    @computed get label() {
        switch (this.condition.type) {

            case 'dataElement':
                return 'Selected data element';

            case 'dataSet':
                return 'Selected data set';

            case 'indicator':
                return 'Selected indicator';

            default:
                return '';

        }
    }

}
