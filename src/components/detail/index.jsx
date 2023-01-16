import { useState, useContext, useEffect } from 'react'
import * as React from 'react';
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import Setting from './setting';
import { VirtualizedTable } from './vtable'

export default function Detail() {
  const _mainContext = useContext(MainContext);
  const [vTableHeight, setVTableHeight] = useState(550)

  useEffect(() => {
    setVTableHeight(window.innerHeight - _mainContext.headerHeight - 50)
    window.addEventListener("resize", e => {
      setVTableHeight(e.currentTarget.innerHeight - _mainContext.headerHeight - 50)
    })
  })

  const navigate = useNavigate();
  const [selectedArr, setSelectedArr] = useState([])

  const deleteThisRow = (index, tableIndex) => {
    let row = []
    for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] !== index) {
        row.push(selectedArr[i]);
      }
    }
    setSelectedArr(row)
    _mainContext.deleteShowM3uRow(index)
  }

  const handleSelectCheckedAll = () => {
    let mod = 1//选中
    if (selectedArr.length > 0) {
      mod = 0//取消选择
    }
    let temp = []
    if (mod === 1) {
      for (let i = 0; i < _mainContext.showM3uBody.length; i++) {
        temp.push(_mainContext.showM3uBody[i].index)
      }
    }
    _mainContext.onSelectedOrNotAll(mod)
    setSelectedArr(temp)
  }

  const onSelectedThisRow = (index) => {
    _mainContext.onSelectedRow(index)
    let mod = 1//选中
    for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] === index) {
        mod = 0//取消选择
      }
    }
    if (mod === 1) {
      setSelectedArr(pre => [...pre, index])
    } else {
      setSelectedArr(prev => prev.filter((val) => val !== index))
    }
  }

  const watchThisRow = (val) => {
    let query = {}
    if (val !== null) {
      query.original = encodeURIComponent(val.raw)
    }
    navigate("/watch", {
      state: query,
    })
  }

  return (
    <Box>
      <Setting setSelectedArr={setSelectedArr} selectedArr={selectedArr}></Setting>
      <Paper style={{
        height: vTableHeight,
        marginTop: (_mainContext.headerHeight + 10) + "px",
        minWidth: '800px'
      }}>
        <VirtualizedTable
          rowCount={_mainContext.showM3uBody.length}
          rowGetter={({ index }) => _mainContext.showM3uBody[index]}
          originalData={_mainContext.showM3uBody}
          delRow={deleteThisRow}
          selectAllRow={handleSelectCheckedAll}
          selectRow={onSelectedThisRow}
          watchThis={watchThisRow}
          showOriginalUrl={_mainContext.showUrl}
          selectedArr={selectedArr}
          selectAll={handleSelectCheckedAll}
          columns={[
            {
              width: 80,
              label: 'checkBox',
              dataKey: 'index',
            },
            {
              width: 80,
              label: 'index',
              dataKey: 'index',
            },
            {
              width: 120,
              label: '操作',
              dataKey: 'index',
            },
            {
              width: 80,
              label: 'status',
              dataKey: 'index',
            },
            {
              width: 800,
              label: 'name',
              dataKey: 'index',
            },
          ]}
        />
      </Paper>
    </Box>
  )
}