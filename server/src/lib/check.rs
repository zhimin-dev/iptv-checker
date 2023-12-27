use serde::{Deserialize, Serialize};
use std::fmt::Error;
use std::process::Command;
use std::time;

#[derive(Serialize, Deserialize)]
pub struct CheckUrlIsAvailableResponse {
    delay: i32,
    video: CheckUrlIsAvailableRespVideo,
    audio: CheckUrlIsAvailableRespAudio,
}

#[derive(Serialize, Deserialize)]
pub struct CheckUrlIsAvailableRespAudio {
    codec: String,
    channels: i32,
    #[serde(rename = "bitRate")]
    bit_rate: i32,
}

#[derive(Serialize, Deserialize)]
pub struct CheckUrlIsAvailableRespVideo {
    width: i32,
    height: i32,
    codec: String,
    #[serde(rename = "bitRate")]
    bit_rate: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Ffprobe {
    streams: Vec<FfprobeStream>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FfprobeStream {
    codec_type: String,
    width: Option<i32>,
    height: Option<i32>,
    codec_name: String,
    // bit_rate: i32,
    channels: Option<i32>,
}

pub mod check {
    use crate::lib::{CheckUrlIsAvailableRespAudio, CheckUrlIsAvailableResponse, CheckUrlIsAvailableRespVideo, Ffprobe};
    use chrono::Utc;
    use std::io::Error;
    use std::process::Command;
    use log::error;
    use log::Level::Error;

    async fn check_link_is_valid(
        _url: String,
        timeout: u32,
    ) -> Result<CheckUrlIsAvailableResponse, Error> {
        let client = reqwest::Client::builder()
            .timeout(time::Duration::from_millis(timeout as u64))
            .danger_accept_invalid_certs(true)
            .build()
            .unwrap();
        let curr_timestamp = Utc::now().timestamp_millis();
        let check_data = client.get(_url.to_owned()).send().await;
        match check_data {
            Ok(res) => {
                if res.status().is_success() {
                    let mut ffprobe = Command::new("ffprobe");
                    let mut prob = ffprobe
                        .arg("-v")
                        .arg("quiet")
                        .arg("-print_format")
                        .arg("json");
                    if timeout > 0 {
                        prob = prob.arg("-timeout").arg(timeout.to_string());
                    }
                    let prob_result = prob
                        .arg("-show_format")
                        .arg("-show_streams")
                        .arg(_url.to_owned())
                        .output()
                        .unwrap();
                    if prob_result.status.success() {
                        // println!("{}", String::from_utf8(prob_result.stdout).unwrap());
                        let res_data: Ffprobe = serde_json::from_str(
                            String::from_utf8(prob_result.stdout).unwrap().as_str(),
                        )
                        .expect("无法解析 JSON");
                        let delay = Utc::now().timestamp_millis() - curr_timestamp;
                        let mut body: CheckUrlIsAvailableResponse = CheckUrlIsAvailableResponse {
                            delay: delay as i32,
                            video: CheckUrlIsAvailableRespVideo {
                                width: 0,
                                height: 0,
                                codec: String::from(""),
                                bit_rate: 0,
                            },
                            audio: CheckUrlIsAvailableRespAudio {
                                codec: String::from(""),
                                channels: 0,
                                bit_rate: 0,
                            },
                        };
                        for one in res_data.streams.into_iter() {
                            if one.codec_type == "video" {
                                let mut width = 0;
                                let mut height = 0;
                                match one.width {
                                    Some(e) => width = e,
                                    _ => {}
                                }
                                match one.height {
                                    Some(e) => height = e,
                                    _ => {}
                                }
                                body.video.width = width;
                                body.video.height = height;
                                body.video.codec = one.codec_name;
                                // body.video.bit_rate = one.bit_rate;
                            } else if one.codec_type == "audio" {
                                // body.audio.bit_rate = one.bit_rate;
                                body.audio.channels = one.channels.unwrap();
                                body.audio.codec = one.codec_name;
                            }
                        }
                        return Ok(body);
                    } else {
                        let error_str = String::from_utf8_lossy(&prob_result.stderr);
                        println!("命令执行失败: {}", error_str);
                        return Err(error_str)
                    }
                }
                return Err(String::from("res.status is not success"))
            }
            Err(e) => {
                return Err(String::from(e.to_string()))
            }
        }
    }

    pub fn check_can_support_ipv6() -> Result<bool, Error> {
        Ok(true)
    }
}
