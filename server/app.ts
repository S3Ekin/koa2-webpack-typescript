import * as koa from "koa" ;
import * as koaStatic from "koa-static";
import * as path from "path";

const app = new koa();

const mian = koaStatic(path.resolve("./","public"));

app.use(mian);




export default app ;