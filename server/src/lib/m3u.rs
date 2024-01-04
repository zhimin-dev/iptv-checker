use clap::Parser;

#[derive(Debug)]
pub struct M3uExtend {
    pub(crate) group_title: String, //group title
    pub(crate) tv_logo: String,     //台标
    pub(crate) tv_language: String, //语言
    pub(crate) tv_country: String,  //国家
    pub(crate) tv_id: String,       //电视id
    pub(crate) user_agent: String,  // user-agent
}

#[derive(Debug)]
pub struct M3uObject {
    pub(crate) index: i32,                        //索引
    pub(crate) url: String,                       //连接url
    pub(crate) name: String,                      //显示名称
    pub(crate) extend: Option<M3uExtend>,         //扩展信息
    pub(crate) search_name: String,               //搜索名称
    pub(crate) raw: String,                       //原始的m3u文件信息
    pub(crate) other_status: Option<OtherStatus>, //其它状态
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
    use crate::lib::{M3uExtend, M3uObject, SourceType};
    use core::option::Option;
    use std::fmt::{format, Error};
    use std::fs::File;
    use std::io::{ErrorKind, Read};

    fn check_source_type(_body: String) -> Option<SourceType> {
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

    fn body_normal(_body: String) -> Result<Vec<M3uObject>, Error> {
        println!("normal");
        return Ok(parse_normal_str(_body));
    }

    fn body_quota(_body: String) -> Result<Vec<M3uObject>, Error> {
        return Ok(parse_quota_str(_body));
    }

    pub fn from_body(_str: &String) -> Result<Vec<M3uObject>, Error> {
        let source_type = check_source_type(_str.to_owned());
        return match source_type {
            Some(SourceTypeNormal) => body_normal(_str.clone()),
            Some(SourceTypeQuota) => body_quota(_str.clone()),
            None => Ok(Vec::new()),
        };
    }

    pub async fn from_url(_url: String, timeout: u64) -> Result<Vec<M3uObject>, Error> {
        let url_body = get_url_body(_url, timeout).await.unwrap();
        return from_body(&url_body);
    }

    pub fn from_file(_file: String) -> Result<Vec<M3uObject>, Error> {
        let mut data = File::open(_file).unwrap();
        let mut contents = String::from("");
        data.read_to_string(&mut contents).unwrap();
        return from_body(&contents);
    }
}
