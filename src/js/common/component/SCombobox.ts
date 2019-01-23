import DM  from "@SDom/Dom/DomUnit";
import "@CommonCss/scombobox.scss";

type DomUinit = ReturnType< typeof DM>;

interface configFace {
	  "prompt":string;//提示
		"slideIcon":string;//收缩展开logo
		"data":any[];//数据
		"dropIcon":string;//下拉框选项的logo
		"textField":string;//文本字段
		"idField":string;//id 字段
		"validCombo":boolean;//是否验证 true:验证
		"dropFormatter":null|{(node:object):string};//下拉框选项的格式
		"multiply":boolean;//是否多选 true :多选
		"isAnimate":boolean;
		"clickCallback":Function|null;//点击后的回调函数
		"width":number | null;
		"MaxHeight":number; //下拉框的最大高度
		"textarea":boolean;//输入框的形式 input或是textarea true：textarea
		"dropArror":boolean;//下拉框的方向 true：向下 
};

interface combobox{
	box:DomUinit;
	config:configFace;
	init(defaultVal?:(string|number)[]):void;//初始化下拉框
	upInpType(type:boolean,box:DomUinit):void;//输入框的box
	renderDrop(defaultVal:(string|number)[]):string;//渲染下拉框的box
	updateInp($this:DomUinit):void;//更新下拉框的值
	setValue(vals:any[],$box:DomUinit):void;//设置下拉框值
	getVal(box:DomUinit):string|undefined;//获取下拉框值
	slideUp($box:DomUinit):void;//收缩下拉框
	slideDown($box:DomUinit):void;//展开下拉框
	handle():void;//组件的交互事件
};



/*
 *html结构示意图
<div class="s-comboBox  active" id="messageCombox" style="width: 420px;">
		<div class="combo-inp no-fill">
					
					<textarea class="s-textarea combo-text" placeholder="请选择..." readonly="readOnly"></textarea>
					<input type="hidden" class="s-inp combo-value" value="">
					<span class="slide-icon fa fa-chevron-down">
					</span>
				
		</div>
		<div class="combo-drop " style="display: block;">
				<ul class="drop-ul">
						<li class="drop-item " echo-id="34">
								<span class="fa fa-commenting"></span>
								<b class="item-txt">模板00</b>
						</li>
						<li class="drop-item " echo-id="37">
								<span class="fa fa-commenting"></span>
								<b class="item-txt">模板01</b>
					  </li>
					  ...
				</ul>
		</div>
</div>
 */


class SCombobox implements  combobox{ 
	private dur:number;
	box:DomUinit;
	config:configFace;
	/**
	 * [constructor description]
	 * @param {DomUinit}          el         [下拉框容器]
	 * @param {object}            config     [下拉框配置]
	 * @param {(string|number)[]} defaultVal [初始化时默认选择的值]
	 */
	constructor(el:DomUinit,config:object,defaultVal?:(string|number)[]){

		this.box = el ;
		this.config = Object.assign({
			"prompt":"请选择...",
			"slideIcon":"",
			"data":[],
			"dropIcon":"fa fa-circle",
			"textField":"text",
			"idField":"id",
			"validCombo":true,
			"dropFormatter":null,
			"multiply":false, // 注意要是使用dom的类名创建的实例，这个就被所有的实例共享了
			"isAnimate":true,		
			"clickCallback":null,
			"width":null,
			"MaxHeight":280,
			"textarea":false,
			"dropArror":true,
		},config); 


		this.dur = this.config.isAnimate ? 400 : 0 ;

		this.handle();
		this.init(defaultVal);
	}
  init(defaultVal?:(string|number)[]){
  	const has_wid = this.config.width;

  	has_wid && this.box.css({"width":has_wid+"px"});

  	const {validCombo,slideIcon,textarea,multiply,prompt} = this.config;

  	const has_valid = !defaultVal && validCombo ? "no-fill" : "" ;
  	const inputType = (multiply || textarea) ? `<textarea  class="s-textarea combo-text" placeholder="${prompt}" readOnly="readOnly"></textarea>` : `<input type="text" class="s-inp combo-text" placeholder="${prompt}" readOnly="readOnly"/>`;

  	const vals = defaultVal ? defaultVal.join(",") : "";

  	const htmlStr = `
							<div class="combo-inp ${has_valid}" >
									<span class="inp-box">
											${inputType}
											<input type="hidden" class="s-inp combo-value"  value="${vals}"/>
									</span>
									<span class="slide-icon ${slideIcon}">X</span>

							</div>
							<div class="combo-drop ">
								<ul class="drop-ul">
									${this.renderDrop(defaultVal)}
								</ul>
							</div>
  			`;


  	this.box.html(htmlStr);
  }
  upInpType(type:boolean,box:DomUinit = this.box):void{

  	const {multiply,prompt} = this.config ;

  	if(multiply === type){
  			return ;
  	};
  	  // 改变multiply
  	  this.config.multiply = type;

  	 // 更输入框的类型
  	 const inputType = type ? `<textarea  class="s-textarea combo-text" placeholder="${prompt}" readOnly="readOnly"></textarea>` : `<input type="text" class="s-inp combo-text" placeholder="${prompt}" readOnly="readOnly"/>`;
  	 box.find(".inp-box").html(inputType + `<input type="hidden" class="s-inp combo-value"  value=""/>`);
  	 // 清除选中的状态和保存以前选中的值的数组selArr

  	 box.find(".active").removeClass("active");

 		return ;

  }

  renderDrop(defaultVal:(string|number)[]=[]):string{

  	const selArr = defaultVal ;

  	const {dropIcon,data,idField,textField,dropFormatter} = this.config;

  	const strArr = data.map((val:{[propName:string]:any},index)=>{

  				const activeStatus = selArr.includes(val[idField]) ? "item-active" :"";
  				const text:string = dropFormatter ? dropFormatter(val) : val[textField];
  				return `
									<li class="drop-item ${activeStatus}" data-index="${index}">
											<b class="drop-icon ${dropIcon}"></b>
											<span class="drop-text">${text}</span>
									</li>
  							`;
  	});


  	return strArr.join("");
  
  }

  updateInp($this:DomUinit){

			const {idField,textField,multiply,clickCallback} = this.config ;
			const has_active = $this.hasClass("active");
			const box  = $this.closest(".s-comboBox");
			const valDom = box.find(".combo-value");

			let val = valDom.val();
      let	value =  val ? val.split(",") : [] ;

			let	text:string[]=[];
	    const oIndex = +$this.dataset("index")!;
			const curNode = this.config.data[oIndex];

			if(multiply){


				text = value.map((val)=>{
           	const node = this.config.data.find(node=>node[idField]===val);
							return node[textField]; 
					});
	
				if(has_active){
							$this.removeClass("active");
						const oIndex = value.findIndex(val=>{
									return val === curNode[idField];
						});

						value.splice(oIndex,1);
						text.splice(oIndex,1);

				}else{
						$this.addClass("active");
						value.push(curNode[idField]);
						text.push(curNode[textField]);
				}



			}else{

				if(has_active){
						return ;
				};
				box.find(".drop-ul li.active").removeClass("active");
				$this.addClass("active")
				 value[0] = curNode[idField];
				 text[0] = 	curNode[textField];

				 this.slideUp(box);
			};

	  	valDom.val(value.join(","));
	  	box.find(".combo-text").val(text.join(","));

	  	clickCallback && clickCallback(curNode,this.config.data,has_active);

  }

 	setValue(vals:any[],$box:DomUinit=this.box){

 		const {multiply , idField,textField} = this.config ; 

 		const value = multiply ? vals : vals.splice(0,1);
 		const oIndexArr:number[] = [];
 		const text = value.map((val)=>{
 			const node = this.config.data.find((node,index)=>{
 				
 				const has = node[idField]===val ;
 				has &&  oIndexArr.push(index);
 				return has;
 			});
 			return node ? node[textField] : val ;
 		}) ;

 		$box.find(".combo-value").val(value.join(","));
	  $box.find(".combo-text").val(text.join(","));

	  //设置 x下拉框的选中状态

		const dropItems = $box.find(".drop-item");
	  $box.find(".active").removeClass("active");
	  oIndexArr.forEach(val=>{
	  		dropItems.eq(val).addClass("active");
	  });
 	} 

 	getVal(box:DomUinit){

 		const valDom = box.find(".combo-value");
 		return valDom.val();

 	};

 	slideUp($box:DomUinit){

		const dur = this.dur;

   $box.find(".combo-drop").velocity("slideUp",{duration:dur,complete:function(){
					$box.removeClass("active");
		}});
      
 	}
 	slideDown($box:DomUinit){
 		$box.addClass("active");
		const dur = this.dur;
    $box.find(".combo-drop").velocity("slideDown",{duration:dur});
 	}
 
	handle(){

			const _self = this;

			this.box.on("click",".combo-inp",function(){
					const $this = DM(this);
					const box = $this.closest(".s-comboBox");
					box.hasClass("active") ? _self.slideUp(box): _self.slideDown(box);	
			});

			this.box.on("click",".drop-item",function(){

					const $this = DM(this);
					_self.updateInp($this);

				
				
			});
	}
};


function Test(){

		const box = document.createElement("div");

				box.innerHTML = `
				<div id="scombobox-opt">
						<button id="multiply_toggle" class="optBtn" >多选/单选切换</button>
						<button id="setValue" class="optBtn" >设置id1，4</button>
						<button id="addCombobox" class="optBtn" >增加一个相同配置的下拉框</button>
						<button id="getVal" class="optBtn" >获取下拉框值</button>
				</div>
				<div id="g-combo">
						<div id="test" class="s-comboBox"></div>;
				</div>`;
				

				document.body.appendChild(box);

			

				 let test = new SCombobox(DM("#test"),{
					data:[
						{id:"1",text:"sekin1"},
						{id:"2",text:"sekin2"},
						{id:"3",text:"sekin3"},
						{id:"4",text:"sekin4"},
						{id:"5",text:"sekin5"},
						{id:"6",text:"sekin6"},
					],
					isAnimate:true,
					multiply:true,
				});

			 	DM("#scombobox-opt").on("click",".optBtn",function(){

			 			const id = this.id ;


			 		  switch (id) {
			 		  	case "multiply_toggle":
			 		  		test.upInpType(!test.config.multiply);
			 		  		break;
			 		  	case "setValue":
			 		  		test.setValue(["1","4"]);
			 		  		break;
		 		  		case "getVal":
			 		  		alert(test.getVal(test.box));
			 		  		break;
		 		  		case "addCombobox":{
		 		  				const str = Array.from({length:20},(val,oIndex)=>{
		 		  					console.log(val,oIndex)
		 		  					return `<div id="test${oIndex}" class="s-comboBox"></div>`;
		 		  				});

		 		  				DM("#g-combo").html(str.join(""));

		 		  					new SCombobox(DM(".s-comboBox"),{
											data:[
												{id:"1",text:"sekin1"},
												{id:"2",text:"sekin2"},
												{id:"3",text:"sekin3"},
												{id:"4",text:"sekin4"},
												{id:"5",text:"sekin5"},
												{id:"6",text:"sekin6"},
											],
									  	multiply:true,
							});
		 		  					 test = null as any;



		 		  		}
			 		  		break;
			 		  	default:
			 		  		// code...
			 		  		break;
			 		  }

	 						
			 	});

}


Test();



export default SCombobox;