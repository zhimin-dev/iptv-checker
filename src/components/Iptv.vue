<template>
  <div class="iptv-container">
    <div v-show="step === 1">
      <div class="header-container">
        <div class="input-and-search-container">
          <div
            style="
              width: 600px;
              margin-right: 20px;
              display: flex;
              align-items: center;
            "
          >
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入直播源m3u列表"
              style="max-width: 600px"
              @change="hanldeTrans"
              v-model="source"
            ></el-input>
          </div>
          <div
            style="
              display: flex;
              align-items: flex-start;
              flex-direction: column;
            "
            class="one-btn"
          >
            <div style="display: flex; align-items: flex-start">
              <el-input
                size="mini"
                v-model="filterName"
                placeholder="输入你想看的频道名称"
                clearable
                style="width: 200px"
                class="one-btn"
              ></el-input>
              <el-button size="mini" class="one-btn" @click="this.filterConfirm"
                >添加频道名称</el-button
              >
              <el-button size="mini" type="success" @click="this.doFilterShow"
                >搜索</el-button
              >
            </div>
            <div class="one-btn" style="margin-top: 3px">
              <el-tag
                v-for="(value, index) in filterNames"
                size="mini"
                type="info"
                class="one-btn"
                :key="index"
                @close="deleteFilterNames(index)"
                closable
                >{{ value }}</el-tag
              >
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
          <el-button size="mini" @click="doSort">整理源(排序/删除)</el-button>
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
            v-if="isCheckOver && !nowIsSort"
            @click="autoSelect"
          >
            自动选择可用直播源节目
          </el-button>
          <el-button
            size="mini"
            v-if="isCheckOver && !nowIsSort"
            @click="autoSelectNotGood"
          >
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
        <draggable v-model="list" group="people" @start="drag=true" @end="drag=false" class="sort-ul">
          <li class="item-li" v-for="(value, index) in list" :key="value.name+value.url">
            {{ index + 1 }}. {{ value.name }}
            <el-link @click="doDelete(index)">删除</el-link>
          </li>
        </draggable>
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
          <el-table-column type="index" width="50"> </el-table-column>
          <el-table-column label="status" width="100">
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
          <el-table-column label="name" width="620">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
              <i v-if="scope.row.groupTitle !== 'Undefined'"
                >"{{ scope.row.groupTitle }}"</i
              >
              <div>{{ scope.row.url }}</div>
            </template>
          </el-table-column>
          <el-table-column label="other-info" width="320">
            <template slot-scope="scope">
              <div v-if="scope.row.tvgId !== ''">
                tvg-id:{{ scope.row.tvgId }}
              </div>
              <div v-if="scope.row.tvgCountry !== ''">
                tvg-country:{{ scope.row.tvgCountry }}
              </div>
              <div v-if="scope.row.tvgLanguage.length > 0">
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
    <div>
      <el-dialog :visible="step === 0" v-loading="dialogLoading" width="80%">
        <div class="dialog-container">
          <div class="has-m3u-link">
            我有m3u订阅源链接（优先识别）：
            <el-input v-model="m3uLink" placeholder="输入m3u订阅源,例如：http://xxxxx.com/xxx.m3u"></el-input>
          </div>
          <div class="has-m3u-content">
            我有m3u源内容：
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入直播源m3u列表,例如：#EXTINF:xxxxxxx"
              v-model="source"
            ></el-input>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogHandleContent"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { fetchGet } from "../utils/axios";
import draggable from 'vuedraggable'

export default {
  components: {
      draggable,
  },
  data() {
    return {
      step: 0,
      m3uLink: "",
      dialogLoading: false,
      source: '',
      bkList: [],
      list: [],
      originalList: [],
      checkTimeout: "3000",
      isCheckOver: false,
      selectedData: "",
      selectedList: [],
      nowCheckCount: 0,
      nowIsCheck: false,
      nowIsSort: false,
      filterName: "",
      filterNames: ["CCTV", "卫视"],
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
    dialogHandleContent() {
      if (this.m3uLink === "" && this.source === "") {
        this.$message.error("请填写至少一个输入框哦！");
        return;
      }
      if (this.m3uLink !== "") {
        this.dialogLoading = true;
        this.m3uLinkToBody(this.m3uLink);
      } else {
        this.hanldeTrans();
        this.step = 1;
      }
    },
    m3uLinkToBody(_link) {
      fetchGet(_link)
        .then((res) => {
          this.dialogLoading = false;
          this.source = res;
          this.step = 1;
          this.hanldeTrans();
        })
        .catch((err) => {
          this.dialogLoading = false;
          console.log(err);
          this.$message.error(err);
        });
    },
    doRecoverList() {
      this.list = this.bkList;
    },
    filterConfirm() {
      if (this.filterName !== "") {
        this.filterNames.push(this.filterName);
        this.filterName = "";
      }
    },
    contains(str, substr) {
      return str.indexOf(substr) != -1;
    },
    doFilterShow() {
      if (this.filterNames.length === 0) {
        this.list = this.bkList;
        return;
      }
      let rows = [];
      for (let i = 0; i < this.list.length; i++) {
        let hit = false;
        for (let j = 0; j < this.filterNames.length; j++) {
          if (this.contains(this.list[i].name, this.filterNames[j]) && !hit) {
            rows.push(this.list[i]);
            hit = true;
          }
        }
      }
      this.list = rows;
    },
    deleteFilterNames(index) {
      this.filterNames.splice(index, 1);
    },
    doDelete(index) {
      this.list.splice(index, 1);
    },
    doSort() {
      if (this.nowIsSort) {
        this.nowIsSort = false;
      } else {
        this.nowIsSort = true;
      }
      this.selectedList = [];
    },
    handleSelectionChange(val) {
      this.selectedList = val;
      this.selectedData = "";
    },
    getData() {
      let name = `#EXTM3U x-tvg-url="https://iptv-org.github.io/epg/guides/ao/guide.dstv.com.epg.xml,https://iptv-org.github.io/epg/guides/ar/directv.com.ar.epg.xml,https://iptv-org.github.io/epg/guides/ar/mi.tv.epg.xml,https://iptv-org.github.io/epg/guides/bf/canalplus-afrique.com.epg.xml,https://iptv-org.github.io/epg/guides/bi/startimestv.com.epg.xml,https://iptv-org.github.io/epg/guides/bo/comteco.com.bo.epg.xml,https://iptv-org.github.io/epg/guides/br/mi.tv.epg.xml,https://iptv-org.github.io/epg/guides/cn/tv.cctv.com.epg.xml,https://iptv-org.github.io/epg/guides/cz/m.tv.sms.cz.epg.xml,https://iptv-org.github.io/epg/guides/dk/allente.se.epg.xml,https://iptv-org.github.io/epg/guides/fr/chaines-tv.orange.fr.epg.xml,https://iptv-org.github.io/epg/guides/ga/startimestv.com.epg.xml,https://iptv-org.github.io/epg/guides/gr/cosmote.gr.epg.xml,https://iptv-org.github.io/epg/guides/hk-en/nowplayer.now.com.epg.xml,https://iptv-org.github.io/epg/guides/id-en/mncvision.id.epg.xml,https://iptv-org.github.io/epg/guides/it/guidatv.sky.it.epg.xml,https://iptv-org.github.io/epg/guides/my/astro.com.my.epg.xml,https://iptv-org.github.io/epg/guides/ng/dstv.com.epg.xml,https://iptv-org.github.io/epg/guides/nl/delta.nl.epg.xml,https://iptv-org.github.io/epg/guides/tr/digiturk.com.tr.epg.xml,https://iptv-org.github.io/epg/guides/uk/bt.com.epg.xml,https://iptv-org.github.io/epg/guides/us-pluto/i.mjh.nz.epg.xml,https://iptv-org.github.io/epg/guides/us/tvtv.us.epg.xml,https://iptv-org.github.io/epg/guides/za/guide.dstv.com.epg.xml"\n`;
      if (this.nowIsSort) {
        for (let i = 0; i < this.list.length; i += 1) {
          name += `${this.list[i].originalData}\n`;
        }
        this.selectedData = name;
      } else {
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
      if (this.source === "") {
        return;
      }
      this.parseList();
    },
    fetchUrl() {
      let _this = this;
      for (let i = 0; i < _this.list.length; i++) {
        setTimeout(function () {
          fetchGet(_this.list[i].url)
            .then((res) => {
              if (_this.checkFirstLineIsRight(res)) {
                _this.list[i].status = 1;
              } else {
                throw new Error("first line is not m3u");
              }
              _this.nowCheckCount += 1;
            })
            .catch(() => {
              _this.list[i].status = 2;
              _this.nowCheckCount += 1;
            });
        }, _this.checkTimeout * i);
      }
    },
    fetchData() {
      this.nowCheckCount = 0;
      this.nowIsCheck = false;
      this.isCheckOver = false;
      this.fetchUrl();
    },
    parseList() {
      if (this.source !== "") {
        //#EXTINF:(.*)\n(#EXTVLCOPT:.*\n)*(http[s]*)(.*)
        const regex = /#EXTINF:(.*)\n(#EXTVLCOPT:.*\n)*(http[s]*)(.*)/gm;
        let rows = [];
        let m;
        while ((m = regex.exec(this.source)) !== null) {
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          let one = [];
          m.forEach((match, groupIndex) => {
            one.push(match);
          });
          rows.push(one);
        }
        for (let i = 0; i < rows.length; i += 1) {
          this.parseRowToData(
            "#EXTINF:" + rows[i][1],
            rows[i][3] + "" + rows[i][4]
          );
        }
        this.bkList = this.list;
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
.dialog-container
  display: flex
  flex-direction: column
  text-align: left
  .has-m3u-link
    margin-bottom: 20px
.iptv-container
  .one-btn
    margin-right: 10px
  .header-container
    position: fixed
    top: 0
    left: 0
    width: 100%
    padding: 10px
    z-index: 999
    border-bottom: 1px solid #EBEEF5
    background-color: #fff
    display: flex
    flex-direction: column
    .input-and-search-container
      margin: 10px 0px
      display: flex
      justify-content: flex-start
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
