use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, Result};
use actix_files as fs;
use actix_files::NamedFile;
use serde::{Deserialize, Serialize};
use std::time;
use chrono::{Utc};
use std::process::Command;

#[derive(Serialize, Deserialize)]
struct CheckUrlIsAvailableRequest {
    url: String,
    timeout: Option<i32>,
}

#[derive(Serialize, Deserialize)]
struct CheckUrlIsAvailableResponse {
    delay: i32,
    video: CheckUrlIsAvailableRespVideo,
    audio: CheckUrlIsAvailableRespAudio,
}

#[derive(Serialize, Deserialize)]
struct CheckUrlIsAvailableRespAudio {
    codec: String,
    channels: i32,
    #[serde(rename = "bitRate")]
    bit_rate:i32,
}

#[derive(Serialize, Deserialize)]
struct CheckUrlIsAvailableRespVideo {
    width: i32,
    height: i32,
    codec: String,
    #[serde(rename = "bitRate")]
    bit_rate:i32,
}

#[derive(Debug, Deserialize, Serialize)]
struct Ffprobe {
    streams: Vec<FfprobeStream>
}

#[derive(Debug, Deserialize, Serialize)]
struct FfprobeStream {
    codec_type: String ,
    width: Option<i32>,
    height:Option<i32>,
    codec_name:String,
    // bit_rate: i32,
    channels: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskPost {
    urls: Vec<String>,// 订阅源
    contents: String, //订阅源内容
    result_name: String,//结果文件名，最后可以通过这个文件来获取结果
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskPostResp {
    task_id :String,//任务id
}

#[post("/task/post")]
async fn accept_one_task(info: web::Json<TaskPost>) -> Result<String> {
    Ok(format!("task post"))
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskDel {
    task_id:String,//任务id
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskDelResp {
    result :bool,//是否成功
}

#[post("/task/del")]
async fn del_one_task() -> Result<String> {
    Ok(format!("task del"))
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskList {
    list:Vec<TaskItem>,//任务信息
}
#[derive(Debug, Deserialize, Serialize)]
enum TaskStatus {
    TaskWait,//待处理
    TaskNowHandling,//正在处理
    TaskPause,//任务正在暂停
    TaskFinished,//任务完成
}
#[derive(Debug, Deserialize, Serialize)]
struct TaskItem {
    task_source: TaskPost,//任务来源
    task_id: String,//任务id
    task_info:TaskInfo,//任务详情
}
#[derive(Debug, Deserialize, Serialize)]
struct TaskInfo {
    create_time: i32,//任务创建时间
    task: TaskStatus,//任务状态
    total: i32,// 总的频道数
    current: i32,// 已检查频道数
}

#[post("/task/list")]
async fn list_task() -> Result<String> {
    Ok(format!("task list"))
}

#[get("/check-url-is-available")]
async fn check_url_is_available(req: web::Query<CheckUrlIsAvailableRequest>) -> impl Responder {
    let mut timeout = 0;
    match req.timeout {
        Some(i) => {
            timeout = i
        }
        _ => {}
    }
    let client = reqwest::Client::builder().timeout(time::Duration::from_millis(timeout as u64)).danger_accept_invalid_certs(true).build().unwrap();
    let curr_timestamp = Utc::now().timestamp_millis();
    let check_data = client.get(req.url.to_owned()).send().await;
    match check_data {
        Ok(res) => {
            if res.status().is_success() {
                let mut ffprobe = Command::new("ffprobe");
                let prob = ffprobe.arg("-v").arg("quiet").arg("-print_format").arg("json");
                // if timeout > 0 {
                //     prob = prob.arg("-timeout").arg(timeout.to_string());
                // }
                let prob_result = prob.arg("-show_format").arg("-show_streams").arg(req.url.to_owned()).output().unwrap();
                if prob_result.status.success() {
                    // println!("{}", String::from_utf8(prob_result.stdout).unwrap());
                    let res_data: Ffprobe = serde_json::from_str(String::from_utf8(prob_result.stdout).unwrap().as_str())
                        .expect("无法解析 JSON");
                    let delay = Utc::now().timestamp_millis() - curr_timestamp;
                    let mut  body: CheckUrlIsAvailableResponse = CheckUrlIsAvailableResponse{
                        delay:delay as i32,
                        video: CheckUrlIsAvailableRespVideo{
                            width: 0,
                            height: 0,
                            codec: String::from(""),
                            bit_rate:0
                        },
                        audio:CheckUrlIsAvailableRespAudio{
                            codec: String::from(""),
                            channels: 0,
                            bit_rate: 0,
                        }
                    };
                    for one in res_data.streams.into_iter() {
                        if one.codec_type == "video" {
                            let mut width  = 0;
                            let mut height =0;
                            match one.width {
                                Some(e) =>  {
                                    width = e
                                }
                                _ => {}
                            }
                            match one.height {
                                Some(e) =>  {
                                    height = e
                                }
                                _ => {}
                            }
                            body.video.width = width;
                            body.video.height = height;
                            body.video.codec = one.codec_name;
                            // body.video.bit_rate = one.bit_rate;
                        }else if one.codec_type == "audio" {
                            // body.audio.bit_rate = one.bit_rate;
                            body.audio.channels = one.channels.unwrap();
                            body.audio.codec = one.codec_name;
                        }
                    }
                    let obj = serde_json::to_string(&body).unwrap();
                    return HttpResponse::Ok().body(obj);
                }else{
                    let error_str = String::from_utf8_lossy(&prob_result.stderr);
                    println!("命令执行失败: {}", error_str);
                    return HttpResponse::InternalServerError().body("{\"msg\":\"internal error\"}");
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
}

#[derive(Serialize, Deserialize)]
struct FetchM3uBodyRequest {
    url: String,
    timeout: Option<i32>,
}

#[get("/fetch-m3u-body")]
async fn fetch_m3u_body(req: web::Query<FetchM3uBodyRequest>) -> impl Responder {
    let mut timeout = 0;
    match req.timeout {
        Some(i) => {
            timeout = i
        }
        _ => {}
    }
    let client= reqwest::Client::builder().timeout(time::Duration::from_millis(timeout as u64)).danger_accept_invalid_certs(true).build().unwrap();
    let resp=  client.get(req.url.to_owned()).send().await;
    match resp {
        Ok(res) => {
            if res.status().is_success() {
                let body = res.text().await;
                match body {
                    Ok(text) => {
                        return HttpResponse::Ok().body(text);
                    }
                    Err(e) => {
                        println!("resp status error : {}", e);
                        return HttpResponse::InternalServerError().body("{\"msg\":\"internal error, fetch body error\"}");
                    }
                }
            }
            return HttpResponse::InternalServerError().body("{\"msg\":\"internal error, status is not 200\"}");
        }
        Err(e) => {
            println!("fetch error : {}", e);
            return HttpResponse::InternalServerError().body("{\"msg\":\"internal error, fetch error\"}");
        }
    }
}

static VIEW_BASE_DIR :&str  = "./../dist/";

#[get("/")]
async fn index() -> impl Responder {
    NamedFile::open(VIEW_BASE_DIR.to_owned() + "index.html")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = 8080;
    println!("start to run at {}", port);
    HttpServer::new(|| {
        App::new()
            .service(check_url_is_available)
            .service(fetch_m3u_body)
            .service(index)
            .service(fs::Files::new("/assets", VIEW_BASE_DIR.to_owned() + "/assets").show_files_listing())
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}