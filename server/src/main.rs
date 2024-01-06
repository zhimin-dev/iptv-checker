mod lib;
mod web;
use clap::{arg, Parser};
use daemonize::Daemonize;
use std::env;
use std::fs;
use std::fs::File;
use std::io::{Error, ErrorKind, Read};
use std::process::Command;

#[derive(Parser, Debug)]
#[command(name = "iptv-checker")]
#[command(author, version, about="a iptv-checker cmd by rust", long_about = None, )]
pub struct Args {
    #[arg(long="input_file", default_value_t = String::from(""))]
    input_file: String,

    #[arg(long="url", default_value_t = String::from(""))]
    url: String,

    // is open debug mod? you can see logs
    #[arg(long = "debug", default_value_t = false)]
    debug: bool,

    #[arg(long = "web_start", default_value_t = false)]
    web_start: bool,

    #[arg(long = "port", default_value_t = 0)]
    web_port: u16,

    #[arg(long = "web_stop", default_value_t = false)]
    web_stop: bool,

    #[arg(long = "status", default_value_t = false)]
    status: bool,

    #[arg(long = "check_sleep_time", default_value_t = 300)]
    check_sleep_time: u16,

    #[arg(long = "http_request_num", default_value_t = 8000)]
    http_request_num: u16,

    #[arg(long = "output_file", default_value_t = String::from(""))]
    output_file: String,
}

fn check_process(pid: u32) -> Result<bool, Error> {
    let status = Command::new("ps").arg("-p").arg(pid.to_string()).output();
    Ok(status.unwrap().status.success())
}

fn file_exists(file_path: &str) -> bool {
    if let Ok(metadata) = fs::metadata(file_path) {
        metadata.is_file()
    } else {
        false
    }
}

const PID_FILE: &str = "/tmp/iptv_checker_web_server.pid";

// 如果pid文件存在，需要将之前的pid删除，然后才能启动新的pid
fn check_pid_exits() {
    if file_exists(PID_FILE) {
        match read_pid_num() {
            Ok(num) => {
                let has_process = check_process(num);
                match has_process {
                    Ok(has) => {
                        if has {
                            kill_process(num);
                        }
                    }
                    Err(e) => {
                        println!("{}", e)
                    }
                }
            }
            Err(e) => {
                println!("{}", e)
            }
        }
    }
}

fn kill_process(pid: u32) {
    let _output = Command::new("kill")
        .arg("-9")
        .arg(pid.to_string())
        .output()
        .expect("Failed to execute command");
}

fn read_pid_num() -> Result<u32, Error> {
    match read_pid_contents(PID_FILE.to_string()) {
        Ok(contents) => {
            let mut n_contents = contents;
            n_contents = n_contents.replace("\n", "");
            match n_contents.parse::<u32>() {
                Ok(num) => Ok(num),
                Err(e) => Err(Error::new(ErrorKind::InvalidData, e)),
            }
        }
        Err(e) => Err(e),
    }
}

fn read_pid_contents(pid_file: String) -> Result<String, Error> {
    let mut f = File::open(pid_file)?;
    let mut contents = String::new();
    f.read_to_string(&mut contents)?;
    Ok(contents)
}

fn start_daemonize_web(port: u16, cmd_dir: String) {
    check_pid_exits();
    println!("daemonize web server");

    let stdout = File::create("/tmp/iptv_checker_web_server.out").unwrap();
    let stderr = File::create("/tmp/iptv_checker_web_server.err").unwrap();
    // 创建守护进程
    let daemonize = Daemonize::new()
        .pid_file(PID_FILE)
        .working_directory(cmd_dir) // for default behaviour.
        .chown_pid_file(false)
        .umask(0o777)
        .stdout(stdout)
        .stderr(stderr)
        .privileged_action(|| "Executed before drop privileges");

    let d_res = daemonize.start();
    match d_res {
        Ok(_) => {
            // 守护进程的执行流程
            println!("daemonize process started");
            // 启动 web 服务
            web::start_web(port);
        }
        Err(e) => eprintln!("Failed to daemonize: {}", e),
    }
    println!("daemonize finished")
}

pub fn show_status() {
    if file_exists(PID_FILE) {
        match read_pid_num() {
            Ok(num) => {
                let has_process = check_process(num);
                match has_process {
                    Ok(has) => {
                        if has {
                            println!("web server running at pid = {}", num)
                        }
                    }
                    Err(e) => {
                        println!("{}", e)
                    }
                }
            }
            Err(e) => {
                println!("{}", e)
            }
        }
    }
}

#[actix_web::main]
pub async fn main() {
    let args = Args::parse();
    let mut c_dir = String::from("");
    if let Ok(current_dir) = env::current_dir() {
        if let Some(c_str) = current_dir.to_str() {
            c_dir = c_str.to_string();
        }
    }
    if args.web_start {
        let mut port = args.web_port;
        if port == 0 {
            port = 8080
        }
        start_daemonize_web(port, c_dir);
    }
    if args.web_stop {
        check_pid_exits();
    }
    if args.status {
        show_status();
    }
    if args.input_file != "" {
        match read_from_file(args.input_file) {
            Ok(contents) => {
                println!("{}", contents);
            }
            Err(e) => {
                println!("err {}", e);
            }
        }
    }
    if args.url != "" {
        println!("{}", args.url);
        let data = lib::m3u::m3u::from_url(args.url, args.http_request_num as u64).await;
        println!("{}", data.list.len());
        println!("{}", data.header.unwrap().x_tv_url.len());
    }
    // 等待守护进程启动
    std::thread::sleep(std::time::Duration::from_secs(3));
}

fn read_from_file(_file: String) -> Result<String, Error> {
    Ok(String::from(""))
}
