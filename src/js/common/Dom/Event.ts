
const verison = "SEkin";

//type eventType = "click" | "dblclick" | "mouseup" | "mousemove" | "blur" |"change" | "contextmenu";

type eventItem = {
	guid:number;
	orignFn: FunObj;
	slector: string | undefined;
	type:string;
};

interface FunObj extends Function {
	guid?:number;
};
interface ArrObj extends Array<eventItem> {
	delegateCount?:number;
};


type EventObj = {
		//	[propName:eventType]:ArrObj;
	[key:string]: ArrObj;
	
}




type DomCacheObj = {
			events?:EventObj;
			handler?:any;
			display?:string;
};

interface DomHTML extends HTMLElement{
	[verison]?:DomCacheObj;
}


class CacheSys{

		cache(ele:DomHTML){
			  let value;
			  if(!(value = ele[verison])){
			  		value = ele[verison] = {};
			  }
			return  value ;
		}
		get(ele:DomHTML){
				return  this.cache(ele);
		}
		remove(ele:any){

			ele[verison] = null ;
			delete ele[verison] ;
			
		}

		has(ele:DomHTML){
			return  !!ele[verison];
		}
};

const userCache = new CacheSys();


class EventDom {

	static guid =1 ;

	addEvent(ele:DomHTML,type:string,fn:Function,slector?:string){

			//先取这个dom元素在缓存里的数据
			const eleData = userCache.get(ele);
			let events:EventObj;
			let handler ;
			let eventHandlers:ArrObj ;

			if(!eleData){
				return ;
			}

			//初始化事件对象，放关于这个元素的所有事件类型以及事件对应的hander事件
			if(!(events = eleData.events!)){

					events = eleData.events = {}
			}
			// 事件触发的接口，通过它，来调用相关的所有事件
			if(!(handler = eleData.handler!)){

					const _self = this ;
					//事件的统一接口
					handler = eleData.handler  = function(e:MouseEvent){

							_self.dispath.call(this,e,_self);

					}
			}
			//标注handler
			const handlerFn:FunObj = fn ;
			if(!handlerFn.guid){
				handlerFn.guid = EventDom.guid ++ ;
			}

		  const handleObj = {
				  	orignFn:fn,
				  	type:type,
				  	guid:handlerFn.guid,
				  	slector:slector
		  };
		  //初始化事件类型	【Array
			if(!(eventHandlers = events[type])){
				  const handlers = events[type] = <ArrObj>[];
				  eventHandlers = handlers;
				  eventHandlers.delegateCount = 0;


					ele.addEventListener(type,handler,false);
			}

			if(slector){ //存在事件委托，把委托事件放最前面
				eventHandlers.splice(eventHandlers.delegateCount!++,0,handleObj);
			}else{
				eventHandlers.push(handleObj);
			}
	}

	removeEvent(ele:DomHTML,type?:string,fn?:any,_slector?:string|null){

		//先取这个dom元素在缓存里的数据

		

			if(!userCache.has(ele)){
				return ;
			}
			const eleData = userCache.get(ele);
			const events =  eleData.events!;

			if(!type){ //移除所有的事件
				
				  const types = Object.keys(events);
				  types.forEach((_type:string)=>{
 						ele.removeEventListener(_type,eleData.handler);
				  });

				  const _eleData = <any>eleData ;
  				 _eleData.events = null ;
				   _eleData.handler = null ;

				  delete eleData.events ;
				  delete eleData.handler ;

				  Object.keys(eleData).length === 0 &&  userCache.remove(ele);

					return ;
			}

			//判断有没有空对象，事件存不存在	
			if(!events[type] || !events[type].length){
				return ;
			}

			

			let handlers:ArrObj =  events[type];

			const originCount:number  = handlers.length;
			let j = originCount ;

			//排除要移除的
			while(j--){

					const handleObj = handlers[j];
					const {guid,slector} = handleObj;

				if((!fn || guid === fn.guid) && (!_slector || _slector === slector)){

						handlers.splice(j,1)

						if(slector){
							handlers.delegateCount!--;
						}

				}

			};

			// 事件队列为空，清除该事件
			if(originCount && !handlers.length){
					ele.removeEventListener(type,eleData.handler);
					delete events[type];
			}

			// 所有事件都不存在，清除event
			if(!Object.keys(events).length){
				userCache.remove(ele);
			}

	}
	
	fixNativeEvent(nativeEvent:MouseEvent){
		
		return {
			originEvent:nativeEvent,
			target:nativeEvent.target,
			isPropagationStopped:false,
			stopPropagation:function(){
					this.isPropagationStopped = true;
			//		nativeEvent.stopPropagation();
			}
		}

	}

	dispath(e:MouseEvent,eventClass:this){


		const domNode:any= this ;
		const {events}= domNode[verison];
		const type = e.type;
		const eventHandlers:any[] = events[type];

		const handlerQueues = eventClass.haddler.call(this,e,eventHandlers);


		const eventFix = eventClass.fixNativeEvent(e);


		for (let obj of handlerQueues) {

			if(eventFix.isPropagationStopped){
					return ;
			}
		   const target = obj.ele ;
		   for(let handler of obj.handlers){
					handler.orignFn.call(target,eventFix);
		   }
		}
	}
	
	haddler(e:MouseEvent,eventHandlers:ArrObj):any[]{

			let cur:any = e.target ;
			const deletageCount = eventHandlers.delegateCount!;

			const deletageHandle = eventHandlers.slice(0,deletageCount);

			const handlerQueues:any[] = [] ;

			if(deletageCount && cur.nodeType === 1){


				while(cur !== this){


						const handlers:any[] = deletageHandle.reduce(function(total:any[],evenItem:any){

								const node = cur as HTMLElement ;

								const {slector}:{slector:string} = evenItem;

								const is_target = node.classList.contains(slector.substr(1));
							  
								is_target && total.push(evenItem);

								return total ;

						},[]);

					 handlers.length &&	handlerQueues.push({ele:cur,handlers:handlers});

						cur = cur.parentNode
				}


			}

			if(deletageCount < eventHandlers.length){ //自身的事件handler
					handlerQueues.push({ele:this,handlers:eventHandlers.slice(deletageCount)});
			}

		 return handlerQueues ;

	}
	
}

export {EventDom,userCache};