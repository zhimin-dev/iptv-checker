import React, { useContext, useState, useMemo, createContext } from 'react'
import { MainContext } from './../../context/main';
import { useEffect } from 'react';
import { SortableList } from "./sortable";

export default function sort(props) {
  const _mainContext = useContext(MainContext);

  console.log("sort data ", _mainContext.exportData)

  return (
    <SortableList
      items={_mainContext.exportData}
      onChange={_mainContext.onChangeExportData}
      renderItem={(item) => (
        <SortableList.Item id={item.index}>
          {item.name}
          <SortableList.DragHandle />
        </SortableList.Item>
      )}
    />
  );
}