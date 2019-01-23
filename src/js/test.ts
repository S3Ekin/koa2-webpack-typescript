
import Modal from "@SDom/component/modal";
import DM from "@SDom/Dom/DomUnit";
import "@SDom/component/SCombobox";
import "@SDom/component/Tree";


const modal = new Modal();

DM("#j-alert").on("click",function(){
		modal.show(DM("#confirm-MView"));
});


DM("#event").on("click",function(){
	console.log("1");
});

DM("#event").on("dblclick",function(){
	console.log("1_copy");
});

const test = function(){
	console.log("child");
};

DM("#event").on("click",".child",test);

DM("#event").off("click",test);


const str = "234";

export {str};