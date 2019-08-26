import {Button, Col, Input, Modal, Row, Select, Table, Tabs, Form} from "antd";
import React from "react";
import {inject, observer} from "mobx-react";
import {AGGREGATE_TYPES} from "../../stores/constants";

const {Option} = Select;
const {TabPane} = Tabs;
const {TextArea} = Input;


@inject('store')
@observer
class AddConditionDialog extends React.Component {

    store = null;

    columns = [{
        title: 'UID',
        dataIndex: 'id',
        key: 'id',
    }, {
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
            <div>
                <div>
                    <Button size="large" htmlType="button" type="primary"
                            onClick={this.store.indicator.openConditionDialog}>Add
                        Condition</Button>&nbsp;&nbsp;&nbsp;
                </div>
                <Modal
                    title="Adding Condition"
                    visible={this.store.indicator.conditionDialogOpen}
                    onOk={this.store.indicator.okCondition}
                    onCancel={this.store.indicator.closeConditionDialog}
                    width="80%"
                    maskClosable={false}
                    destroyOnClose
                    okButtonProps={{disabled: this.store.indicator.condition.disableButton, size: 'large'}}
                    cancelButtonProps={{size: 'large'}}
                    align={null}
                >
                    <Row>
                        <Col span={12} style={{paddingRight: 5}}>
                            <Form.Item label="Name">
                                <Input placeholder="Condition name" value={this.store.indicator.condition.name}
                                       onChange={this.store.indicator.condition.valueChangeName} size="large"/>
                            </Form.Item>
                        </Col>

                        <Col span={12} style={{paddingLeft: 5}}>
                            <Form.Item label="Type">
                                <Select style={{width: '100%'}}
                                        onChange={this.store.indicator.condition.setType}
                                        size="large" value={this.store.indicator.condition.type}>
                                    <Option value="dataElement">Data Element</Option>
                                    <Option value="group">Organisation Group</Option>
                                    <Option value="level">Organisation Level</Option>
                                    <Option value="dataSet">Data Sets</Option>
                                    <Option value="indicator">Indicators</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} style={{paddingRight: 5}}>

                            {this.store.indicator.isDX ?
                                <Form.Item label={this.store.indicator.label}>
                                    <Input size="large"
                                           value={this.store.indicator.condition.dataElement}/>
                                </Form.Item> : null}

                            {this.store.indicator.condition.dataElement !== '' ?
                                <div>
                                    <Form.Item label="Aggregation Type">
                                        <Select style={{width: '100%'}}
                                                onChange={this.store.indicator.condition.onAggregationTypeChange}
                                                size="large" value={this.store.indicator.condition.aggregationType}>
                                            {AGGREGATE_TYPES.map(type =>
                                                <Option key={type.value}
                                                        value={type.value}>{type.label}</Option>)}
                                        </Select>
                                    </Form.Item>
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
                                    </Form.Item>
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
                                    </Form.Item>
                                    {/*<Form.Item label="Last how many months">
                                        <Input size="large"
                                               onChange={this.store.indicator.condition.valueChangeLastMonths}
                                               value={this.store.indicator.condition.lastMonths}/>
                                    </Form.Item>*/}

                                    <Form.Item label="Other calculations">
                                        <TextArea
                                            value={this.store.indicator.condition.otherCalculation}
                                            onChange={this.store.indicator.condition.valueChangeOtherCalculation}
                                        />
                                    </Form.Item>
                                </div> : null}

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
                        <Col span={12} style={{paddingLeft: 5}}>
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

                                <TabPane tab="Indicators" key="5">
                                    <Input value={this.store.search['systemIndicators']} style={{marginBottom: 10}}
                                           onChange={this.store.searchChange('systemIndicators')} size="large"
                                           placeholder="Search..."/>
                                    <Table dataSource={this.store.searchedSystemIndicators}
                                           columns={this.dataElementColumns}
                                           onRow={(record, rowIndex) => {
                                               return {
                                                   onClick: this.store.indicator.condition.setCurrentDataElement(`${record.id}`),
                                               };
                                           }}
                                           rowKey="id"
                                           size="default"
                                           pagination={{pageSize: 5}}
                                    />
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}

export default AddConditionDialog;
