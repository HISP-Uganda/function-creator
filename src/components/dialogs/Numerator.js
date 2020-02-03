import { Button, Col, Input, Modal, Row, Table, Tabs, Form } from "antd";
import React from "react";
import { inject, observer } from "mobx-react";
import * as PropTypes from "prop-types";

const { TabPane } = Tabs;
const { TextArea } = Input;


@inject('store')
@observer
class NumeratorDialog extends React.Component {
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
    const { d2, store } = props;
    store.setD2(d2);
    this.store = store;
  }

  render() {
    const { condition, onChange, onClick, openDialog, dialogOpen, okDialog, closeDialog, title, okButtonProps, handlePadClick, style } = this.props;
    return (
      <div style={style}>
        <div>
          <Button size="large" htmlType="button" type="primary" onClick={openDialog}>{title}</Button>
        </div>
        <Modal
          title="Adding Condition"
          visible={dialogOpen}
          onOk={okDialog}
          onCancel={closeDialog}
          width="90%"
          maskClosable={false}
          destroyOnClose
          okButtonProps={{ ...okButtonProps, size: 'large' }}
          cancelButtonProps={{ size: 'large' }}
          align={null}
        >
          <Row>
            <Col span={12} style={{ paddingRight: 5 }}>
              <Form.Item label="Name">
                <TextArea
                  rows={4}
                  value={condition}
                  onChange={onChange}
                  onClick={onClick}
                />
              </Form.Item>

              <Button onClick={() => handlePadClick('&&')}>AND</Button>
              <Button onClick={() => handlePadClick('||')}>OR</Button>
              <Button onClick={() => handlePadClick('!')}>NOT</Button>
              <Button onClick={() => handlePadClick('!=')}>NOT EQUAL</Button>

            </Col>
            <Col span={12} style={{ paddingLeft: 5 }}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Data Elements" key="1">
                  <Input value={this.store.search['dataElements']} style={{ marginBottom: 10 }}
                    onChange={this.store.searchChange('dataElements')} size="large"
                    placeholder="Search..." />
                  <Table dataSource={this.store.searchedDataElements}
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: () => handlePadClick(`#{${record.id}}`),
                      };
                    }}
                    columns={this.dataElementColumns}
                    rowKey="id"
                    expandedRowRender={(dataElement) =>
                      <Table rowKey="id"
                        dataSource={dataElement.categoryCombo.categoryOptionCombos}
                        onRow={(record, rowIndex) => {
                          return {
                            onClick: () => handlePadClick(`#{${dataElement.id}.${record.id}}`),
                          };
                        }}
                        columns={this.columns}
                        pagination={false}
                      />}
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>
                <TabPane tab="Organisation Groups" key="2">
                  <Table dataSource={this.store.orgUnitGroupSets}
                    columns={this.columns}
                    rowKey="id"
                    expandedRowRender={(group) =>
                      <Table rowKey="id"
                        dataSource={group.organisationUnitGroups}
                        onRow={(record, rowIndex) => {
                          return {
                            onClick: () => handlePadClick(`OU_GROUP{${record.id}}`),
                          };
                        }}
                        columns={this.columns}
                        pagination={false}
                      />}
                    size="default"
                    pagination={false}
                  />
                </TabPane>

                <TabPane tab="Organisation Levels" key="3">
                  <Table dataSource={this.store.organisationLevels}
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: () => handlePadClick(`OU_LEVEL{${record.level}}`)
                      };
                    }}
                    columns={this.organisationColumns}
                    rowKey="id"
                    size="default"
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>

                <TabPane tab="Data Sets" key="4">
                  <Input value={this.store.search['dataSets']} style={{ marginBottom: 10 }}
                    onChange={this.store.searchChange('dataSets')} size="large"
                    placeholder="Search..." />
                  <Table dataSource={this.store.searchedDataSets}
                    expandedRowRender={(dataSet) => <div
                      style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <div style={{ paddingRight: 5, marginTop: 5 }}>
                        <Button className="w-full" htmlType="button"
                          onClick={() => handlePadClick(`#{${dataSet.id}.REPORTING_RATE}`)}>Reporting
                    Rates
                             </Button>
                      </div>
                      <div style={{ paddingRight: 5, marginTop: 5 }}>
                        <Button className="w-full" htmlType="button"
                          onClick={() => handlePadClick(`#{${dataSet.id}.REPORTING_RATE_ON_TIME}`)}>Reporting
                               Rates On Time</Button>
                      </div>
                      <div style={{ paddingRight: 5, marginTop: 5 }}>
                        <Button className="w-full" htmlType="button"
                          onClick={() => handlePadClick(`#{${dataSet.id}.ACTUAL_REPORTS}`)}>Actual
                               Reports</Button>
                      </div>
                      <div style={{ paddingRight: 5, marginTop: 5 }}>
                        <Button className="w-full" htmlType="button"
                          onClick={() => handlePadClick(`#{${dataSet.id}.ACTUAL_REPORTS_ON_TIME}`)}>Actual
                               Reports On Time</Button>
                      </div>
                      <div style={{ paddingRight: 5, marginTop: 5 }}>
                        <Button className="w-full" htmlType="button"
                          onClick={() => handlePadClick(`#{${dataSet.id}.EXPECTED_REPORTS}`)}>Expected
                               Reports</Button>
                      </div>
                    </div>}
                    columns={this.columns}
                    rowKey="id"
                    size="default"
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>

                <TabPane tab="Indicators" key="5">
                  <Input value={this.store.search['systemIndicators']} style={{ marginBottom: 10 }}
                    onChange={this.store.searchChange('systemIndicators')} size="large"
                    placeholder="Search..." />
                  <Table dataSource={this.store.searchedSystemIndicators}
                    columns={this.dataElementColumns}
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: () => handlePadClick(`#{${record.id}}`),
                      };
                    }}
                    rowKey="id"
                    size="default"
                    pagination={{ pageSize: 5 }}
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

NumeratorDialog.propTypes = {
  condition: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  okDialog: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  okButtonProps: PropTypes.object.isRequired,
  handlePadClick: PropTypes.func.isRequired
};

export default NumeratorDialog;
