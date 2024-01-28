mod common;
mod utils;
mod web;

use clap::{arg, Args as clapArgs, Parser, Subcommand};
use std::env;

#[derive(Subcommand)]
enum Commands {
    /// web相关命令
    Web(WebArgs),
    /// 检查相关命令
    Check(CheckArgs),
}

#[derive(clapArgs)]
pub struct WebArgs {
    /// 启动一个web服务
    #[arg(long = "start", default_value_t = false)]
    start: bool,

    /// 指定这个web服务的端口号，默认8089
    #[arg(long = "port", default_value_t = 8089)]
    port: u16,

    /// 关闭这个web服务
    #[arg(long = "stop", default_value_t = false)]
    stop: bool,

    /// 输出当前web服务的状态，比如pid信息
    #[arg(long = "status", default_value_t = false)]
    status: bool,
}

#[derive(clapArgs)]
pub struct CheckArgs {
    /// 输入文件，可以是本地文件或者是网络文件，支持标准m3u格式以及非标准的格式：CCTV,https://xxxx.com/xxx.m3u8格式
    #[arg(short = 'i', long = "input-file")]
    input_file: Vec<String>,

    // /// [待实现]支持sdr、hd、fhd、uhd、fuhd搜索
    // #[arg(short = 's', long = "search_clarity", default_value_t = String::from(""))]
    // search_clarity: String,
    /// 输出文件，如果不指定，则默认生成一个随机文件名
    #[arg(short = 'o', long="output-file", default_value_t = String::from(""))]
    output_file: String,

    /// 超时时间，默认超时时间为28秒
    #[arg(short = 't', long = "timeout", default_value_t = 28000)]
    timeout: u16,

    /// debug使用，可以看到相关的中间日志
    #[arg(long = "debug", default_value_t = false)]
    debug: bool,

    /// 并发数
    #[arg(short = 'c', long = "concurrency", default_value_t = 1)]
    concurrency: i32,
}

#[derive(Parser)]
#[command(name = "iptv-checker")]
#[command(author="zmisgod", version=env!("CARGO_PKG_VERSION"), about="a iptv-checker cmd, source code 👉 https://github.com/zhimin-dev/iptv-checker", long_about = None, )]
pub struct Args {
    #[command(subcommand)]
    command: Commands,
}
const PID_FILE: &str = "/tmp/iptv_checker_web_server.pid";

async fn start_daemonize_web(port: u16, cmd_dir: String) {
    println!("start web-----{}", cmd_dir);
    utils::check_pid_exits();
    println!("start web server, port:{}", port);
    // 启动 web 服务
    web::start_web(port).await;
}

pub fn show_status() {
    if utils::file_exists(PID_FILE) {
        match utils::read_pid_num() {
            Ok(num) => {
                let has_process = utils::check_process(num).unwrap();
                if has_process {
                    println!("web server running at pid = {}", num)
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
    match args.command {
        Commands::Web(args) => {
            if args.status {
                show_status();
            } else if args.start {
                let mut c_dir = String::from("");
                if let Ok(current_dir) = env::current_dir() {
                    if let Some(c_str) = current_dir.to_str() {
                        c_dir = c_str.to_string();
                    }
                }
                let mut port = args.port;
                if port == 0 {
                    port = 8080
                }
                start_daemonize_web(port, c_dir).await;
            } else if args.stop {
                utils::check_pid_exits();
            }
        }
        Commands::Check(args) => {
            if args.input_file.len() > 0 {
                println!("您输入的文件地址是: {}", args.input_file.join(","));
                let mut data =
                    common::m3u::m3u::from_arr(args.input_file.to_owned(), args.timeout as u64)
                        .await;
                let output_file = utils::get_out_put_filename(args.output_file.clone());
                println!("输出文件: {}", output_file);
                if args.debug {
                    data.set_debug_mod(args.debug);
                }
                data.check_data_new(args.timeout as i32, args.concurrency)
                    .await;
                data.output_file(output_file).await;
                let status_string = data.print_result();
                println!("\n{}\n解析完成----", status_string);
            }
        }
    }
}
