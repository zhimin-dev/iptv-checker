use reqwest::Error;
use crate::lib::{CheckDataStatus, M3uExtend, M3uObject, OtherStatus};

pub async fn get_url_body(_url: String, timeout: u64) -> Result<String,Error>{
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(timeout))
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    return client
        .get(_url.to_owned())
        .send()
        .await?
        .text().await;
}

pub fn parse_normal_str(_body:String) -> Vec<M3uObject> {
    let mut list = Vec::new();


    list
}

pub fn parse_quota_str(_body:String) -> Vec<M3uObject> {
    let mut list = Vec::new();
    let exp_line = _body.split("\n");
    let mut now_group = String::from("");
    let mut index = 1;
    for x in exp_line {
        let one_c:Vec<&str> = x.split(",").collect();
        let name = one_c.get(0).unwrap().to_string();
        let url =  one_c.get(1).unwrap().to_string();
        if is_url(url.clone()) {
            now_group = url.to_string();
        }else{
            let extend = M3uExtend{
                group_title: now_group.to_owned(),
                tv_logo: String::from(""),     //台标
                language: String::from(""),    //语言
                tv_id: String::from(""),       //电视id
            };
            let s_name  =name.clone().to_lowercase();
            let one = M3uObject{
                index,
                name,
                url:url.to_owned(),
                search_name:s_name,
                raw: x.to_owned(),
                extend:Some(extend),
                other_status: None,
            };
            index+=1;
            list.push(one)
        }
    }
    list
}

pub fn is_url(_str:String) -> bool {
    false
}