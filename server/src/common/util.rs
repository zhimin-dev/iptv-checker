use crate::common::{M3uExt, M3uExtend, M3uObject, M3uObjectList};
use reqwest::Error;
use url::Url;

pub async fn get_url_body(_url: String, timeout: u64) -> Result<String, Error> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(timeout))
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    return client.get(_url.to_owned()).send().await?.text().await;
}

pub fn check_body_is_m3u8_format(_body: String) -> bool {
    return _body.starts_with("#EXTM3U");
}

pub fn parse_normal_str(_body: String) -> M3uObjectList {
    let mut result = M3uObjectList::new();
    let mut list = Vec::new();
    let exp_line = _body.split("\n");
    let mut m3u_ext = M3uExt { x_tv_url: vec![] };
    let mut index = 1;
    let mut one_m3u = Vec::new();
    for x in exp_line {
        if x.starts_with("#EXTM3U") {
            m3u_ext = parse_m3u_header(x.to_owned());
        } else {
            one_m3u.push(x);
            if is_url(x.to_string()) {
                let item = parse_one_m3u(one_m3u.clone(), index);
                match item {
                    Some(data) => {
                        index += 1;
                        list.push(data);
                        one_m3u = Vec::new();
                    }
                    None => {}
                }
            }
        }
    }
    result.set_list(list);
    result.set_header(m3u_ext);
    result
}

fn parse_m3u_header(_str: String) -> M3uExt {
    let mut x_tv_url_arr: Vec<String> = Vec::new();
    if let Some(title) = _str.split("x-tvg-url=\"").nth(1) {
        let exp_str = title.split("\"").next().unwrap();
        let list: Vec<&str> = exp_str.split(",").collect();
        for x in list {
            x_tv_url_arr.push(x.to_string())
        }
    }
    M3uExt {
        x_tv_url: x_tv_url_arr.to_owned(),
    }
}

fn parse_one_m3u(_arr: Vec<&str>, index: i32) -> Option<M3uObject> {
    let url = _arr.get(_arr.len() - 1).unwrap().to_string();
    if _arr.get(0).unwrap().starts_with("#EXTINF") && is_url(url.to_owned()) {
        let mut extend = M3uExtend::new();
        if let Some(title) = _arr.get(0).unwrap().split("group-title=\"").nth(1) {
            extend.set_group_title(title.split("\"").next().unwrap().to_owned())
        }
        if let Some(tv_id) = _arr.get(0).unwrap().split("tvg-id=\"").nth(1) {
            extend.set_tv_id(tv_id.split("\"").next().unwrap().to_owned())
        }
        if let Some(tv_logo) = _arr.get(0).unwrap().split("tvg-logo=\"").nth(1) {
            extend.set_tv_logo(tv_logo.split("\"").next().unwrap().to_owned())
        }
        if let Some(tv_country) = _arr.get(0).unwrap().split("tvg-country=\"").nth(1) {
            extend.set_tv_country(tv_country.split("\"").next().unwrap().to_owned())
        }
        if let Some(tv_language) = _arr.get(0).unwrap().split("tvg-language=\"").nth(1) {
            extend.set_tv_language(tv_language.split("\"").next().unwrap().to_owned())
        }
        if let Some(user_agent) = _arr.get(0).unwrap().split("user-agent=\"").nth(1) {
            extend.set_user_agent(user_agent.split("\"").next().unwrap().to_owned())
        }
        let exp: Vec<&str> = _arr.get(0).unwrap().split(",").collect();
        let name = exp.get(exp.len() - 1).unwrap();

        let mut m3u_obj = M3uObject::new();
        m3u_obj.set_extend(extend);
        m3u_obj.set_index(index);
        m3u_obj.set_url(url.to_string());
        m3u_obj.set_name(name.to_string());
        m3u_obj.set_search_name(name.to_string());
        m3u_obj.set_raw(_arr.join("\n").to_string());
        return Some(m3u_obj);
    }
    return None;
}

pub fn parse_quota_str(_body: String) -> M3uObjectList {
    let mut result = M3uObjectList::new();
    let mut list = Vec::new();
    let exp_line = _body.split("\n");
    let mut now_group = String::from("");
    let mut index = 1;
    for x in exp_line {
        let one_c: Vec<&str> = x.split(",").collect();
        let mut name = String::from("");
        let mut url = String::from("");
        match one_c.get(0) {
            Some(pname) => {
                name = pname.to_string();
            }
            None => {}
        }

        match one_c.get(1) {
            Some(purl) => {
                url = purl.replace("\r", "").to_string();
            }
            None => {}
        }
        if name != "" && url != "" {
            if !is_url(url.clone()) {
                now_group = name.to_string();
            } else {
                let _name = name.clone();
                let mut m3u_obj = M3uObject::new();
                let mut extend = M3uExtend::new();
                extend.set_group_title(now_group.clone());
                m3u_obj.set_extend(extend);
                m3u_obj.set_index(index);
                m3u_obj.set_url(url.to_string());
                m3u_obj.set_name(name.to_string());
                m3u_obj.set_search_name(name.to_string());
                m3u_obj.set_raw(x.replace("\r", "").to_owned());
                index += 1;
                list.push(m3u_obj)
            }
        }
    }
    result.set_list(list);
    return result;
}

pub fn is_url(_str: String) -> bool {
    let _url = &_str;
    let check_url = Url::parse(_url);
    return match check_url {
        Ok(_) => true,
        Err(_) => false,
    };
}
