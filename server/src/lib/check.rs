use std::fmt::Error;
use std::process::Command;
use std::time;

async fn check_link_is_valid(_url: String, _timeout: u32) -> Result<CheckUrlIsAvailableResponse, Error>{
    let client = reqwest::Client::builder()
        .timeout(time::Duration::from_millis(timeout as u64))
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let curr_timestamp = Utc::now().timestamp_millis();
    let check_data = client.get(req.url.to_owned()).send().await;
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
                    .arg(req.url.to_owned())
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
                    let obj = serde_json::to_string(&body).unwrap();
                    return HttpResponse::Ok().body(obj);
                } else {
                    let error_str = String::from_utf8_lossy(&prob_result.stderr);
                    println!("命令执行失败: {}", error_str);
                    return HttpResponse::InternalServerError()
                        .body("{\"msg\":\"internal error\"}");
                }
            }
            // 在这里处理错误的响应
            return HttpResponse::Ok().body("{}");
        }
        Err(e) => {
            println!("resp status error : {}", e);
            return HttpResponse::InternalServerError().body("{\"msg\":\"internal error\"}");
        }
}

pub fn check_can_support_ipv6() -> Result<bool, Error> {
    Ok(true)
}
