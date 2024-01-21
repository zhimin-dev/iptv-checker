use crate::PID_FILE;
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::fs;
use std::fs::File;
use std::io::{Error, ErrorKind, Read};
use std::process::Command;

pub fn get_out_put_filename(output_file: String) -> String {
    let mut filename = output_file.clone();
    if output_file == "" {
        filename = get_random_output_filename();
    }
    filename
}

fn get_random_output_filename() -> String {
    let rng = rand::thread_rng();

    let random_string: String = rng
        .sample_iter(Alphanumeric)
        .take(10)
        .map(char::from)
        .collect();
    format!("./{}.m3u", random_string)
}

fn read_pid_contents(pid_file: String) -> Result<String, Error> {
    let mut f = File::open(pid_file)?;
    let mut contents = String::new();
    f.read_to_string(&mut contents)?;
    Ok(contents)
}

pub fn check_process(pid: u32) -> Result<bool, Error> {
    let status = Command::new("ps").arg("-p").arg(pid.to_string()).output();
    Ok(status.unwrap().status.success())
}

pub fn file_exists(file_path: &str) -> bool {
    if let Ok(metadata) = fs::metadata(file_path) {
        metadata.is_file()
    } else {
        false
    }
}

// 如果pid文件存在，需要将之前的pid删除，然后才能启动新的pid
pub fn check_pid_exits() {
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

pub fn read_pid_num() -> Result<u32, Error> {
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
