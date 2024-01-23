use crate::common::check;
use crate::common::task;
use actix_files as fs;
use actix_files::NamedFile;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, Result};
use serde::{Deserialize, Serialize};
use std::time;

#[post("/task/post")]
async fn accept_one_task(_info: web::Json<task::TaskPost>) -> Result<String> {
    Ok(format!("task post"))
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskDel {
    task_id: String, //任务id
}

#[derive(Debug, Deserialize, Serialize)]
struct TaskDelResp {
    result: bool, //是否成功
}

#[post("/task/del")]
async fn del_one_task() -> Result<String> {
    Ok(format!("task del"))
}

#[post("/task/list")]
async fn list_task() -> Result<String> {
    Ok(format!("task list"))
}

#[derive(Serialize, Deserialize)]
struct CheckUrlIsAvailableRequest {
    url: String,
    timeout: Option<i32>,
}
#[get("/check-url-is-available")]
async fn check_url_is_available(req: web::Query<CheckUrlIsAvailableRequest>) -> impl Responder {
    let mut timeout = 0;
    match req.timeout {
        Some(i) => timeout = i,
        _ => {}
    }
    let res = check::check::check_link_is_valid(req.url.to_owned(), timeout as u64, true, true);
    match res.await {
        Ok(data) => {
            let obj = serde_json::to_string(&data).unwrap();
            return HttpResponse::Ok().body(obj);
        }
        Err(e) => {
            println!("{}", e);
            return HttpResponse::InternalServerError().body("{\"msg\":\"internal error\"}");
        }
    };
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
        Some(i) => timeout = i,
        _ => {}
    }
    let client = reqwest::Client::builder()
        .timeout(time::Duration::from_millis(timeout as u64))
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let resp = client.get(req.url.to_owned()).send().await;
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
                        return HttpResponse::InternalServerError()
                            .body("{\"msg\":\"internal error, fetch body error\"}");
                    }
                }
            }
            return HttpResponse::InternalServerError()
                .body("{\"msg\":\"internal error, status is not 200\"}");
        }
        Err(e) => {
            println!("fetch error : {}", e);
            return HttpResponse::InternalServerError()
                .body("{\"msg\":\"internal error, fetch error\"}");
        }
    };
}

static VIEW_BASE_DIR: &str = "./../dist/";

#[get("/")]
async fn index() -> impl Responder {
    println!("---now index");
    NamedFile::open(VIEW_BASE_DIR.to_owned() + "index.html")
}

#[derive(Serialize, Deserialize)]
struct SystemStatus {
    can_ipv6: bool,
}

#[get("/system-status")]
async fn system_status() -> impl Responder {
    let check_ipv6 = check::check::check_can_support_ipv6().unwrap();
    let system_status = SystemStatus {
        can_ipv6: check_ipv6,
    };
    let obj = serde_json::to_string(&system_status).unwrap();
    return HttpResponse::Ok().body(obj);
}

pub async fn start_web(port: u16) {
    // actix_rt::System::new().block_on(async {
    let _ = HttpServer::new(|| {
        App::new()
            .service(check_url_is_available)
            .service(fetch_m3u_body)
            .service(index)
            .service(system_status)
            .service(
                fs::Files::new("/assets", VIEW_BASE_DIR.to_owned() + "/assets")
                    .show_files_listing(),
            )
    })
    .bind(("0.0.0.0", port))
    .expect("Failed to bind address")
    .run()
    .await
    .expect("failed to run server");
    // });
}
