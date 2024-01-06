use crate::lib::SourceType::{SourceTypeNormal, SourceTypeQuota};
use clap::Parser;

#[derive(Debug)]
pub struct M3uExtend {
    group_title: String, //group title
    tv_logo: String,     //台标
    tv_language: String, //语言
    tv_country: String,  //国家
    tv_id: String,       //电视id
    user_agent: String,  // user-agent
}

impl M3uExtend {
    pub fn new() -> M3uExtend {
        M3uExtend {
            group_title: "".to_string(),
            tv_logo: "".to_string(),
            tv_language: "".to_string(),
            tv_country: "".to_string(),
            tv_id: "".to_string(),
            user_agent: "".to_string(),
        }
    }

    pub fn set_group_title(&mut self, group_title: String) {
        self.group_title = group_title
    }

    pub fn set_tv_logo(&mut self, tv_logo: String) {
        self.tv_logo = tv_logo
    }

    pub fn set_tv_language(&mut self, tv_language: String) {
        self.tv_language = tv_language
    }

    pub fn set_tv_country(&mut self, tv_country: String) {
        self.tv_country = tv_country
    }

    pub fn set_tv_id(&mut self, tv_id: String) {
        self.tv_id = tv_id
    }

    pub fn set_user_agent(&mut self, user_agent: String) {
        self.user_agent = user_agent
    }
}

#[derive(Debug)]
pub struct M3uObject {
    index: i32,                        //索引
    url: String,                       //连接url
    name: String,                      //显示名称
    extend: Option<M3uExtend>,         //扩展信息
    search_name: String,               //搜索名称
    raw: String,                       //原始的m3u文件信息
    other_status: Option<OtherStatus>, //其它状态
}

impl M3uObject {
    pub fn new() -> M3uObject {
        return M3uObject {
            index: 0,
            url: "".to_string(),
            name: "".to_string(),
            extend: None,
            search_name: "".to_string(),
            raw: "".to_string(),
            other_status: None,
        };
    }

    pub fn set_index(&mut self, index: i32) {
        self.index = index;
    }

    pub fn set_url(&mut self, url: String) {
        self.url = url
    }

    pub fn set_name(&mut self, name: String) {
        self.name = name
    }

    pub fn set_search_name(&mut self, search_name: String) {
        self.search_name = search_name.to_lowercase()
    }

    pub fn set_raw(&mut self, raw: String) {
        self.raw = raw
    }

    pub fn set_extend(&mut self, extend: M3uExtend) {
        self.extend = Some(extend)
    }

    pub fn set_other_status(&mut self, other_status: OtherStatus) {
        self.other_status = Some(other_status)
    }
}

pub struct M3uObjectList {
    header: Option<M3uExt>,
    list: Vec<M3uObject>,
}

impl M3uObjectList {
    pub fn new() -> M3uObjectList {
        M3uObjectList {
            header: None,
            list: vec![],
        }
    }

    pub fn set_header(&mut self, header: M3uExt) {
        self.header = Some(header)
    }

    pub fn set_list(&mut self, list: Vec<M3uObject>) {
        self.list = list
    }

    pub fn data_len(self) {
        println!("list length: {}", self.list.len());
        println!(
            "header x-tv-list length: {}",
            self.header.unwrap().x_tv_url.len()
        );
    }

    pub fn check_data(&mut self) {
        for x in self.list {
            
        }
    }
}

pub struct M3uExt {
    pub(crate) x_tv_url: Vec<String>,
}

impl From<String> for M3uObjectList {
    fn from(_str: String) -> Self {
        let empty_data = M3uObjectList {
            header: None,
            list: vec![],
        };
        let source_type = m3u::check_source_type(_str.to_owned());
        return match source_type {
            Some(SourceTypeNormal) => m3u::body_normal(_str.clone()),
            Some(SourceTypeQuota) => m3u::body_quota(_str.clone()),
            None => empty_data,
        };
    }
}

#[derive(Debug)]
pub enum CheckDataStatus {
    Unchecked, //未检查
    Success,   //检查成功
    Failed,    //检查失败，包含超时、无效
}

#[derive(Debug)]
pub struct OtherStatus {
    pub(crate) status: Option<CheckDataStatus>, //当前状态
    pub(crate) video: Option<VideoInfo>,        //视频信息
    pub(crate) audio: Option<AudioInfo>,        //音频信息
    pub(crate) network: Option<NetworkInfo>,    //网路状态信息
}

#[derive(Debug)]
pub struct NetworkInfo {
    delay: i32,
}

#[derive(Debug)]
pub enum VideoType {
    Sd,
    Hd,
    Fhd,
    Uhd,
    Fuhd,
}

fn video_type_string(vt: VideoType) -> *const str {
    return match vt {
        VideoType::Sd => "普清",
        VideoType::Hd => "高清720P",
        VideoType::Fhd => "全高清1080P",
        VideoType::Uhd => "超高清4K",
        VideoType::Fuhd => "全超高清8K",
    };
}

#[derive(Debug)]
pub struct VideoInfo {
    width: i32,
    height: i32,
    codec: String,
    video_type: VideoType,
}

#[derive(Debug)]
pub struct AudioInfo {
    codec: String,
    channels: i32,
}

pub enum SourceType {
    SourceTypeNormal, //m3u标准文件
    SourceTypeQuota,  //名称,url格式
}
pub mod m3u {
    use crate::lib::util::{get_url_body, is_url, parse_normal_str, parse_quota_str};
    use crate::lib::SourceType::{SourceTypeNormal, SourceTypeQuota};
    use crate::lib::{M3uExtend, M3uObject, M3uObjectList, SourceType};
    use core::option::Option;
    use std::fmt::{format, Error};
    use std::fs::File;
    use std::io::{ErrorKind, Read};

    pub fn check_source_type(_body: String) -> Option<SourceType> {
        if _body.starts_with("#EXTM3U") {
            return Some(SourceTypeNormal);
        }
        let exp = _body.split("\n");
        let mut quota = false;
        for x in exp {
            if !quota {
                let exp: Vec<&str> = x.split(",").collect();
                if exp.len() >= 2 {
                    quota = true
                }
            }
        }
        if quota {
            return Some(SourceTypeQuota);
        }
        return None;
    }

    pub(crate) fn body_normal(_body: String) -> M3uObjectList {
        println!("normal");
        parse_normal_str(_body)
    }

    pub(crate) fn body_quota(_body: String) -> M3uObjectList {
        println!("quota");
        parse_quota_str(_body)
    }

    pub fn from_body(_str: &String) -> M3uObjectList {
        let source_type = check_source_type(_str.to_owned());
        return match source_type {
            Some(SourceTypeNormal) => body_normal(_str.clone()),
            Some(SourceTypeQuota) => body_quota(_str.clone()),
            None => M3uObjectList {
                header: None,
                list: vec![],
            },
        };
    }

    pub async fn from_url(_url: String, timeout: u64) -> M3uObjectList {
        let url_body = get_url_body(_url, timeout).await.unwrap();
        return from_body(&url_body);
    }

    pub fn from_file(_file: String) -> M3uObjectList {
        let mut data = File::open(_file).unwrap();
        let mut contents = String::from("");
        data.read_to_string(&mut contents).unwrap();
        return from_body(&contents);
    }
}
