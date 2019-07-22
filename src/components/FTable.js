import React from 'react';
import Table from '@dhis2/d2-ui-table';
import '@dhis2/d2-ui-core/css/Table.css';
import {inject, observer} from "mobx-react";
import * as PropTypes from "prop-types";

@inject('store')
@observer
class FTable extends React.Component {

    render() {

        const {rows, columns, contextMenu, primaryAction, icons} = this.props;
        return (
            <Table
                columns={columns}
                rows={rows}
                contextMenuActions={contextMenu}
                contextMenuIcons={icons}
                primaryAction={primaryAction}
            />
        );
    }
}

FTable.propTypes = {
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    contextMenu: PropTypes.object.isRequired,
    icons: PropTypes.object.isRequired,
    primaryAction: PropTypes.func

};

export default FTable;
