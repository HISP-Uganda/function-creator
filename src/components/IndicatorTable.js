import React from 'react';
import {inject, observer} from "mobx-react";
import * as PropTypes from "prop-types";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {withStyles} from "@material-ui/core";


const styles = theme => ({
    root: {
        padding: theme.spacing(3, 2),
    },
});

@inject('store')
@observer
class IndicatorTable extends React.Component {

    store = null;

    constructor(props) {
        super(props);
        const {d2, store} = props;
        store.setD2(d2);
        this.store = store;
    }

    render() {
        const {classes} = this.props
        return <div>
            {this.store.processResult ?
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Period/Organisation</TableCell>
                            {this.store.processResult.periods.map(p =>
                                <TableCell key={p}>{this.store.processResult.items[p].name}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.store.processResult.units.map(o => <TableRow key={o}>
                            <TableCell component="th"
                                       scope="row">{this.store.processResult.items[o].name}</TableCell>
                            {this.store.processResult.periods.map(p =>
                                <TableCell key={p}>{this.store.processResult.data[`${p}${o}`]}</TableCell>)}
                        </TableRow>)}
                    </TableBody>
                </Table>
                : null
            }
        </div>
    }

}


IndicatorTable.propTypes = {
    d2: PropTypes.object.isRequired

};

export default withStyles(styles)(IndicatorTable);
