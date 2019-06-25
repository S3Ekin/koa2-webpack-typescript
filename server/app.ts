import * as koa from "koa" ;
import * as koaStatic from "koa-static";
import * as path from "path";
import * as  Router from "koa-router";

const app = new koa();



const home = new Router();

home.get("/asd",async (ctx)=>{


  ctx.body="48"
});

const statics = koaStatic(path.resolve("./","public"));
app.use(statics);
app.use(home.routes()).use(home.allowedMethods());




 

// 路由中间件
// const page = new Router();


// page.get("/about",ctx=>{

//     ctx.body = {about:"about"}
  
// });

// const base = new Router();


// base.use("/",page.routes(),page.allowedMethods());

// app.use(base.routes()).use(base.allowedMethods())


// const statics = koaStatic(path.resolve("./","public"));
// app.use(statics);

export default app ;