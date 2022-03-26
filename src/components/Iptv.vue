<template>
  <div class="iptv-container">
    <div class="header-container">
      <div class="input-and-search-container">
        <div style="width: 600px;margin-right: 20px;display: flex;align-items: center;">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入直播源m3u列表，请保证第一行为#EXTM3U开头前缀，或者为空，保证第二行为#EXTINF直播源信息"
            style="max-width: 600px;"
            @change="hanldeTrans"
            v-model="source"
          ></el-input>
        </div>
        <div style="display: flex;align-items: flex-start;flex-direction: column;" class="one-btn">
          <div style="display: flex;align-items: flex-start;">
            <el-input size="mini" v-model="filterName" placeholder="输入你想看的频道名称" clearable style="width:200px" class="one-btn"></el-input>
            <el-button size="mini" class="one-btn" @click="this.filterConfirm">添加频道名称</el-button>
            <el-button size="mini" type="success" @click="this.doFilterShow">搜索</el-button>
            <el-button size="mini" @click="this.doRecoverList" v-if="this.bkList.length > 0" class="one-btn">还原</el-button>
          </div>
          <div class="one-btn" style="margin-top:3px">
            <el-tag v-for="(value,index) in filterNames" size="mini" type="info" class="one-btn" :key="index" @close="deleteFilterNames(index)" closable>{{value}}</el-tag>
          </div>
        </div>
      </div>
      <div class="btn-list">
        <el-button
          size="mini"
          type="info"
          @click="getData"
          v-if="selectedList.length > 0"
          class="one-btn"
        >
          保存选中直播源信息
        </el-button>
        <el-button size="mini" @click="doSort"
          >整理源(排序/删除)</el-button
        >
        <el-button
          size="mini"
          @click="fetchData"
          v-if="this.list.length > 0 && !nowIsCheck && !nowIsSort"
        >
          检查直播源信息是否有效
        </el-button>
        <div v-if="nowIsCheck && !isCheckOver">
          正在检查，进度{{ nowCheckCount }}/{{ this.list.length }}
        </div>
        <el-button
          size="mini"
          type="warning"
          v-if="isCheckOver&&!nowIsSort"
          @click="autoSelect"
        >
          自动选择可用直播源节目
        </el-button>
        <el-button size="mini" v-if="isCheckOver&&!nowIsSort" @click="autoSelectNotGood">
          选择不可用直播源节目
        </el-button>
      </div>
      <el-input
        v-if="selectedData !== ''"
        type="textarea"
        size="mini"
        :rows="6"
        v-model="selectedData"
      ></el-input>
    </div>
    <div class="sort-container" v-show="nowIsSort">
      <ul id="items" class="sort-ul">
        <li class="item-li" v-for="(value, index) in list" :key="index">
          {{ index + 1 }}. {{ value.name }}
          <el-link @click="doDelete(index)">删除</el-link>
        </li>
      </ul>
    </div>
    <div class="show-container">
      <el-table
        v-if="list.length > 0 && !nowIsSort"
        ref="dataTable"
        @selection-change="handleSelectionChange"
        :data="list"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="status" width="70">
          <template slot-scope="scope">
            <div v-if="scope.row.status === 0">
              <el-tag type="info">未检查</el-tag>
            </div>
            <div v-else-if="scope.row.status === 1">
              <el-tag type="success">可用</el-tag>
            </div>
            <div v-else-if="scope.row.status === 2">
              <el-tag type="danger">不可用</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="name" width="220">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
            <i>"{{ scope.row.groupTitle }}"</i>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="url"> </el-table-column>
        <el-table-column label="other-info" width="320">
          <template slot-scope="scope">
            <div>tvg-id:{{ scope.row.tvgId }}</div>
            <div>tvg-country:{{ scope.row.tvgCountry }}</div>
            <div>
              <el-tag
                type="success"
                size="mini"
                v-for="(value, index) in scope.row.tvgLanguage"
                :key="index"
              >
                {{ value }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import Sortable from "sortablejs";
import { fetchGet } from "../utils/axios";

export default {
  data() {
    return {
      source: '',
      bkList:[],
      list: [],
      isCheckOver: false,
      firstTitle: "",
      selectedData: "",
      selectedList: [],
      nowCheckCount: 0,
      nowIsCheck: false,
      nowIsSort: false,
      filterName:'',
      filterNames:["CCTV","卫视"]
    };
  },
  watch: {
    nowCheckCount(newVal) {
      if (newVal === this.list.length) {
        this.isCheckOver = true;
      }
    },
  },
  mounted() {
    this.parseList();
  },
  methods: {
    doRecoverList(){
      this.list = this.bkList;
      this.bkList = [];
    },
    filterConfirm() {
      if(this.filterName !=='') {
        this.filterNames.push(this.filterName)
        this.filterName =''
      }
    },
    contains(str, substr) {
      return str.indexOf(substr)!= -1;
    },
    doFilterShow(){
      this.bkList = this.list;
      let rows = [];
      for(let i =0;i<this.list.length;i++) {
        let hit = false
        for(let j = 0;j<this.filterNames.length;j++) {
            if(this.contains(this.list[i].name, this.filterNames[j]) && !hit) {
              rows.push(this.list[i])
              hit = true
            }
        }
      }
      this.list = rows
    },
    deleteFilterNames(index) {
      this.filterNames.splice(index,1)
    },
    doDelete(index) {
      this.list.splice(index, 1);
    },
    doSort() {
      if (this.nowIsSort) {
        this.nowIsSort = false;
      } else {
        this.nowIsSort = true;
        this.enableSort();
      }
    },
    enableSort() {
      const el = document.getElementById("items");
      const _this = this;
      Sortable.create(el, {
        onEnd({ newIndex, oldIndex }) {
          const current = _this.list.splice(oldIndex, 1)[0];
          _this.list.splice(newIndex, 0, current);
          const rows = _this.list;
          _this.list = [];
          setTimeout(() => {
            _this.list = rows;
          }, 5);
        },
      });
    },
    handleSelectionChange(val) {
      this.selectedList = val;
      this.selectedData = "";
    },
    getData() {
      if (this.nowIsSort) {
        let name = `${this.firstTitle}\n`;
        for (let i = 0; i < this.list.length; i += 1) {
          name += `${this.list[i].originalData}\n`;
        }
        this.selectedData = name;
      } else {
        let name = `${this.firstTitle}\n`;
        for (let i = 0; i < this.selectedList.length; i += 1) {
          name += `${this.selectedList[i].originalData}\n`;
        }
        this.selectedData = name;
      }
    },
    autoSelect() {
      for (let i = 0; i < this.list.length; i += 1) {
        if (this.list[i].status === 1) {
          this.selectedList.push(this.list[i]);
          this.$refs.dataTable.toggleRowSelection(this.list[i]);
        }
      }
    },
    autoSelectNotGood() {
      for (let i = 0; i < this.list.length; i += 1) {
        if (this.list[i].status !== 1) {
          this.selectedList.push(this.list[i]);
          this.$refs.dataTable.toggleRowSelection(this.list[i]);
        }
      }
    },
    hanldeTrans() {
      this.isCheckOver = false;
      this.firstTitle = "";
      if (this.source === "") {
        return;
      }
      this.parseList();
    },
    fetchData() {
      this.nowCheckCount = 0;
      this.nowIsCheck = false;
      this.isCheckOver = false;
      for (let i = 0; i < this.list.length; i += 1) {
        this.nowIsCheck = true;
          setTimeout(() =>{
          fetchGet(this.list[i].url)
          .then((res) => {
            if (this.checkFirstLineIsRight(res)) {
              this.list[i].status = 1;
            } else {
              throw new Error("first line is not m3u");
            }
            this.nowCheckCount += 1;
          })
          .catch(() => {
            this.list[i].status = 2;
            this.nowCheckCount += 1;
          })
        }, 3000*i);
      }
    },
    parseList() {
      if (this.source !== "") {
        this.list = [];
        const spiStr = this.source.split("\n");
        this.firstTitle = "";
        if (spiStr.length > 0) {
          [this.firstTitle] = spiStr;
        }
        if (spiStr.length > 1) {
          const len = (spiStr.length - 1) / 2;
          for (let i = 0; i < len; i += 1) {
            const index = 1 + i * 2;
            this.parseRowToData(spiStr[index], spiStr[index + 1]);
          }
        }
      }
    },
    parseRowToData(one, two) {
      const row = {
        url: two,
        groupTitle: this.pregValue(one, "group-title"),
        tvgLogo: this.pregValue(one, "tvg-logo"),
        tvgLanguage: this.parseLanguages(this.pregValue(one, "tvg-language")),
        tvgCountry: this.pregValue(one, "tvg-country"),
        tvgId: this.pregValue(one, "tvg-id"),
        status: 0,
        name: this.parseName(one),
        originalData: `${one}\n${two}`,
      };
      this.list.push(row);
    },
    pregValue(str, name) {
      let regex;
      if (name === "group-title") {
        regex = /group-title="(.*)"/gm;
      } else if (name === "tvg-logo") {
        regex = /tvg-logo="(.*)"/gm;
      } else if (name === "tvg-language") {
        regex = /tvg-language="(.*)"/gm;
      } else if (name === "tvg-country") {
        regex = /tvg-country="(.*)"/gm;
      } else if (name === "tvg-id") {
        regex = /tvg-id="(.*)"/gm;
      }
      let m;
      let value = "";
      while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex += 1;
        }
        m.forEach((match, groupIndex) => {
          if (groupIndex === 1) {
            value = match;
          }
        });
      }
      console.log(value);
      if (value !== "") {
        return value.split('" ')[0];
      }
      return "";
    },
    checkFirstLineIsRight(content) {
      const contextExp = content.split("\n");
      if (contextExp.length > 0) {
        const firstLine = contextExp[0];
        if (firstLine.replace("#EXTM3U", "") === firstLine) {
          return false;
        }
        return true;
      }
      return false;
    },
    parseName(name) {
      const row = name.split(",");
      return row[row.length - 1];
    },
    parseLanguages(name) {
      if (name !== "") {
        return name.split(";");
      }
      return [];
    },
  },
};
</script>
<style lang="sass" scoped>
.iptv-container
  .one-btn
    margin-right: 10px
  .header-container
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    z-index: 999;
    border-bottom: 1px solid #EBEEF5
    background-color: #fff
    display: flex;
    flex-direction: column;
    .input-and-search-container
      margin: 10px 0px;
      display: flex;
      justify-content: flex-start;
    .btn-list
      margin: 10px 0
      display: flex
  .sort-container
    padding-top: 160px
    .sort-ul
      display: flex
      flex-direction: column
      .item-li
        justify-content: space-between
        width: 400px
        padding: 10px
        display: flex
        border-bottom: 1px solid #000
  .show-container
    padding-top: 160px
</style>
