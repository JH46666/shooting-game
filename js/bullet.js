/**
 * 子类 Bullet 子弹对象
 */
var Bullet = function (opts) {
  var opts = opts || {};
  Element.call(this, opts);
};
// 继承Element的方法
Bullet.prototype = new Element();
/**
 * 方法：fly 向上移动
 */
Bullet.prototype.fly = function() {
  this.move(0, -this.speed);
  return this;
}
// 方法：draw 方法
Bullet.prototype.draw = function() {
  // 绘画一个线条
  context.beginPath();
  context.strokeStyle = '#fff';
  context.moveTo(this.x, this.y);
  context.lineTo(this.x, this.y - this.size); // 子弹尺寸不支持修改);
  context.closePath();
  context.stroke();
  return this;
}