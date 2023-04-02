import axios from 'axios';
import Koa from 'koa';
import Router from 'koa-router'; // 引入koa-router
const app = new Koa();
const router = new Router(); // 创建路由，支持传递参数

router.get('/check-url-is-available', async (ctx) => {
    const {url} = ctx.query
    console.log(url)
    let data = false;
    try{
        const respData = await axios.get(url)
        if(respData.status=== 200) {
            data = true
        }
    }catch(e) {
        console.log(e)
    }
    ctx.type = 'json';
    ctx.body = '{"data":'+data+'}';
})

app.use(router.routes());
app.listen(3000);