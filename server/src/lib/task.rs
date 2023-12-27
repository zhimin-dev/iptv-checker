use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct TaskList {
    list: Vec<TaskItem>, //任务信息
}
#[derive(Debug, Deserialize, Serialize)]
pub enum TaskStatus {
    TaskWait,        //待处理
    TaskNowHandling, //正在处理
    TaskPause,       //任务正在暂停
    TaskFinished,    //任务完成
}
#[derive(Debug, Deserialize, Serialize)]
pub struct TaskItem {
    task_source: TaskPost, //任务来源
    task_id: String,       //任务id
    task_info: TaskInfo,   //任务详情
}
#[derive(Debug, Deserialize, Serialize)]
pub struct TaskInfo {
    create_time: i32, //任务创建时间
    task: TaskStatus, //任务状态
    total: i32,       // 总的频道数
    current: i32,     // 已检查频道数
}
#[derive(Debug, Deserialize, Serialize)]
pub struct TaskPost {
    urls: Vec<String>,   // 订阅源
    contents: String,    //订阅源内容
    result_name: String, //结果文件名，最后可以通过这个文件来获取结果
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TaskPostResp {
    task_id: String, //任务id
}

pub mod task {}
