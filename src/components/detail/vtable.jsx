import * as React from 'react';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import Avatar from '@mui/material/Avatar';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { styled } from '@mui/material/styles';
import { green, pink, red } from '@mui/material/colors';
import ErrorIcon from '@mui/icons-material/Error';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

export const classes = {
    flexContainer: 'ReactVirtualizedDemo-flexContainer',
    tableRow: 'ReactVirtualizedDemo-tableRow',
    tableRowHover: 'ReactVirtualizedDemo-tableRowHover',
    tableCell: 'ReactVirtualizedDemo-tableCell',
    noClick: 'ReactVirtualizedDemo-noClick',
};

export const styles = ({ theme }) => ({
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
        ...(theme.direction === 'rtl' && {
            paddingLeft: '0 !important',
        }),
        ...(theme.direction !== 'rtl' && {
            paddingRight: undefined,
        }),
    },
    [`& .${classes.flexContainer}`]: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    [`& .${classes.tableRow}`]: {
        cursor: 'pointer',
    },
    [`& .${classes.tableRowHover}`]: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    [`& .${classes.tableCell}`]: {
        flex: 1,
    },
    [`& .${classes.noClick}`]: {
        cursor: 'initial',
    },
});

class MuiVirtualizedTable extends React.PureComponent {
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 60,
    };

    getRowClassName = ({ index }) => {
        const { onRowClick } = this.props;

        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    getObjectIndexIndex = (index) => {
        const { originalData } = this.props;
        for (let i = 0; i < originalData.length; i++) {
            if (originalData[i].index === index) {
                return i
            }
        }
        return 0
    }

    cellRenderer = ({ cellData, columnIndex }) => {
        const { rowHeight, onRowClick, selectRow, delRow, originalData, showOriginalUrl, columns, seeDetail, handleMod } = this.props;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                    [classes.noClick]: onRowClick == null,
                })}
                variant="body"
                style={{
                    height: rowHeight,
                    width: columns[columnIndex].width + " !important",
                    flex: "auto"
                }}
            >
                {
                    columnIndex === 0 ? (
                        <Checkbox
                            color="primary"
                            checked={originalData[this.getObjectIndexIndex(cellData)].checked}
                            onClick={() => selectRow(cellData)}
                            inputProps={{
                                'aria-labelledby': columnIndex,
                            }}
                        />
                    ) : ''
                }
                {
                    columnIndex === 1 ? (
                        cellData
                    ) : ''
                }
                {
                    columnIndex === 2 ? (
                        <Box>
                            {
                                handleMod !== 1 ? (
                                    <Tooltip title="删除">
                                        <IconButton onClick={() => delRow(cellData, columnIndex)}>
                                            <DeleteIcon sx={{ color: red[400] }} />
                                        </IconButton>
                                    </Tooltip>
                                ) : ''
                            }
                            {
                                handleMod !== 1 ? (
                                    <Tooltip title="查看详细数据">
                                        <IconButton onClick={() => seeDetail(originalData[this.getObjectIndexIndex(cellData)])}>
                                            <InfoIcon color="info" />
                                        </IconButton>
                                    </Tooltip>
                                ) : ''
                            }
                        </Box>
                    ) : ''
                }
                {
                    columnIndex === 3 ? (
                        <Box>
                            {
                                originalData[this.getObjectIndexIndex(cellData)].status === 0 ? (
                                    <Tooltip title="未检查">
                                        <Avatar sx={{ width: 24, height: 24 }}>
                                            <HorizontalRuleIcon />
                                        </Avatar>
                                    </Tooltip>
                                ) : ''
                            }
                            {
                                originalData[this.getObjectIndexIndex(cellData)].status === 1 ? (
                                    <div style={{
                                        color: originalData[this.getObjectIndexIndex(cellData)].delay < 500 ? 'green' : 'red',
                                        fontWeight: "bold",
                                    }}>{originalData[this.getObjectIndexIndex(cellData)].delay}ms</div>
                                    // <Tooltip title="有效">
                                    //     <Avatar sx={{ bgcolor: green[500], width: 24, height: 24 }}>
                                    //         <CheckCircleIcon />
                                    //     </Avatar>
                                    // </Tooltip>
                                ) : ''
                            }
                            {
                                originalData[this.getObjectIndexIndex(cellData)].status === 2 ? (
                                    <Tooltip title="无效">
                                        <Avatar sx={{ bgcolor: pink[500], width: 24, height: 24 }}>
                                            <ErrorIcon />
                                        </Avatar>
                                    </Tooltip>
                                ) : ''
                            }
                        </Box>
                    ) : ''
                }
                {
                    columnIndex === 4 ? (
                        <div>
                            <div style={{ fontWeight: '600' }}>{originalData[this.getObjectIndexIndex(cellData)].name}</div>
                            {
                                showOriginalUrl ? (
                                    <div style={{ fontSize: '12px', color: '#7a7a7a' }}><i>{originalData[this.getObjectIndexIndex(cellData)].url}</i></div>
                                ) : ''
                            }
                            <div style={{ fontSize: '12px', color: '#7a7a7a' }}>{originalData[this.getObjectIndexIndex(cellData)].video ? "" + originalData[this.getObjectIndexIndex(cellData)].video.width + "x" + originalData[this.getObjectIndexIndex(cellData)].video.height + "-" + originalData[this.getObjectIndexIndex(cellData)].video.codec + "" : ''}{'-'}{originalData[this.getObjectIndexIndex(cellData)].audio ? "" + originalData[this.getObjectIndexIndex(cellData)].audio.codec + "-" + originalData[this.getObjectIndexIndex(cellData)].audio.channels + " audio channels" : ''}</div>
                        </div>
                    ) : ''
                }
            </TableCell>
        );
    };

    headerRenderer = ({ label, columnIndex }) => {
        const { headerHeight, selectedArr, originalData, selectAll, columns, handleMod } = this.props;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
                variant="head"
                style={{
                    height: headerHeight,
                    width: columns[columnIndex].width + " !important",
                    flex: "auto"
                }}
            >
                {
                    columnIndex === 0 ? (
                        <Checkbox
                            color="primary"
                            checked={selectedArr.length > 0 && selectedArr.length === originalData.length}
                            onClick={selectAll}
                            indeterminate={selectedArr.length > 0 && selectedArr.length !== originalData.length}
                            inputProps={{
                                'aria-labelledby': -1,
                            }}
                        />
                    ) : ''
                }
                {
                    columnIndex !== 0 ? (
                        <span>{label}</span>
                    ) : ''
                }
            </TableCell>
        );
    };

    render() {
        const { columns, rowHeight, headerHeight, ...tableProps } = this.props;
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        height={height}
                        width={width}
                        rowHeight={rowHeight}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={headerHeight}
                        {...tableProps}
                        rowClassName={this.getRowClassName}
                    >
                        {columns.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={(headerProps) =>
                                        this.headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    {...other}
                                />
                            );
                        })}
                    </Table>
                )}
            </AutoSizer>
        );
    }
}

MuiVirtualizedTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
        }),
    ).isRequired,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowHeight: PropTypes.number,
};

export const VirtualizedTable = styled(MuiVirtualizedTable)(styles);