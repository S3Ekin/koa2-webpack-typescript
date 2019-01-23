import {EventDom,userCache} from "./Event";
import {animate} from "velocity-animate";

	interface SDom {

			dom:HTMLElement[];
			init(selector:string):this;
			addClass(className:string | string[]):this;
			toggleClass(className:string):this;
			removeClass(className:string | string[]):this;
			html(htmlStr:string):this;
			hasClass(className:string):boolean;
			remove():void;
			on(type:string,selector:string|Function,fn?:Function):void;
			off(type?:string,selector?:string|Function,fn?:Function):void;
			addOriginEvent(type:string,fn:Function):void;
			find(selector:string):DomUinit;
			closest(str:string|null):DomUinit;
			show():this;
			hide():this;
			toggleShow():this;
			attr(prop:string):string|null;
			val(value?:string):string|undefined;
			eq(oindex:number):DomUinit;
			dataset(key:string):string | undefined;
			velocity(props:Object,options:Object):any;
}



interface UnitFace{

	judgeIdOrClassName(selector:string):boolean;
	getDomSelectorMethod(selectorType:boolean):Function;

};

class Unit  implements UnitFace{

	judgeIdOrClassName(selector:string){

		const res = /^\./.test(selector);

		return res ;

	}
	getDomSelectorMethod(selectorType:boolean){

		if(selectorType){
					return function(dom:HTMLElement){
											return Array.from(dom.classList);
					}
		}else{
				return function(dom:HTMLElement){
									return [dom.id];
				}
		}
	}

	showEle(val:HTMLElement){

			 let display = val.style.display ;
			
				 if(display === "none"){ //先考虑行内样式
				 	
				 		const cachesys = userCache;
				 		display = cachesys.cache(val).display || "";
				 		val.style.display = display ;
				
				 }else if(display === ""){ //是css声明样式

				 		const _display = this.getStyle(val,"display");
					 	if(_display === "none"){ 
					 				val.style.display = "block" ;
					 	}
				 }
	}

	hideEle(val:HTMLElement){

		 let display = val.style.display ;
			
				 if( display && display !== "none" ){ //先考虑行内样式
				 	
				 		const cachesys = userCache;
				 		cachesys.cache(val).display = display; // 在该元素上缓存以前的display值
				 		val.style.display = "none" ;
				
				 }else if(display === ""){ //是css声明样式

				 		const _display = this.getStyle(val,"display");
					 	if(_display !== "none"){ 
					 				val.style.display = "none" ;
					 	}
				 }

	}

	getStyle(ele:HTMLElement,prop:string,pseudoElt?:string):string{

			const style = ele.style as {[propName:string]:any};
			let value ;
			if(value = style[prop]){
					return value;
			};

			value = window.getComputedStyle(ele,pseudoElt).getPropertyValue(prop);

			return value ;

	 }
	

};

const selfUnit = new Unit();

class DomUinit extends EventDom implements SDom{

	  dom:HTMLElement[];

	  constructor(doms:HTMLElement[]=[]){
	  	super();
	  	this.dom = doms;
	  }

		init(selector:string|HTMLElement):this{

			if(typeof selector === "string"){
					const dom = document.querySelectorAll(selector) as any;
					this.dom = Array.from(dom);
			}else{
				this.dom = [selector];
			}
		
			return this;
		}

		removeClass(className:string | string[]){
				if(Array.isArray(className)){

					this.dom.forEach((val:HTMLElement)=>{
						val.classList.remove(className.join(","));
					});
				}else{
					this.dom.forEach((val:HTMLElement)=>{

						val.classList.remove(className);
					})
				}	
				return this;
		}
		toggleClass(className:string){

			this.dom.forEach((val:HTMLElement)=>{
					const has = val.classList.contains(className);
					has ? val.classList.remove(className) : val.classList.add(className);
			});

			return this;
		}
		addClass(className:string | string[]){

			if(Array.isArray(className)){

				this.dom.forEach((val:HTMLElement)=>{
					val.classList.add(className.join(","));
				});
			}else{
				this.dom.forEach((val:HTMLElement)=>{

					val.classList.add(className);
				})
			}	
			return this;
		}

		html(stings:string){
			this.dom.forEach((val:HTMLElement)=>{
					val.innerHTML = stings;
			});
			return this;
		}

		hasClass(str:string){
			if(!this.dom[0]){
				return false;
			}
			const dom = this.dom[0] as HTMLElement ;
			const res = dom.classList.contains(str);
			return res;
		}

		on(type:string,selector:string|Function,fn?:Function){

				let slect:any ,func:any ;
				if(typeof selector === "string"){

						slect = selector ; 
						func = fn ;

				}else{

					  slect = undefined;
					  func = selector;
				}


				this.dom.forEach((val:HTMLElement)=>{
						this.addEvent(val,type,func,slect);
				})
		}

		off(type?:string,selector?:string|Function,fn?:Function){

			let slect:any ,func:any ;
				if(typeof selector === "string"){

						slect = selector ; 
						func = fn ;

				}else if(typeof selector === "function"){

					  slect = undefined;
					  func = selector;
				}else{
					  slect = undefined;
					  func = undefined;
				}

				this.dom.forEach((val:HTMLElement)=>{
						this.removeEvent(val,type,func,slect);
				})
		}

		addOriginEvent(type:string,fn:Function){

			const fc = function(e:MouseEvent){
						fn.call(this,e);
			}
			this.dom.forEach((element:HTMLElement)=>{
						element.addEventListener(type,fc);
			});

		}

		remove(){
			this.dom.forEach((node:HTMLElement)=>{
					if(node.parentNode){
						node.parentNode.removeChild(node);
					}
			});
		}
		find(selector:string):DomUinit{

			const resDom :Set<any> = new Set();
		  this.dom.forEach((node:HTMLElement)=>{
				  const arr =Array.from(node.querySelectorAll(selector));
				  arr.forEach((val:HTMLElement)=>{
				  		resDom.add(val);		
				  })
			});
			return new DomUinit([...resDom]);
		}
		show(){
			this.dom.forEach((val:HTMLElement)=>{

				selfUnit.showEle(val);

			});

			return this;
		}
		hide(){
			this.dom.forEach((val:HTMLElement)=>{

					selfUnit.hideEle(val);

			});

			return this;
		}
		toggleShow(){
			this.dom.forEach((val:HTMLElement)=>{
					let status = selfUnit.getStyle(val,"display");
				 		 status === "none" ? selfUnit.showEle(val)  : selfUnit.hideEle(val) ;
			});
			return this;
		}
		closest(str:string|null):DomUinit{

			let newDom:HTMLElement[]=[];
			const dom = this.dom[0];

			if(dom){
					if(!str){ //直接父级

					  const parent = dom.parentElement!;
					  newDom = [parent];
					
					}else{ 

						const selectorType = selfUnit.judgeIdOrClassName(str);
						const getDomSelectorMethod = selfUnit.getDomSelectorMethod(selectorType);
						let  parSign:string[] =[];

						let target = dom;
						const name = str.substr(1);

						let is_body = false ;
						let is_targetSelector = false;

						while(!is_body && !is_targetSelector){
							
							 target = target.parentElement! ;
							 parSign = getDomSelectorMethod(target); 
							 is_targetSelector = parSign.includes(name);

							 if(is_targetSelector){
							 		newDom = [target];
							 		is_targetSelector = true ;
						
							 }else if(target.nodeName === "BODY"){
									is_body = true ;
							 		newDom = [];
							 }
						}

					}
			}
			return new DomUinit(newDom) ;
		}
		css(style:{[propName:string]:string}){


			this.dom.forEach((val:HTMLElement)=>{

					let cssText:string = val.style.cssText;

					for(let item in style){
							cssText += style[item];
					}

					val.style.cssText = cssText ;

			});
		}

		siblings(selctor?:string):DomUinit{

			const dom = this.dom[0];
			const domPar = dom.parentElement!;
			let newDom:HTMLElement[] = [];

			if(!dom){
				return new DomUinit();
			};

			if(selctor){

				newDom = domPar.querySelectorAll(selctor) as any;
			
			}else{

				newDom = <HTMLElement[]>Array.from(domPar.children).filter((val:HTMLElement)=>{
					return val !== dom ;
				});

			}

			return new DomUinit(newDom);

		}

		getEleStyle(ele:HTMLElement,prop:string,pseudoElt?:string):string{
			return selfUnit.getStyle(ele,prop,pseudoElt) ;
	  }
	  val(value?:string){

	  	if(value){
				
				this.dom.forEach((val:HTMLInputElement)=>{
		  			val.value = value;
		  	}); 
	  
	  	}else{
	  			const inpDom = <HTMLInputElement>this.dom[0];
	  			return inpDom && inpDom.value;
	  	}
	  }
	  attr(prop:string):string|null{

	  	const dom = this.dom[0];
	  	let value:string|null = "";

	  	if(dom){
	  		value = dom.getAttribute(prop);
	  	}

	  	return value;
	  }
	  eq(oindex:number):DomUinit{

	  	const dom = this.dom[oindex];
	  	return dom ? new DomUinit([dom]) : new DomUinit();
	  	
	  }
	  dataset(key:string){


	  	return this.dom[0] &&  this.dom[0].dataset[key] ; 

	  }
	  velocity(props={},options={}){
	  	 const doms = <any>this.dom;
	  	 return animate(doms,props,options);
	  };

}


const DM = (function(DomUinit){

			DomUinit.prototype.init.prototype = DomUinit.prototype;
			DomUinit.prototype.init.constructor = DomUinit;
			
			return function (selector:string|HTMLElement):DomUinit{
					return new DomUinit().init(selector);
			}

})(DomUinit);  


export default DM;

