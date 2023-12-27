pub struct M3uExtend {
    group_title: String, //group title
    tv_logo: String,     //台标
    language: String,    //语言
    tv_id: String,       //电视id
}

pub struct M3uObject {
    index: i32,                //索引
    url: String,               //连接url
    name: String,              //显示名称
    extend: M3uExtend,         //扩展信息
    search_name: String,       //搜索名称
    raw: String,               //原始的m3u文件信息
    other_status: OtherStatus, //其它状态
}

pub enum CheckDataStatus {
    Unchecked, //未检查
    Success,   //检查成功
    Failed,    //检查失败，包含超时、无效
}

pub struct OtherStatus {
    status: CheckDataStatus, //当前状态
    video: VideoInfo,        //视频信息
    audio: AudioInfo,        //音频信息
    network: NetworkInfo,    //网路状态信息
}

pub struct NetworkInfo {
    delay: i32,
}

pub enum VideoType {
    Sd,
    Hd,
    Fhd,
    Uhd,
    Fuhd,
}

fn video_type_string(vt: VideoType) -> *const str {
    return match vt {
        VideoType::Sd => {
            "普清"
        },
        VideoType::Hd => {
            "高清720P"
        },
        VideoType::Fhd => {
            "全高清1080P"
        }
        VideoType::Uhd => {
            "超高清4K"
        },
        VideoType::Fuhd => {
            "全超高清8K"
        },
    }
}

struct VideoInfo {
    width: i32,
    height: i32,
    codec: String,
    video_type: VideoType,
}

struct AudioInfo {
    codec: String,
    channels: i32,
}
pub mod m3u {
    use std::fmt::Error;
    use crate::lib::M3uObject;

    pub fn from_quote_string(_str: String) -> Result<Vec<M3uObject>, Error> {
        let mut arr = Vec::new();

        Ok(arr)
    }

    pub fn from_normal_m3u(_str: String) -> Result<Vec<M3uObject>, Error> {
        let mut arr = Vec::new();

        Ok(arr)
    }
}
