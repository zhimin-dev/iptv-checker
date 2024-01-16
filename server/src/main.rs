mod lib;
mod web;
use crate::lib::util::is_url;
use crate::lib::M3uObjectList;
use clap::{arg, Args as clapArgs, Parser, Subcommand};
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::env;
use std::fs;
use std::fs::File;
use std::io::{Error, ErrorKind, Read};
use std::process::Command;
use std::time::Duration;
use tokio::time::sleep;

#[derive(Subcommand)]
enum Commands {
    /// web相关命令
    Web(WebArgs),
    /// 本次检查相关命令
    Check(CheckArgs),
}

#[derive(clapArgs)]
pub struct WebArgs {
    #[arg(long = "start", default_value_t = false)]
    start: bool,

    #[arg(long = "port", default_value_t = 8089)]
    port: u16,

    #[arg(long = "stop", default_value_t = false)]
    stop: bool,

    #[arg(long = "status", default_value_t = false)]
    status: bool,
}

#[derive(clapArgs)]
pub struct CheckArgs {
    #[arg(short='i', long="input-file", default_value_t = String::from(""))]
    input_file: String,

    // todo 支持sdr、hd、fhd、uhd、fuhd搜索
    #[arg(short = 's', long = "search_clarity", default_value_t = String::from(""))]
    search_clarity: String,

    #[arg(short = 'o', long="output-file", default_value_t = String::from(""))]
    output_file: String,

    #[arg(short = 't', long = "timeout", default_value_t = 28000)]
    timeout: u16,

    // is open debug mod? you can see logs
    #[arg(long = "debug", default_value_t = false)]
    debug: bool,
}

#[derive(Parser)]
#[command(name = "iptv-checker")]
#[command(author, version, about="a iptv-checker cmd by rust", long_about = None, )]
pub struct Args {
    #[command(subcommand)]
    command: Commands,
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
        let num = read_pid_num().expect("获取pid失败");
        let has_process = check_process(num).expect("检查pid失败");
        if has_process {
            kill_process(num);
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

async fn start_daemonize_web(port: u16, cmd_dir: String) {
    println!("start web-----{}", cmd_dir);
    check_pid_exits();
    println!("start web server, port:{}", port);
    // 启动 web 服务
    web::start_web(port).await;
}

pub fn show_status() {
    if file_exists(PID_FILE) {
        match read_pid_num() {
            Ok(num) => {
                let has_process = check_process(num).unwrap();
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

fn get_random_output_filename() -> String {
    let mut rng = rand::thread_rng();

    let random_string: String = rng
        .sample_iter(Alphanumeric)
        .take(10)
        .map(char::from)
        .collect();
    format!("./{}.m3u", random_string)
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
                check_pid_exits();
            }
        }
        Commands::Check(args) => {
            if args.input_file != "" {
                println!("{}", args.input_file);
                let mut data = M3uObjectList::new();
                if !is_url(args.input_file.to_owned()) {
                    data = lib::m3u::m3u::from_file(args.input_file.to_owned());
                } else {
                    data = lib::m3u::m3u::from_url(args.input_file.to_owned(), args.timeout as u64)
                        .await;
                }
                let output_file = get_out_put_filename(args.output_file.clone());
                println!("generate output file : {}", output_file);
                if args.debug {
                    data.set_debug_mod(args.debug);
                }
                data.check_data(args.timeout as i32).await;
                data.output_file(output_file).await;
            }
        }
    }
}

fn get_out_put_filename(output_file: String) -> String {
    let mut filename = output_file.clone();
    if output_file == "" {
        filename = get_random_output_filename();
    }
    filename
}

fn read_from_file(_file: String) -> Result<String, Error> {
    Ok(String::from(""))
}
