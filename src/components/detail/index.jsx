import { useState, useContext, useEffect } from 'react'
import * as React from 'react';
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import Setting from './setting';
import { VirtualizedTable } from './vtable'
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function Detail() {
  const _mainContext = useContext(MainContext);
  const [vTableHeight, setVTableHeight] = useState(550)

  const [showChannelMod, setShowChannelMod] = useState(0)

  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState('')
  const [editGroupName, setEditGroupName] = useState('')
  const [showWatch, setShowWatch] = useState(true)

  const onChangeEditName = (e) => {
    setEditName(e.target.value)
  }

  const onChangeEditUrl = (e) => {
    setEditUrl(e.target.value)
  }
  const onChangeEditLogoUrl = (e) => {
    setEditLogoUrl(e.target.value)
  }
  const onChangeEditGroupName = (e) => {
    setEditGroupName(e.target.value)
  }

  const saveEditData = () => {
    _mainContext.updateDataByIndex([_mainContext.showChannelObj.index], {
      name:editName,
      tvgLogo: editLogoUrl,
      url: editUrl,
      groupTitle:editGroupName,
    })
    _mainContext.changeChannelObj(null)
  }

  useEffect(() => {
    setShowWatch(false)
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

  const seeDetail = (val) => {
    setShowChannelMod(0)
    _mainContext.changeChannelObj(val)
  }

  const closeShowChangeObj = () => {
    _mainContext.changeChannelObj(null)
  }

  const changeShowObj = () => {
    setShowChannelMod(1)
    setEditLogoUrl(_mainContext.showChannelObj.tvgLogo)
    setEditGroupName(_mainContext.showChannelObj.groupTitle)
    setEditUrl(_mainContext.showChannelObj.url)
    setEditName(_mainContext.showChannelObj.name)
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
          seeDetail={seeDetail}
          showOriginalUrl={_mainContext.showUrl}
          selectedArr={selectedArr}
          selectAll={handleSelectCheckedAll}
          showWatch={showWatch}
          handleMod={_mainContext.handleMod}
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
              width: 220,
              label: '操作',
              dataKey: 'index',
            },
            {
              width: 100,
              label: 'status',
              dataKey: 'index',
            },
            {
              width: 600,
              label: 'name',
              dataKey: 'index',
            },
          ]}
        />
      </Paper>
      <Box sx={{
        position: 'fixed',
        'bottom': 0,
        'width': 400,
        'right': 0,
        'backgroundColor': '#fff',
        border: '1px solid #eee',
        borderRadius: '2px',
        padding: '5px'
      }}>
        {
          _mainContext.showChannelObj !== null ? (
            <Box>
              {showChannelMod === 0 ? (
                <Box>
                  <Box sx={{
                    display: "flex",
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{
                      display: "flex"
                    }}>
                      {
                        _mainContext.showChannelObj.tvgLogo !== '' ? (
                          <img src={_mainContext.showChannelObj.tvgLogo} height="20"></img>
                        ) : ''
                      }
                      <Box><b>{_mainContext.showChannelObj.name}</b></Box>
                    </Box>
                    <Box sx={{ display: "flex" }}>
                      <Box onClick={changeShowObj}
                        sx={{
                          cursor: 'pointer',
                          padding: '2px',
                          border: "1px solid green",
                          borderRadius: '2px',
                          marginRight: '3px'
                        }}>编辑</Box>
                      <Box onClick={closeShowChangeObj} title="点击关闭"
                        sx={{
                          cursor: 'pointer',
                          padding: '2px',
                          border: "1px solid green",
                          borderRadius: '2px',
                          justifyContent: 'space-between'
                        }}>关闭</Box>
                    </Box>
                  </Box>
                  <Box>m3u8地址：{_mainContext.showChannelObj.url}</Box>
                  {
                    _mainContext.showChannelObj.groupTitle !== '' ? (
                      <Box>分组名称：{_mainContext.showChannelObj.groupTitle}</Box>
                    ) : ''
                  }
                  {
                    _mainContext.showChannelObj.tvgLogo !== '' ? (
                      <Box>tvgLogo：{_mainContext.showChannelObj.tvgLogo}</Box>
                    ) : ''
                  }
                  {
                    _mainContext.showChannelObj.tvgLanguage.length > 0 ? (
                      <Box>语言: {_mainContext.showChannelObj.tvgLanguage.toString()}</Box>
                    ) : ''
                  }
                  {
                    _mainContext.showChannelObj.tvgCountry !== '' ? (
                      <Box>国家: {_mainContext.showChannelObj.tvgCountry}</Box>
                    ) : ''
                  }
                  {
                    _mainContext.showChannelObj.tvgId !== '' ? (
                      <Box>tvgId: {_mainContext.showChannelObj.tvgId}</Box>
                    ) : ''
                  }
                </Box>
              ) : ""}
              {showChannelMod === 1 ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <FormControl sx={{ marginBottom: '5px' }} fullWidth>
                    <TextField sx={{ fontSize: '11px' }} label='频道名称' size="small" id="standard-multiline-static" value={editName} onChange={onChangeEditName} />
                  </FormControl>
                  <FormControl sx={{ marginBottom: '5px' }} fullWidth>
                    <TextField sx={{ fontSize: '11px' }} label='m3u8地址' size="small" id="standard-multiline-static" value={editUrl} onChange={onChangeEditUrl} />
                  </FormControl>
                  <FormControl sx={{ marginBottom: '5px' }} fullWidth>
                    <TextField sx={{ fontSize: '11px' }} label='logoUrl' size="small" id="standard-multiline-static" value={editLogoUrl} onChange={onChangeEditLogoUrl} />
                  </FormControl>
                  <FormControl sx={{ marginBottom: '5px' }} fullWidth>
                    <TextField sx={{ fontSize: '11px' }} label='分组名称' size="small" id="standard-multiline-static" value={editGroupName} onChange={onChangeEditGroupName} />
                  </FormControl>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={saveEditData}
                      variant="contained"
                      sx={{ marginRight: '5px' }}
                    >
                      保存
                    </Button>
                    <Button
                      size="small"
                      onClick={closeShowChangeObj}
                      variant="contained"
                    >
                      取消
                    </Button>
                  </Box>
                </Box>
              ) : ''}
            </Box>
          ) : ''
        }
      </Box>
    </Box>
  )
}