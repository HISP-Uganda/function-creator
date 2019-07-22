import React from 'react';
import {inject, observer} from "mobx-react";
import {
    Button,
    Input,
    Modal,
    Spin,
    Form,
    Row,
    Col,
    Tabs,
    Table,
    Select,
} from 'antd';


import OuTreeDialog from "./dialogs/OuTreeDialog";
import PeriodDialog from "./dialogs/PeriodDialog";
import FTable from "./FTable";
import * as PropTypes from "prop-types";
import IndicatorTable from "./IndicatorTable";

const {TextArea} = Input;
const {TabPane} = Tabs;

const {Option} = Select;

@inject('store')
@observer
class Indicator extends React.Component {
    store = null
    columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    }];

    dataElementColumns = [{
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
    }, ...this.columns];

    organisationColumns = [...this.columns, {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
    }];

    constructor(props) {
        super(props);
        const {d2, store} = props;
        store.setD2(d2);
        this.store = store;
    }

    render() {
        return (
            <Spin tip="Loading..." spinning={this.store.spinning} size="large">
                <div style={{marginLeft: 5, marginRight: 5, paddingTop: 5}}>
                    <Form>
                        <div style={{display: 'flex'}}>
                            <PeriodDialog d2={this.props.d2}/>
                            <OuTreeDialog d2={this.props.d2}/>
                        </div>
                        <div style={{maxHeight: '33vh', overflow: 'auto', marginTop: 20, marginBottom: 20}}>
                            <IndicatorTable d2={this.props.d2}/>
                        </div>

                        <Row>
                            <Col span={12} style={{paddingRight: 5}}>
                                <Form.Item label="Indicator Name">
                                    <Input placeholder="Indicator name" value={this.store.indicator.name}
                                           onChange={this.store.indicator.valueChangeName} size="large"/>
                                </Form.Item>
                                <Form.Item label="Indicator Description">
                                <TextArea
                                    rows={6}
                                    style={{fontSize: '16px'}}
                                    value={this.store.indicator.description}
                                    onChange={this.store.indicator.valueChangeDescription}
                                />
                                </Form.Item>

                                <Form.Item label="Numerator condition">
                                    <Select style={{width: '100%'}}
                                            onChange={this.store.indicator.rule.json.setNumerator}
                                            size="large" value={this.store.indicator.rule.json.numerator}>
                                        {this.store.indicator.rule.json.conditions.map(condition =>
                                            <Option key={condition.id}
                                                    value={condition.name}>{condition.name}</Option>)}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Denominator condition">
                                    <Select style={{width: '100%'}}
                                            onChange={this.store.indicator.rule.json.setDenominator}
                                            size="large" value={this.store.indicator.rule.json.denominator}>
                                        <Option value="1">1</Option>
                                        {this.store.indicator.rule.json.conditions.map(condition =>
                                            <Option key={condition.id}
                                                    value={condition.name}>{condition.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12} style={{paddingLeft: 5}}>
                                <FTable rows={this.store.indicator.rule.json.conditions} columns={['name']}
                                        contextMenu={this.store.conditionActions} icons={{}}
                                        primaryAction={this.store.indicator.setCurrentCondition}/>

                                <Button size="large" htmlType="button" type="primary"
                                        onClick={this.store.indicator.openConditionDialog}>Add
                                    Condition</Button>&nbsp;&nbsp;&nbsp;
                                <Button size="large" htmlType="button" type="primary"
                                        onClick={this.store.indicator.openDialog}
                                        disabled={this.store.indicator.rule.json.conditions.length < 2}>Join Two
                                    Conditions</Button>
                            </Col>
                        </Row>

                        <Modal
                            title="Join Two Conditions"
                            visible={this.store.indicator.dialogOpen}
                            centered={true}
                            onOk={this.store.indicator.okCondition}
                            onCancel={this.store.indicator.closeDialog}
                            width="70%"
                            maskClosable={false}
                            okButtonProps={{size: 'large'}}
                            cancelButtonProps={{size: 'large'}}
                            align={null}
                        >
                            <Form.Item label="Name">
                                <Input placeholder="Condition name" value={this.store.indicator.condition.name}
                                       onChange={this.store.indicator.condition.valueChangeName} size="large"/>
                            </Form.Item>
                            <Form.Item label="Condition 1">
                                <Select style={{width: '100%'}} onChange={this.store.indicator.condition.setCondition1}
                                        size="large" value={this.store.indicator.condition.condition1}>
                                    {this.store.indicator.rule.json.conditions.map(condition =>
                                        <Option key={condition.id}
                                                value={condition.name}>{condition.name}</Option>)}
                                </Select>
                            </Form.Item>

                            {this.store.indicator.condition.condition1 !== '' ? <Form.Item label="Sign 1">
                                <Select style={{width: '100%'}} onChange={this.store.indicator.condition.setComparator}
                                        size="large" value={this.store.indicator.condition.comparator}>
                                    <Option value="+">+</Option>
                                    <Option value="-">-</Option>
                                    <Option value="/">/</Option>
                                    <Option value="*">x</Option>
                                    <Option value="&&">AND</Option>
                                    <Option value="||">OR</Option>
                                    <Option value="!">NOT</Option>
                                </Select>
                            </Form.Item> : null}

                            {this.store.indicator.condition.comparator !== '' && this.store.indicator.condition.comparator !== 'None' ?
                                <Form.Item label="Condition 2">
                                    <Select style={{width: '100%'}}
                                            onChange={this.store.indicator.condition.setCondition2}
                                            size="large" value={this.store.indicator.condition.condition2}>
                                        {this.store.possible.map(condition =>
                                            <Option key={condition.id}
                                                    value={condition.name}>{condition.name}</Option>)}
                                    </Select>
                                </Form.Item> : null}

                            {this.store.indicator.condition.condition2 !== '' && !this.store.hideSignAndValueField ?
                                <Form.Item label="Sign 2">
                                    <Select style={{width: '100%'}}
                                            onChange={this.store.indicator.condition.setComparator1}
                                            size="large"
                                            value={this.store.indicator.condition.comparator1}
                                    >
                                        <Option value="<">&lt;</Option>
                                        <Option value="<=">&le;</Option>
                                        <Option value=">">&gt;</Option>
                                        <Option value=">=">&ge;</Option>
                                        <Option value="==">==</Option>
                                        <Option value="IN"
                                                disabled={this.store.indicator.condition.type === 'dataElement'}>IN</Option>
                                    </Select>
                                </Form.Item> : null}

                            {this.store.indicator.condition.comparator1 !== '' && !this.store.hideSignAndValueField ?
                                <Form.Item label="Value">
                                    <Input size="large"
                                           value={this.store.indicator.condition.value}
                                           onChange={this.store.indicator.condition.valueChangeDescription}/>
                                </Form.Item> : null}
                        </Modal>

                        <Modal
                            title="Adding Condition"
                            visible={this.store.indicator.conditionDialogOpen}
                            centered={true}
                            onOk={this.store.indicator.okCondition}
                            onCancel={this.store.indicator.closeConditionDialog}
                            width="80%"
                            maskClosable={false}
                            okButtonProps={{disabled: this.store.indicator.condition.disableButton, size: 'large'}}
                            cancelButtonProps={{size: 'large'}}
                            align={null}
                        >
                            <Row>
                                <Col span={10} style={{padding: 10}}>
                                    <Form.Item label="Name">
                                        <Input placeholder="Condition name" value={this.store.indicator.condition.name}
                                               onChange={this.store.indicator.condition.valueChangeName} size="large"/>
                                    </Form.Item>

                                    <Form.Item label="Type">
                                        <Select style={{width: '100%'}}
                                                onChange={this.store.indicator.condition.setType}
                                                size="large" value={this.store.indicator.condition.type}>
                                            <Option value="dataElement">Data Element</Option>
                                            <Option value="group">Organisation Group</Option>
                                            <Option value="level">Organisation Level</Option>
                                            <Option value="dataSet">Data Sets</Option>
                                        </Select>
                                    </Form.Item>


                                    {['dataElement', 'dataSet'].indexOf(this.store.indicator.condition.type) !== -1 ?
                                        <Form.Item label="Selected data element">
                                            <Input size="large"
                                                   value={this.store.indicator.condition.dataElement}/>
                                        </Form.Item> : null}


                                    {this.store.indicator.condition.dataElement !== '' ?
                                        <Form.Item label="Organisation group">
                                            <Select
                                                mode="multiple"
                                                size="large"
                                                placeholder="Please select"
                                                value={this.store.indicator.condition.ouGroups}
                                                style={{width: '100%'}}
                                                onChange={this.store.indicator.condition.setOuGroups}
                                                disabled={this.store.indicator.condition.ouLevels.length !== 0}
                                            >
                                                {this.store.organisationUnitGroups.map((condition) =>
                                                    <Option key={condition.id}
                                                            value={`OU_GROUP-${condition.id}`}>{condition.name}</Option>)}

                                            </Select>
                                        </Form.Item> : null}

                                    {this.store.indicator.condition.dataElement !== '' ?
                                        <Form.Item label="Organisation Level">
                                            <Select
                                                mode="multiple"
                                                size="large"
                                                placeholder="Please select"
                                                onChange={this.store.indicator.condition.setOuLevels}
                                                value={this.store.indicator.condition.ouLevels}
                                                style={{width: '100%'}}
                                                disabled={this.store.indicator.condition.ouGroups.length !== 0}
                                            >
                                                {this.store.organisationLevels.map((condition) =>
                                                    <Option key={condition.id}
                                                            value={`LEVEL-${condition.level}`}>{condition.name}</Option>)}

                                            </Select>
                                        </Form.Item> : null}

                                    {this.store.indicator.condition.dataElement !== '' ?
                                        <Form.Item label="Last how many months">
                                            <Input size="large"
                                                   onChange={this.store.indicator.condition.valueChangeLastMonths}
                                                   value={this.store.indicator.condition.lastMonths}/>
                                        </Form.Item> : null}
                                    {this.store.hideComparator ?
                                        <Form.Item label="Comparator">
                                            <Select style={{width: '100%'}}
                                                    onChange={this.store.indicator.condition.setComparator}
                                                    size="large"
                                                    value={this.store.indicator.condition.comparator}
                                            >
                                                <Option value="None">None</Option>
                                                <Option value="<">&lt;</Option>
                                                <Option value="<=">&le;</Option>
                                                <Option value=">">&gt;</Option>
                                                <Option value=">=">&ge;</Option>
                                                <Option value="==">==</Option>
                                                <Option value="IN"
                                                        disabled={this.store.indicator.condition.type === 'dataElement'}>IN</Option>
                                            </Select>
                                        </Form.Item> : null}


                                    {this.store.hideDataElement ?
                                        <Form.Item label="Data element value">
                                            <Input size="large" value={this.store.indicator.condition.value}
                                                   onChange={this.store.indicator.condition.valueChangeDescription}/>
                                        </Form.Item> : null}


                                    {this.store.indicator.condition.type === 'level' && this.store.indicator.condition.comparator !== '' ?
                                        <Form.Item label="Selected levels">
                                            <Input size="large" value={this.store.indicator.condition.value}/>
                                        </Form.Item> : null}

                                    {this.store.indicator.condition.type === 'group' && this.store.indicator.condition.comparator !== '' ?
                                        <Form.Item label="Selected groups">
                                            <Input size="large" value={this.store.indicator.condition.value}/>
                                        </Form.Item> : null}

                                </Col>
                                <Col span={14} style={{paddingLeft: 10}}>
                                    <Tabs defaultActiveKey="1" activeKey={this.store.indicator.condition.active}>
                                        <TabPane tab="Data Elements" key="1">
                                            <Input value={this.store.search['dataElements']} style={{marginBottom: 10}}
                                                   onChange={this.store.searchChange('dataElements')} size="large"
                                                   placeholder="Search..."/>
                                            <Table dataSource={this.store.searchedDataElements}
                                                   onRow={(record, rowIndex) => {
                                                       return {
                                                           onClick: this.store.indicator.condition.setCurrentDataElement(`${record.id}`),
                                                       };
                                                   }}
                                                   columns={this.dataElementColumns}
                                                   rowKey="id"
                                                   expandedRowRender={(dataElement) =>
                                                       <Table rowKey="id"
                                                              dataSource={dataElement.categoryCombo.categoryOptionCombos}
                                                              onRow={(record, rowIndex) => {
                                                                  return {
                                                                      onClick: this.store.indicator.condition.setCurrentDataElement(`${dataElement.id}.${record.id}`),
                                                                  };
                                                              }}
                                                              columns={this.columns}
                                                              pagination={false}
                                                       />}
                                                   pagination={{pageSize: 5}}
                                            />
                                        </TabPane>
                                        <TabPane tab="Organisation Groups" key="2">
                                            <Input value={this.store.search['ouGroups']} style={{marginBottom: 10}}
                                                   onChange={this.store.searchChange('ouGroups')} size="large"
                                                   placeholder="Search..."/>
                                            <Table dataSource={this.store.searchedOUGroups}
                                                   onRow={(record, rowIndex) => {
                                                       return {
                                                           onClick: this.store.indicator.condition.setOrganisationGroup(record.id)
                                                       };
                                                   }}
                                                   columns={this.columns}
                                                   rowKey="id"
                                                   size="default"
                                                   pagination={{pageSize: 5}}
                                            />
                                        </TabPane>

                                        <TabPane tab="Organisation Levels" key="3">
                                            <Table dataSource={this.store.organisationLevels}
                                                   onRow={(record, rowIndex) => {
                                                       return {
                                                           onClick: this.store.indicator.condition.setOrganisationLevel(record.level)
                                                       };
                                                   }}
                                                   columns={this.organisationColumns}
                                                   rowKey="id"
                                                   size="default"
                                                   pagination={{pageSize: 5}}
                                            />
                                        </TabPane>

                                        <TabPane tab="Data Sets" key="4">
                                            <Input value={this.store.search['dataSets']} style={{marginBottom: 10}}
                                                   onChange={this.store.searchChange('dataSets')} size="large"
                                                   placeholder="Search..."/>
                                            <Table dataSource={this.store.searchedDataSets}
                                                   expandedRowRender={(dataSet) => <div
                                                       style={{display: 'flex', flexWrap: 'wrap'}}>
                                                       <div style={{paddingRight: 5, marginTop: 5}}>
                                                           <Button className="w-full" htmlType="button"
                                                                   onClick={this.store.indicator.condition.setCurrentDataElement(`${dataSet.id}.REPORTING_RATE`)}>Reporting
                                                               Rates
                                                           </Button>
                                                       </div>
                                                       <div style={{paddingRight: 5, marginTop: 5}}>
                                                           <Button className="w-full" htmlType="button"
                                                                   onClick={this.store.indicator.condition.setCurrentDataElement(`${dataSet.id}.REPORTING_RATE_ON_TIME`)}>Reporting
                                                               Rates On Time</Button>
                                                       </div>
                                                       <div style={{paddingRight: 5, marginTop: 5}}>
                                                           <Button className="w-full" htmlType="button"
                                                                   onClick={this.store.indicator.condition.setCurrentDataElement(`${dataSet.id}.ACTUAL_REPORTS`)}>Actual
                                                               Reports</Button>
                                                       </div>
                                                       <div style={{paddingRight: 5, marginTop: 5}}>
                                                           <Button className="w-full" htmlType="button"
                                                                   onClick={this.store.indicator.condition.setCurrentDataElement(`${dataSet.id}.ACTUAL_REPORTS_ON_TIME`)}>Actual
                                                               Reports On Time</Button>
                                                       </div>
                                                       <div style={{paddingRight: 5, marginTop: 5}}>
                                                           <Button className="w-full" htmlType="button"
                                                                   onClick={this.store.indicator.condition.setCurrentDataElement(`${dataSet.id}.EXPECTED_REPORTS`)}>Expected
                                                               Reports</Button>
                                                       </div>
                                                   </div>}
                                                   columns={this.columns}
                                                   rowKey="id"
                                                   size="default"
                                                   pagination={{pageSize: 5}}
                                            />
                                        </TabPane>
                                    </Tabs>
                                </Col>
                            </Row>
                        </Modal>
                        <Form.Item>
                            <Button size="large" htmlType="button" type="primary"
                                    onClick={this.store.addIndicator}
                                    style={{marginRight: 5}}
                                    disabled={this.store.disableSubmit}>Submit</Button>

                            <Button size="large" htmlType="button" type="primary"
                                    onClick={this.store.call}
                                    style={{marginRight: 5}}
                                    disabled={this.store.disableSubmit}>View</Button>
                            <Button size="large" htmlType="button" type="primary"
                                    onClick={this.store.cancel}>Cancel</Button>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        )
    }
}

Indicator.propTypes = {
    d2: PropTypes.object.isRequired

};

export default Indicator;
