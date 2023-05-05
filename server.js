import axios from 'axios';
import Koa from 'koa';
import Router from 'koa-router'; // 引入koa-router
import Views from 'koa-views';
import path from 'path';
import koaStatic from 'koa-static';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const app = new Koa();
app.use(koaStatic(path.resolve(__dirname, 'dist/')));
app.use(Views(path.join(__dirname, 'dist/'), {extension:'html'}));
const router = new Router(); // 创建路由，支持传递参数

router.get('/check-url-is-available', async (ctx) => {
    const {url,timeout} = ctx.query
    let _timeout = 3000
    if(timeout !== undefined) {
        _timeout = parseInt(timeout, 10)
    }
    let respStr = ''
    try{
        const respData = await axios.get(url, {timeout: _timeout})
        if(respData.status === 200) {
            respStr = respData.data
        }
    }catch(e) {
        console.log(e)
    }
    ctx.body = respStr;
})

router.get("/", async function(req, res) {
    await req.render("index")
})

console.log("server listen 8080")
app.use(router.routes());
app.listen(8080);