import axios from 'axios';
import Koa from 'koa';
import Router from 'koa-router'; // 引入koa-router
import Views from 'koa-views';
import path from 'path';
import koaStatic from 'koa-static';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
import { exec } from "child_process";

const __dirname = path.dirname(__filename);
const app = new Koa();
app.use(koaStatic(path.resolve(__dirname, 'dist/')));
app.use(Views(path.join(__dirname, 'dist/'), { extension: 'html' }));
const router = new Router(); // 创建路由，支持传递参数

function useExec(shell) {
    return new Promise((res, rej) => {
        exec(shell, (err, stdout, stderr) => {
            if (err) rej(err);
            res({
                stdout,
                stderr,
            });
        });
    });
}

router.get('/check-url-is-available', async (ctx) => {
    const { url, timeout } = ctx.query
    let data = await useExec("ffprobe -v quiet -print_format json -show_format -show_streams "+url)
    let stdout = data.stdout
    try{
        stdout = JSON.parse(stdout)
    }catch(e) {
        console.log(e)
    }
    let result = {
        "video": {"width":0, "height":0, "codec":'','bitRate':''},
        'audio':{"codec":'','channels':0,'bitRate':''}
    }
    let streams = (stdout.streams !== undefined && stdout.streams !== null) ? stdout.streams :[]
    if(streams.length === 0) {
        ctx.status =400
        return
    }
    for(let i =0;i<streams.length;i++) {
        if(streams[i].codec_type==='video') {
            result['video'] = {
                "width":streams[i].width, "height":streams[i].height, "codec":streams[i].codec_name,'bitRate':streams[i].bit_rate
            }
        }else if(streams[i].codec_type==='audio') {
            result['audio'] = {
                "codec":streams[i].codec_name,'channels':streams[i].channels,'bitRate':streams[i].bit_rate
            }
        }
     }
    
    ctx.body = result;
})

router.get("/fetch-m3u-body", async function(ctx) {
    const { url, timeout } = ctx.query
    let _timeout = 3000
    if (timeout !== undefined) {
        _timeout = parseInt(timeout, 10)
    }
    let respStr = ""
    try {
        const respData = await axios.get(url, { timeout: _timeout })
        if (respData.status === 200) {
            respStr = respData.data
        }
    } catch (e) {
        console.log(e)
    }
    ctx.body = respStr;
})

router.get("/", async function (req, res) {
    await req.render("index")
})

console.log("server listen 8080")
app.use(router.routes());
app.listen(8080);