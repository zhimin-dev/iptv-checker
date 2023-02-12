import React from 'react';
import { useContext } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { MainContext } from './../../context/main';

const SortableItem = SortableElement(({ value, sortIndex }) => (
    <li style={{ pointer: 'cursor' }}>
        {value.name} - {value.groupTitle}
    </li>
));

const SortableList = SortableContainer(({ items }) => {
    return (
        <ul style={{
            listStyle: 'none',
            marginTop: '10px',
            marginLeft: 0,
            paddingLeft: '10px'
        }}>
            {items.map((value, index) => (
                <SortableItem
                    key={`item-${index}`}
                    index={index}
                    sortIndex={index}
                    value={value}
                />
            ))}
        </ul>
    );
});

export default function sort(props) {
    const _mainContext = useContext(MainContext);

    const onSortEnd = ({ oldIndex, newIndex }) => {
        _mainContext.onChangeExportData(arrayMoveImmutable(_mainContext.exportData, oldIndex, newIndex))
    }

    return (
        <SortableList items={_mainContext.exportData} onSortEnd={onSortEnd} />
    )
}