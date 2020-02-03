import React from 'react';
import { inject, observer } from "mobx-react";
import {
  Button,
  Input,
  Spin,
  Form,
  Row,
  Col, Select
} from 'antd';


import OuTreeDialog from "./dialogs/OuTreeDialog";
import PeriodDialog from "./dialogs/PeriodDialog";
import * as PropTypes from "prop-types";
import IndicatorTable from "./IndicatorTable";
import NumeratorDialog from './dialogs/Numerator';

const { TextArea } = Input;
const { Option } = Select;

@inject('store')
@observer
class Indicator extends React.Component {
  store = null;
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
    const { d2, store } = props;
    store.setD2(d2);
    this.store = store;
  }

  render() {
    return (
      <Spin tip="Loading..." spinning={this.store.spinning} size="large">
        <div style={{ marginLeft: 5, marginRight: 5, paddingTop: 5 }}>
          <Form>
            <Row>
              <Col span={12} style={{ paddingRight: 5 }}>
                <Form.Item label="Indicator Name">
                  <Input placeholder="Indicator name" value={this.store.indicator.name}
                    onChange={this.store.indicator.valueChangeName} size="large" />
                </Form.Item>

                <Form.Item label="Indicator Description">
                  <TextArea
                    rows={6}
                    style={{ fontSize: '16px' }}
                    value={this.store.indicator.description}
                    onChange={this.store.indicator.valueChangeDescription}
                  />
                </Form.Item>

                <Form.Item label="Organisation Level">
                  <Select
                    size="large"
                    placeholder="Please select"
                    onChange={this.store.indicator.rule.setLevel}
                    value={this.store.indicator.rule.level}
                    style={{ width: '100%' }}
                  >
                    {this.store.organisationLevels.map((level) =>
                      <Option key={level.id} value={`LEVEL-${level.level}`}>{level.name}</Option>)}
                  </Select>
                </Form.Item>

                {/* <pre>{JSON.stringify(this.store.indicator,null,2)}</pre> */}

                <div style={{ display: 'flex', marginBottom: 20 }}>
                  <NumeratorDialog
                    condition={this.store.indicator.rule.numerator}
                    onChange={this.store.indicator.setNumerator}
                    onClick={this.store.indicator.onNumeratorClick}
                    openDialog={this.store.indicator.openNumeratorDialog}
                    dialogOpen={this.store.indicator.numeratorDialogOpen}
                    okDialog={this.store.indicator.closeNumeratorDialog}
                    closeDialog={this.store.indicator.closeNumeratorDialog}
                    title={this.store.indicator.rule.numerator === '' ? 'Numerator' : 'Edit Numerator'}
                    okButtonProps={{}}
                    handlePadClick={this.store.indicator.handleNumeratorPadClick}
                    style={{}}
                  />
                  &nbsp;
                  <NumeratorDialog
                    condition={this.store.indicator.rule.denominator}
                    onChange={this.store.indicator.setDenominator}
                    onClick={this.store.indicator.onDenominatorClick}
                    openDialog={this.store.indicator.openDenominatorDialog}
                    dialogOpen={this.store.indicator.denominatorDialogOpen}
                    okDialog={this.store.indicator.closeDenominatorDialog}
                    closeDialog={this.store.indicator.closeDenominatorDialog}
                    title={this.store.indicator.rule.denominator === '' ? 'Denominator' : 'Edit Denominator'}
                    okButtonProps={{}}
                    handlePadClick={this.store.indicator.handleDenominatorPadClick}
                    style={{ marginLeft: 'auto' }}
                  />
                </div>

                <div style={{ display: 'flex' }}>
                  <Button size="large" htmlType="button"
                    onClick={this.store.cancel}>Cancel</Button>
                  <Button size="large" htmlType="button"
                    onClick={this.store.addIndicator} style={{ marginLeft: 'auto' }}>Save Indicator</Button>
                </div>
              </Col>
              <Col span={12} style={{ paddingLeft: 5 }}>
                <div style={{ display: 'flex', marginTop: 30 }}>
                  <PeriodDialog d2={this.props.d2} />
                  <OuTreeDialog d2={this.props.d2} />
                  <Button size="large" htmlType="button" type="primary"
                    onClick={this.store.preview}
                    style={{ marginLeft: 'auto' }}>View</Button>
                </div>

                <div style={{
                  minHeight: '33vh',
                  overflow: 'auto',
                  marginTop: 20,
                  marginBottom: 20,
                  maxHeight: '50vh'
                }}>
                  <IndicatorTable d2={this.props.d2} />
                </div>

              </Col>
            </Row>
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
