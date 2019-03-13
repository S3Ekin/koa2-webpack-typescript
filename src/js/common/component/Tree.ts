import DM  from "@SDom/Dom/DomUnit";
import "@CommonCss/Tree.scss";
type DomUinit = ReturnType< typeof DM>;

type anyObj = {
	[key:string]:any;
}

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
			"checkCallback":Function|null;//选中的回调函数
			"width":number | string;
			"maxHeight":number; //下拉框的最大高度
			"searchInp":boolean;//inp搜索
			"searchFile":string[];//搜索的字段
			"judgeRelation":Function;
};

interface tree {
	 box:DomUinit;
	 config:treeConfig;
	 selArr:any[];
	 init(defaultArr:(string|number)[]):void;
	 initSelArr(defaultArr:(string|number)[]):void;
	 reloadTree($box:DomUinit,dropUlstr:string):void;
	 selDefault(defaultArr:any[],$box:DomUinit):void;
	 getOption():treeConfig;
	 renderSearchInp():string;
	 findNodeById(id:string):anyObj |undefined;
	 search($btn:DomUinit):void;
	 renderTreeInit(keyWord:string):string; 
	 renderPar(obj:any,node:any,childrenArr:any[],lev:number):string;
	 renderChild(obj:any,node:any,lev:number):string;
	 setHasCheck(parItem:DomUinit):void;
	 upDateSelArr(gCheckBox:DomUinit):void;
	 cascsdeCheckbox(checkbox:DomUinit,checkStatus:boolean):void;
	 slecteNode($this:DomUinit):void;
	 handle():void;
};



class Tree implements tree {
	box:DomUinit;
	config:treeConfig;
	selArr:any[];
	constructor(el:DomUinit,config:object,defaultArr?:(string|number)[]) {

		this.box = el;
		this.config = Object.assign({
			"data":[],//数据
			"dropParIcon":"icon icon-folder-minus",//目录选项的logo
			"dropChildIcon":"icon icon-calendar",//文件选项的logo
			"textField":"text",//文本字段
			"idField":"id",//id 字段
			"childField":"children",//children 字段
			"dropFormatter":null,//下拉框选项的格式
			"checkbox":false,//是否多选 true :多选
			"isAnimate":true,
			"clickCallback":null,//点击后的回调函数
			"checkCallback":null,
			"width":"auto",
			"maxHeight":280, //下拉框的最大高度
			"searchInp":true,
			"searchFile":["id"],
			"judgeRelation":function(val:any){
				
					return val[this.childField] ? val[this.childField].length > 0 : false;
			}
		},config);
		this.selArr = [];
		this.initSelArr(defaultArr);
		this.handle();
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
	init(defaultArr:(string|number)[]=[]){
		const {width,maxHeight} = this.config;
		const  tree = `<ul class="m-tree par-menu" style="width:${width};max-height:${maxHeight}px">${this.renderTreeInit()}</ul>`;
		const searchStr = this.renderSearchInp();
		this.box.html(searchStr+tree);

	  defaultArr.length && this.selDefault(defaultArr,this.box);
	  
	}

	initSelArr(defaultArr:(string|number)[]=[]){
			this.box.dom.forEach((val:HTMLElement,index:number)=>{
					val.dataset.index = index+"";
					this.selArr[index] = defaultArr ;
			});
	}

	reloadTree($box:DomUinit,dropUlstr:string){

			const index = <string>$box.dataset("index");
      $box.children(".m-tree").html(dropUlstr);

       this.selDefault(this.selArr[+index],$box);

	}
	selDefault(defaultArr:any[],$box:DomUinit){//有初始值,只负责改变checkbox的状态，不改变任何对象的值包括默认选中的数组selArr



		defaultArr.forEach((val:(number | string))=>{

				const item =	$box.find(`.treeItem[data-id='${val}'] .m-checkbox`);

				 item.dom.forEach((checkbox:HTMLElement)=>{

				 	//	checkbox.click(); //有些问题 在搜索后在选中默认的会有点击两次的重复
				 	DM(checkbox).children(".tree-inp").checked(true);
				 	this.cascsdeCheckbox(DM(checkbox),true)

				 })

		});
	}
	getOption(){

		return this.config;
	}
	renderSearchInp():string{
     
			return 	`
				<div class="g-tree-search">
					<label class="m-inp">
							<input type="text" class="s-inp search-inp" placeholder="搜索...">
							<span class="j-search-close">
								<i class="icon icon-close"></i> 
							</span>
					</label>
					<button class="s-btn j-search"><i class="icon icon-plus-square"></i></button>
			 </div>
			`;

	};

	findNodeById(id:string){
		const {data,idField,childField} = this.config;
	
		let node:anyObj | undefined;

		let fn = function(arr:any[]):any{
			
						return arr.find((val:anyObj)=>{

								const children = val[childField];
								const status = val[idField] == id ;
								if(status){
										node = val ;
								}
								
								if( children && children.length){

									return status || fn(children); // 要是目录匹配就不找了，否则继续递归找

								}else{

									return status
								}
							
						});
		}

		fn(data);
		return node ;
	
	}

	search($btn:DomUinit){
		const $box = $btn.closest(".g-tree");
		const keyWord = (<string>$box.find(".search-inp").val()).trim();
		if(keyWord){
			let str = this.renderTreeInit(keyWord);
			 		str = str ? str : "<li>没有搜索到任何结果！</li>";
					this.reloadTree($box,str);
		}
	

	}

	renderTreeInit(keyWord:string=""):string{
	
	 

    const {textField,idField,childField,checkbox,data,dropChildIcon,dropParIcon,dropFormatter} = this.config;

    let commonObj = {
    			id:idField,
    			text:textField,
    			checkbox,
    			dropFormatter,
    };

    const parObj = Object.assign({},commonObj,{
    	icon:dropParIcon,
    	child:childField,
    });

    const childObj = Object.assign({},commonObj,{
    	icon:dropChildIcon
    });



    const funmap = (_data:any,lev:number=-1)=>{
 				
 				lev++;
		 	
		 		return _data.reduce((total:any[],node:any)=>{

		    	const children = node[childField];
		    	const text = <string>node[textField];
		    	const type = this.config.judgeRelation(node);

		    	if(type){
			    	
			    	 const childrenArr = children && children.length ? funmap(children,lev) : [];
			    	 
		   			 keyWord ? ( childrenArr.length && total.push(this.renderPar(parObj,node,childrenArr,lev))): total.push(this.renderPar(parObj,node,childrenArr,lev));

		    	}else{
		    		keyWord ? (text.includes(keyWord) && total.push(this.renderChild(childObj,node,lev)) ): total.push(this.renderChild(childObj,node,lev));
		    	}

		    	return total ;
		    },[]);
    };
    const str = funmap(data);
    return str.join("") ;
	}

	
  /**
   * [renderTreeInit description]
   * @param {(string|number)[] = []} defaultArr [description]
   * html 结构
	    <ul class="m-tree">
				<li data-lev="3" class="tree-li">
					<div class="menuItem par-item" data-id="206">
						<span class="indent"></span><span class="indent"></span><span class="indent"></span>
						<span class="m-checkbox">
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
	
	renderPar(obj:any,node:any,childrenArr:any[],lev:number){

		const {id,text,checkbox,icon,dropFormatter} = obj;

		// 层级缩进
		const indent = Array.from({length:lev},()=>`<span class="tree-indent"></span>`);
		//选择框
    const checkboxStr = checkbox ? `<span class="m-checkbox">
							<input type="checkbox" class="par-checkinp tree-inp" value="${node[id]}"><label class="fa fa-square-o"></label>
						</span>` : "";

		const childStr = childrenArr.join("") ;

		return `
				<li><div class="treeItem par-item" data-id="${node[id]}" data-lev="${lev}">
					  ${indent.join("")}
						${checkboxStr}
						<i class="${icon}  j-slide-icon"></i>
						<span class="item-txt"> ${dropFormatter ? dropFormatter(node): node[text]}</span>
				</div>
				${childStr ? `<ul class="par-menu">${childStr}</ul>`:""}
				</li>
		`;
	}
	renderChild(obj:any,node:any,lev:number){

		const {id,text,checkbox,icon,dropFormatter} = obj;

		// 层级缩进
		const indent = Array.from({length:lev},()=>`<span class="tree-indent"></span>`);
		//选择框
    const checkboxStr = checkbox ? `<span class="m-checkbox">
							<input type="checkbox" class="child-checkinp tree-inp" value="${node[id]}"><label class="fa fa-square-o"></label>
						</span>` : "";

		return `
				<li><div class="treeItem children-item" data-id="${node[id]}" data-lev="${lev}">
					  ${indent.join("")}
						${checkboxStr}
						<i class="${icon}"></i>
						<span class="item-txt"> ${dropFormatter ? dropFormatter(node): node[text]}</span>
				</div></li>
		`;
	}

	setHasCheck(parItem:DomUinit){

		let par = parItem;
		while(par.dom.length){
				const inpEl =  par.find(".tree-inp");
				(<HTMLInputElement>inpEl.dom[0]).checked = false;	
				inpEl.siblings().addClass("has-check");
				par = par.closest(".par-menu").siblings(".par-item");
		}
	}

	upDateSelArr(gCheckBox:DomUinit){


		
	
		 const inp = gCheckBox.children(".tree-inp");
		 const hasPar = inp.hasClass("par-checkinp");
		 const boxIndex = <string>gCheckBox.closest(".g-tree").dataset("index");
		 const val = inp.val();

		 		const selArr = <any[]>this.selArr[+boxIndex];

					if(inp.checked()){

							if(!hasPar){
								selArr.push(val);
							}else{
								const setArr = new Set(selArr);
								gCheckBox.parent().siblings(".par-menu").find(".child-checkinp").dom.map((val:HTMLInputElement)=>setArr.add(val.value));
								this.selArr[+boxIndex] = [...setArr];
							}
				
					}else{

							if(!hasPar){
								const targetOindex = selArr.findIndex((_val:string)=>_val===val);
								selArr.splice(targetOindex,1);

							}else{

								const childArr = gCheckBox.parent().siblings(".par-menu").find(".child-checkinp").dom.map((val:HTMLInputElement)=>val.value);

									this.selArr[+boxIndex] = this.selArr[+boxIndex].filter((_val:string)=>!childArr.includes(_val));
							}
							
					}

	}
	//级联的checkbox
	cascsdeCheckbox(gCheckbox:DomUinit,checkStatus:boolean){

		const {checkCallback} = this.config;
		const inpEl  = gCheckbox.children(".tree-inp");
		const is_par = inpEl.hasClass("par-checkinp");
	
	  let parItem = gCheckbox.parent();

	 
	 if(is_par){
	 		const listUl = parItem.siblings(".par-menu");
			listUl.find(".tree-inp").checked(checkStatus);
			inpEl.siblings().removeClass("has-check");
			listUl.find(".has-check").removeClass("has-check")
	
		}

	
	 	let  listUL = parItem.closest(".par-menu");
				parItem = listUL.siblings(".par-item");
		while(parItem.dom.length){
			 const $curInpEl = parItem.find(".tree-inp");
						 const curInpEl = <HTMLInputElement>$curInpEl.dom[0];

						 const allChildInp =  listUL.find(".tree-inp");
						 const allChildInpChecked = listUL.find(".tree-inp:checked");
						
						 const val = allChildInp.dom.length - allChildInpChecked.dom.length ;
						 
						 if(val === 0){ // 全选

						 		curInpEl.checked = true ;
						 		$curInpEl.siblings().removeClass("has-check");

						 }else if(val === allChildInp.dom.length ){ //没选一个

						    curInpEl.checked = false ;
						    $curInpEl.siblings().removeClass("has-check");

						 }else{ //  选了部分

					 			this.setHasCheck(parItem);
						 		break ;
						 }

							listUL = parItem.closest(".par-menu");
							parItem = listUL.siblings(".par-item");

		};

		if(checkCallback){
			const node = this.findNodeById(<string>inpEl.val())
			checkCallback(node);
		}

	}
	slecteNode($this:DomUinit){

		 const type = $this.hasClass("par-item");
		 const $box = $this.closest(".m-tree");
		 const {clickCallback,checkbox} = this.config;
		 const inp = $this.find(".tree-inp") ;
		

		 if(!type && !checkbox){
		 	  $box.find(".node-select").removeClass("node-select");
		 		$this.addClass("node-select");
		 }

		 if(clickCallback){
			 const id = <string>inp.val();
			 const node = this.findNodeById(id);
			 clickCallback(node,checkbox);
		}

	}
	handle(){

		const _self = this ;
		// 收缩子内容
		this.box.on("click",".j-slide-icon",function(){
				const $this = DM(this);
				const parEl = $this.closest(".par-item");
			
			const status = parEl.hasClass("menu-hide") ? "slideDown" : "slideUp";
				
			 parEl.siblings(".par-menu").velocity(status,{duration:300,complete:function(){
						if(status === "slideDown"){
							parEl.removeClass("menu-hide");
						}else{
							parEl.addClass("menu-hide");
						}
			}});
		});

		//点击checkbox
		this.box.on("click",".m-checkbox",function(e:Event){
			e.stopPropagation();
			const $this = DM(this);
			const checkStatus = $this.children(".tree-inp").checked() as boolean;
		  _self.cascsdeCheckbox($this,checkStatus); 
		  _self.upDateSelArr($this);

		});

		//点击 item
		this.box.on("click",".treeItem",function(){
			const $this = DM(this);
			_self.slecteNode($this);
		});

		//搜索
		this.box.on("click",".j-search",function(){
				const $this = DM(this);
				if(!$this.siblings(".m-inp").children(".search-inp").val()){
					return ;
				}
				_self.search($this);
				$this.siblings(".m-inp").children(".j-search-close").show();

		});

		this.box.on("click",".j-search-close",function(){

					const $this = DM(this);
					 $this.hide();
					 $this.siblings(".search-inp").val("");
					 const $box = $this.closest(".g-tree");
					_self.reloadTree($box,_self.renderTreeInit());


		});

	}
}

function Test(){

  let testData:any[] = [
  	{
  		text:"节点",
  		id:1,
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

  let leg =  5;

  let temp:any = testData[0];

  let id = 1 ;

  do{

  	//let {id} = temp;

  	id+=2 ;

    temp.children = [{id:id,text:`节点层级${id}`},{id:id + 1,text:`节点层级${id+1}`}];
  	
    temp = temp.children[0];
    leg -- ;

  }while(leg>0);

  const treeDom = document.createElement("div");
  			treeDom.innerHTML = `<button id="tail-call">尾调用</button><button id="tail-bounce">尾调用优化</button><div id="tree-test" class="g-tree"></div><div id="tree-test2" class="g-tree"></div>`;
  			document.body.appendChild(treeDom);

  			DM(".g-tree").css({
  				width:"300px",
  				margin:"auto",
  				border:"1px solid red",
  			});

  			const a = window as any;
  			
			  	a.gTree =  new Tree(DM(".g-tree"),{
			  	data:testData,
			  	checkbox:true,
			  
			  	checkCallback:function(node:any){
			  		console.log(node,"check")
			  	},
			  	
			  },["11"]);

  			/*DM("#tree-test").css({
  				width:"300px",
  				margin:"auto",
  				border:"1px solid red"
  			});


			  new Tree(DM("#tree-test"),{
			  	data:testData,
			  	checkbox:true,
			  	checkCallback:function(node:any){
			  		console.log(node,"check")
			  	},
			  	
			  });*/

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