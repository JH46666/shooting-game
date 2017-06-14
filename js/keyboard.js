/**
 * 键盘操作相关对象
 */
var KeyBoard = function() {
  document.onkeydown = this.keydown.bind(this);
  document.onkeyup = this.keyup.bind(this);
}

KeyBoard.prototype = {
  pressedLeft: false, // 是否点击左边
  pressedRight: false, // 是否点击右边
  pressedUp: false, // 是否按了上报
  heldLeft: false, // 是否长按左边
  heldRight: false, // 是否长按右边
  pressedSpace: false, // 是否按了上报
  keydown: function(event) {
  	 // 获取键位
    var key = event.keyCode;
    switch(key) {
      case 32: 
      	this.pressedSpace = true;
      case 37: 
        this.pressedLeft = true;
        this.heldLeft = true;
        this.pressedRight = false;
        this.heldRight = false;
        break;
      case 38: 
        this.pressedUp = true;
        break;
      case 39: 
        this.pressedLeft = false;
        this.heldLeft = false;
        this.pressedRight = true;
        this.heldRight = true;
        break;
    } 
  },
  keyup: function(event) {
    // 获取键位
    var key = event.keyCode;
    switch(key) {
      case 32: 
      	this.pressedSpace = false;	
      case 37:
        this.heldLeft = false;
        this.pressedLeft = false;
      case 38: 
        this.pressedUp = false;
        break;
      case 39: 
        this.heldRight = false;
        this.pressedRight = false;
        break;
    } 
  }
};