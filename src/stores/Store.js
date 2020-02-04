import { action, computed, observable } from 'mobx';
import { Indicator } from './Indicator';
import { Rule } from "./Rule";
import { generateUid } from "../utils";
import * as _ from 'lodash';

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
  @observable systemIndicators = [];
  @observable orgUnitGroupSets = [];

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
  @observable paging = {
    indicators: {
      page: 0,
      rowsPerPage: 10
    },
    conditions: {
      page: 0,
      rowsPerPage: 10
    }
  };

  @action setPaging = val => this.paging = val;

  @action
  handleChangeElementPage = what => (event, page) => {
    const current = this.paging[what];
    const change = {};
    if (current) {
      change.page = page;
      change.rowsPerPage = current.rowsPerPage;
      const data = _.fromPairs([
        [what, change]
      ]);

      const p = {
        ...this.paging,
        ...data
      };

      this.setPaging(p);
    }
  };

  @action
  handleChangeElementRowsPerPage = what => event => {
    const current = this.paging[what];
    const change = {};
    if (current) {
      change.rowsPerPage = event.target.value;
      change.page = current.page;
      const data = _.fromPairs([
        [what, change]
      ]);
      const p = {
        ...this.paging,
        ...data
      };

      this.setPaging(p);
    }
  };

  fetchAnalyticsStructure = async (periods, orgs) => {
    const api = this.d2.Api.getApi();
    return await api.get(`analytics.json?dimension=pe:${periods}&dimension=ou:${orgs}&skipData=true&hierarchyMeta=true`);
  }

  fetchOrganisationsByGroups = async (allGroups) => {
    const api = this.d2.Api.getApi();
    return await api.get(`organisationUnitGroups.json?filter=id:in:[${allGroups}]&fields=id,organisationUnits[id]&paging=false`);
  }

  fetchAnalyticsData = async (allDataElements, periods, ous) => {
    const api = this.d2.Api.getApi();
    return await api.get(`analytics.json?dimension=pe:${periods}&dimension=ou:${ous}&dimension=dx:${allDataElements}&hierarchyMeta=true`);
  }

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
  @action showIndicator = () => {
    this.setIndicatorValue(null);
    this.setShowing(false);
  };
  @action setIndicatorValue = (val) => this.indicatorValue = val;
  @action openNumerator = () => this.setNumeratorDialogOpen(true);
  @action setSearch = (field, val) => this.search = { [field]: val };
  @action setIndicatorSearch = (val) => this.indicatorSearch = val;
  @action setDataSets = (val) => this.dataSets = val;
  @action setTreeData = (val) => this.treeData = val;
  @action setDialogOpened = (val) => this.dialogOpened = val;
  @action setSystemIndicators = (val) => this.systemIndicators = val;

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
    const { organisationUnits } = await api.get('organisationUnits.json?level=1&fields=id~rename(key),name~rename(title)');
    this.setTreeData(organisationUnits)
  };


  @action fetchOrganisationGroupSets = async () => {
    const api = this.d2.Api.getApi();
    const { organisationUnitGroupSets } = await api.get('organisationUnitGroupSets.json', {
      paging: false,
      fields: 'id,name,organisationUnitGroups[id,name]'
    });
    this.orgUnitGroupSets = organisationUnitGroupSets;
  };

  @action onUpdate = async (selectedPeriods) => {
    this.setDialogOpened(false);
    if (selectedPeriods.length > 0) {
      await this.preview();
    }
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
        this.setSelected([{ id: loadRootUnit.id, path: loadRootUnit.path }]);
        this.setRoot(loadRootUnit)
      });

    this.loadOrgUnitLevels();
    this.loadOrgUnitGroups();
  };

  fetchLevels = async () => {
    const api = this.d2.Api.getApi();
    const { organisationUnitLevels } = await api.get('organisationUnitLevels.json?fields=level');
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
    this.setOrgUnitDialog(false);
    if ((this.selected.length > 0 || this.userOrgUnits.length > 0) && this.selectedPeriods.length > 0) {
      await this.preview();
    }
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
      .list({ paging: false })
      .then((collection) => collection.toArray())
      .then((levelOptions) => this.setLevelOptions(levelOptions));
  };


  @action handleOrgUnitClick = (event, orgUnit) => {
    if (this.selected.some((ou) => ou.path === orgUnit.path)) {
      this.setSelected(this.selected.filter((ou) => ou.path !== orgUnit.path))
    } else {
      this.setSelected([
        ...this.selected,
        { id: orgUnit.id, displayName: orgUnit.displayName, path: orgUnit.path },
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
      this.setUserOrgUnits([...this.userOrgUnits, { id: event.target.name }])
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

  @action
  call = async (periods, orgs, rule) => {
    try {
      let num = rule.numerator;
      let den = rule.denominator;
      const indicatorId = rule.id;

      const dummy = await this.fetchAnalyticsStructure(periods, orgs);

      const dimensions = dummy.metaData.dimensions;

      const numeratorDataElements = num.match(/#{\w+.?\w*}/g);
      const denominatorDataElements = den.match(/#{\w+.?\w*}/g);

      const numeratorGroups = num.match(/OU_GROUP{\w+.?\w*}/g);
      const denominatorGroups = den.match(/OU_GROUP{\w+.?\w*}/g);

      let allDataElements = [];
      let allGroups = [];
      let allLevels = [];

      if (numeratorDataElements) {
        const des = numeratorDataElements.map(function (de) {
          const replacement = de.replace("#{", "").replace("}", "");
          const we = replacement.replace('.', '');
          num = num.replace(de, `obj['${we}']`);
          return replacement
        });
        allDataElements = _.concat(allDataElements, des);
      }

      if (denominatorDataElements) {
        const des = denominatorDataElements.map(function (de) {
          const replacement = de.replace("#{", "").replace("}", "");
          const we = replacement.replace('.', '');
          den = den.replace(de, `obj['${we}']`);
          return replacement
        });
        allDataElements = _.concat(allDataElements, des);
      }

      if (numeratorGroups) {
        const gps = numeratorGroups.map(function (oug) {
          const replacement = oug.replace("OU_GROUP{", "").replace("}", "");
          num = num.replace(oug, `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`);
          return replacement
        });
        allGroups = _.concat(allGroups, gps);
      }

      if (denominatorGroups) {
        const gps = denominatorGroups.map(function (oug) {
          const replacement = oug.replace("OU_GROUP{", "").replace("}", "");
          den = den.replace(oug, `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`);
          return replacement;
        });
        allGroups = _.concat(allGroups, gps);
      }

      let filterGroups = {};

      if (allGroups.length > 0) {
        const groups = await this.fetchOrganisationsByGroups(allGroups.join(','));
        const processedGroups = groups.organisationUnitGroups.map(function (gp) {
          const units = gp.organisationUnits.map(function (o) {
            return o.id;
          });
          return [gp.id, units];
        });
        filterGroups = _.fromPairs(processedGroups);
      }
      if (rule.level) {
        orgs = `${orgs};${rule.level}`;
      }

      const data = await this.fetchAnalyticsData(allDataElements.join(';'), periods, orgs);

      const whatToGroup = data.rows.map(function (r) {
        const obj = _.fromPairs([
          [r[0].replace('.', ''), parseFloat(r[3])],
          ['pe', r[1]],
          ['ou', `${data.metaData.ouHierarchy[r[2]]}/${r[2]}`],
        ]);
        return obj;
      });

      const grouped = _.groupBy(whatToGroup, function (x) {
        return `${x.pe}${x.ou}`;
      });

      const searches = _.keys(grouped).map(function (x) {
        const val = grouped[x];
        const obj = Object.assign.apply(Object, val);
        const what = _.pick(obj, ['pe', 'ou']);
        what.numerator = eval(num) ? 1 : 0;
        what.denominator = eval(den) ? 1 : 0;
        return what;
      });

      const pp = dimensions.ou.map(function (o) {
        return _(searches.filter(function (s) {
          return s.ou.indexOf(o) !== -1
        })).groupBy('pe').map((objs, key) => {
          const numerator = _.sumBy(objs, 'numerator');
          const denominator = _.sumBy(objs, 'denominator');
          let value = 0;

          if (denominator !== 0) {
            value = String(Number(numerator * 100 / denominator).toFixed(2));
          }
          return {
            'pe': key,
            'value': value
          }
        }).value().map(function (vv) {
          return [indicatorId, vv.pe, o, vv.value];
        });
      });
      dummy.metaData.items[indicatorId] = {
        name: rule.name
      };
      dummy.metaData.dimensions.dx = [indicatorId];
      dummy.rows = _.flatten(pp);
      dummy.height = _.flatten(pp).length;
      dummy.width = 4;
      dummy.headers = [{
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
      }];
      // parameters.success(dummy);
      this.setIndicatorValue(dummy);

    } catch (e) {
      console.log(e);
      // parameters.error({});

    }
  };

  @action preview = async () => {
    this.startSpinning();
    const allUnits = [...this.selected, ...this.userOrgUnits].map(ou => ou.id).join(';')
    await this.call(this.selectedPeriods.map(pe => pe.id).join(';'), allUnits, this.indicator.rule);
    this.stopSpinning();
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
              r.denIsOuCount = rule.denIsOuCount;
              r.numIsOuCount = rule.numIsOuCount;

              r.denominator = rule.denominator || '';
              r.numerator = rule.numerator || '';
              r.level = rule.level;
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
        const { organisationUnitGroups } = await api.get('organisationUnitGroups', { fields: 'id,name,code' });
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
        const { dataElements } = await api.get('dataElements', {
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
  loadSystemIndicators = async () => {
    this.startSpinning();
    if (this.d2) {
      const api = this.d2.Api.getApi();
      try {
        const { indicators } = await api.get('indicators', {
          paging: false,
          fields: 'id,name,code'
        });
        this.setSystemIndicators(indicators);
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
        const { dataSets } = await api.get('dataSets', {
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
    this.setIndicatorValue(null)
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
        return dataElement.name.toLowerCase().includes(search.toLowerCase()) ||
          (dataElement.code && dataElement.code.toLowerCase().includes(search.toLowerCase())) ||
          (dataElement.id && dataElement.id.includes(search));
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

  @computed get pagedIndicators() {
    const info = this.paging['indicators'];
    return this.searchedIndicators.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
  }

  @computed get searchedSystemIndicators() {
    const search = this.search['systemIndicators'];
    if (search && search !== '') {
      return this.systemIndicators.filter((indicator) => {
        return (indicator.name && indicator.name.toLowerCase().includes(search.toLowerCase())) ||
          (indicator.code && indicator.code.toLowerCase().includes(search.toLowerCase())) ||
          indicator.id.includes(search);
      });
    }

    return this.systemIndicators;
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
    return (['dataElement', 'dataSet', 'indicator'].indexOf(this.indicator.condition.type) !== -1
      && this.indicator.condition.dataElement !== '')
      || (['dataElement', 'dataSet', 'indicator'].indexOf(this.indicator.condition.type) === -1
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
        data = { ...data, [`${r[1]}${r[2]}`]: r[3] }
      });

      return {
        data, periods: this.indicatorValue.metaData.dimensions.pe,
        units: this.indicatorValue.metaData.dimensions.ou,
        items: this.indicatorValue.metaData.items
      }
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


