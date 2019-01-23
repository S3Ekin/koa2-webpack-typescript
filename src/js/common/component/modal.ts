import "@CommonCss/modal.scss";
import DM from "@SDom/Dom/DomUnit";


interface Modals {

	close(modal:DomUinit):void;//关闭模态框
	show(modal:DomUinit):void;//显示模态框
	handle():void;//模态框交互
}

type DomUinit =  ReturnType<typeof DM>;


class Modal implements Modals{

	constructor(){

			this.handle();

	}

	show(dom:DomUinit){
		dom.show();
		dom.addClass("m-show");

	}

	close(dom:DomUinit){
		dom.hide();
		dom.removeClass("m-show");
	}

	handle(){

			const _self = this ;


			/*关闭模态框*/
			DM(".m-close").on("click",function(){

				 const $this = this as HTMLElement ;
				 const curParent = DM($this).closest(".s-modal")!;

				_self.close(curParent);

			});
			

			/*移动模态框 */

		DM(".m-title").on("mousedown",function(fixEvent:any){
			const e = fixEvent.originEvent as MouseEvent;
			const moveTarget = DM(this).closest(".s-modal")!;

			const curX = e.offsetX;
			const curY = e.offsetY;


			let moveHandler = function(event:MouseEvent){
					const x = event.clientX  - curX;
					const y = event.clientY - curY;
					moveTarget.dom[0].style.cssText += `transform:translate(${x}px,${y}px);top:0;left:0`
			};

			let upHandler =  function(){
					document.body.removeEventListener("mousemove",moveHandler);
					document.body.removeEventListener("mouseup",upHandler);
			};

			document.body.addEventListener("mousemove",moveHandler);
			document.body.addEventListener("mouseup",upHandler);
		});	


	}

}

export default Modal;