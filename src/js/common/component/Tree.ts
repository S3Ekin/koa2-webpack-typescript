import DM  from "@SDom/Dom/DomUnit";
import "@CommonCss/Tree.scss";
type DomUinit = ReturnType< typeof DM>;

interface treeConfig {
			"data":any[];//数据
			"dropParIcon":string;//目录选项的logo
			"dropChildIcon":string;//文件选项的logo
			"textField":string;//文本字段
			"idField":string;//id 字段
			"childField":string;//children 字段
			"dropFormatter":null|{(node:object):string};//下拉框选项的格式
			"checkbox":boolean;//是否多选 true :多选
			"isAnimate":boolean;
			"clickCallback":Function|null;//点击后的回调函数
			"width":number | null;
			"MaxHeight":number; //下拉框的最大高度
			"searchInp":boolean;//inp搜索
			"searchFile":string[];//搜索的字段
};

interface tree {
	 box:DomUinit;
	 config:treeConfig;
	 renderTreeInit(defaultSel:(string|number)[]):void; 
	 handle():void;
};



class Tree implements tree {
	box:DomUinit;
	config:treeConfig;
	constructor(el:DomUinit,config:object,defaultArr:(string|number)[] = []) {

		this.box = el;
		this.config = Object.assign({
			"data":[],//数据
			"dropParIcon":"icon icon-folder-minus",//目录选项的logo
			"dropChildIcon":"",//文件选项的logo
			"textField":"text",//文本字段
			"idField":"id",//id 字段
			"childField":"children",//children 字段
			"dropFormatter":null,//下拉框选项的格式
			"checkbox":false,//是否多选 true :多选
			"isAnimate":true,
			"clickCallback":null,//点击后的回调函数
			"width":null,
			"MaxHeight":280, //下拉框的最大高度
			"searchInp":true,
			"searchFile":["id"],
		},config);
		this.init(defaultArr);
		
	}
	/**
	 * [renderSearchInp description]
	 * html 结构
	 * <div class="g-tree-search">
				<label class="m-inp">
						<input type="text" class="s-inp" placeholder="搜索...">
						<span class="j-search-close">
							<i class="fa fa-times"></i> 
						</span>
				</label>
				<button class="s-btn j-search"><i class="fa fa-search-plus"></i></button>
		 </div>
	 */
	init(defaultArr:(string|number)[] = []){

		const  tree = this.renderTreeInit(defaultArr);
		const searchStr = this.renderSearchInp();

		this.box.html(searchStr+tree);
	}
	renderSearchInp():string{
     
			return 	`
				<div class="g-tree-search">
					<label class="m-inp">
							<input type="text" class="s-inp" placeholder="搜索...">
							<span class="j-search-close">
								<i class="fa fa-times"></i> 
							</span>
					</label>
					<button class="s-btn j-search"><i class="fa fa-search-plus"></i></button>
			 </div>
			`;

	}
  /**
   * [renderTreeInit description]
   * @param {(string|number)[] = []} defaultArr [description]
   * html 结构
	    <ul class="m-tree">
				<li data-lev="3" class="tree-li">
					<div class="menuItem par-item" data-id="206">
						<span class="indent"></span><span class="indent"></span><span class="indent"></span>
						<span class="s-checkbox">
							<input type="checkbox" class="par-checkinp tree-inp" value="206"><label class="fa fa-square-o"></label>
						</span>
						<i class="fa fa-folder-open-o"></i>
						<span class="item-txt">耳鼻咽喉科</span>
						<span class="tree-slide-icon"><i class="fa fa-minus-square-o"></i></span>
					</div>
					<ul class="par-menu">
						...
					</ul>
				<li>
			</ul>
	 * 
   */
	renderTreeInit(defaultArr:(string|number)[] = []):string{
	
	 
    defaultArr;
    const {textField,idField,childField,checkbox,data,dropChildIcon,dropParIcon} = this.config;

    let commonObj = {
    			id:idField,
    			text:textField,
    			checkbox,

    };

    const parObj = Object.assign(commonObj,{
    	icon:dropParIcon,
    	child:childField,
    });

    const childObj = Object.assign(commonObj,{
    	icon:dropChildIcon
    });

    const funmap = (_data:any,lev:number=0)=>{
 				lev++;
		 		return _data.map((node:any)=>{

		    	const children = node[childField];
          
		    	if(children){

		    		const childrenArr = funmap(children,lev);

		    		return this.renderPar(parObj,node,childrenArr,lev);

		    	}else{
		    		return this.renderChild(childObj,node,lev);
		    	}

		    });
    };
    const str = funmap(data);
    return `<ul class="m-tree">${str.join("")}</ul>`;
	}

	renderPar(obj:any,node:any,childrenArr:any[],lev:number){

		const {id,text,checkbox,icon} = obj;

		// 层级缩进
		const indent = Array.from({length:lev},()=>`<span class="tree-indent"></span>`);
		//选择框
    const checkboxStr = checkbox ? `<span class="s-checkbox">
							<input type="checkbox" class="par-checkinp tree-inp" value="${node[id]}"><label class="fa fa-square-o"></label>
						</span>` : "";

		return `
				<div class="treeItem children-item" data-id="${id}" data-lev="${lev}">
					  ${indent.join("")}
						${checkboxStr}
						<i class="${icon}"></i>
						<span class="item-txt"> ${node[text]}</span>
				</div>
				<ul class="par-menu">
						${childrenArr.join("")}
				</ul>
		`;


	}
	renderChild(obj:any,node:any,lev:number){

		const {id,text,checkbox,icon} = obj;

		// 层级缩进
		const indent = Array.from({length:lev},()=>`<span class="tree-indent"></span>`);
		//选择框
    const checkboxStr = checkbox ? `<span class="s-checkbox">
							<input type="checkbox" class="par-checkinp tree-inp" value="${node[id]}"><label class="fa fa-square-o"></label>
						</span>` : "";

		return `
				<div class="treeItem children-item" data-id="${node[id]}" data-lev="${lev}">
					  ${indent.join("")}
						${checkboxStr}
						<i class="${icon}"></i>
						<span class="item-txt"> ${node[text]}</span>
				</div>
		`;

	}

	handle(){

	}
}

function Test(){






  let testData:any[] = [
  	{
  		text:"节点",
  		id:1
  	},
  	{
  		text:"兄弟节点1",
  		id:-1,
  		children:[
	  		{
	  			text:"兄弟节点1",
	  			id:-3,
	  		},
	  		{
	  			text:"兄弟节点1",
	  			id:-4,
	  		},
  		]
  	},
  	{
  		text:"兄弟节点2",
  		id:-2
  	}
  ];

  let leg = 30 ;

  let temp:any = testData[0];

  do{

  	let {id} = temp;

    temp.children = [{id:++id,text:`节点层级${id}`}];
  	
    temp = temp.children[0];
    leg -- ;

  }while(leg>0);

  console.log(testData);

  const treeDom = document.createElement("div");
  			treeDom.innerHTML = `<button id="tail-call">尾调用</button><button id="tail-bounce">尾调用优化</button><div id="tree-test"></div>`;
  			document.body.appendChild(treeDom);



  new Tree(DM("#tree-test"),{
  	data:testData,
  });

  DM("#tail-call").on("click",function(){

  	console.log(Fibonacci(44));
  });

  DM("#tail-bounce").on("click",function(){

  	console.log(Fibonacci2(100));

  });

}

Test();


function Fibonacci (n:number):number {
  if ( n <= 1 ) {return 1};

  return Fibonacci(n - 1) + Fibonacci(n - 2);
}


function Fibonacci2 (n:number , ac1 = 1 , ac2 = 1):any {
  if( n <= 1 ) {return ac2};
  return Fibonacci2 (n - 1, ac2, ac1 + ac2);
;
}

export default Tree ;