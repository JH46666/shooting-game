/**
 * 子类 Enemy 射击目标对象
 */
var Enemy = function (opts) {
  var opts = opts || {};
  Element.call(this, opts);
  // 特有属性，当前状态，可谓 normal、booming、boomed
  this.status = 'normal';
  // 特有属性，计算爆炸的帧次
  this.boomCount = 0;
  this.load();
};
// 继承Element的方法
Enemy.prototype = new Element();
/**
 * 方法: down 向下移动一个身位
 */
Enemy.prototype.down = function() {
  this.move(0, this.size);
  return this;
}
/**
 * 方法: load 初始化资源
 */
Enemy.prototype.load = function() {
  // 如果已经有这个图片,则直接返回
  if (Enemy.icon) {
    return this;
  }
  var image = new Image();
  image.src = CONFIG.enemyIcon;
  image.onload = function() {
    Enemy.icon = image;
  }
  var boomImage = new Image();
  boomImage.src = CONFIG.enemyBoomIcon;
  boomImage.onload = function() {
    Enemy.boomIcon = boomImage;
  }
  return this;
}
/**
 * 方法: translate 根据方向水平移动一个身为
 * @param {String} direction 水平移动方向
 */
Enemy.prototype.translate = function(direction) {
  if (direction === 'left') {
    this.move(-this.speed, 0);
  } else {
    this.move(this.speed, 0);
  }
  return this;
}
/**
 * 方法: booming 爆炸中
 */
Enemy.prototype.booming = function() {
  this.status = 'booming';
  this.boomCount += 1;
  if (this.boomCount > 4) {
    this.status = 'boomed';
  }
  return this;
}
// 方法: draw 方法
Enemy.prototype.draw = function() {
  // 绘画一个正方形
  if (Enemy.icon && Enemy.boomIcon) {
    switch(this.status) {
      case 'normal':
        context.drawImage(Enemy.icon, this.x, this.y, this.size, this.size);
        break;
      case 'booming':
        context.drawImage(Enemy.boomIcon, this.x, this.y, this.size, this.size);
        break;
    }
  } else {
    context.fillRect(this.x, this.y, this.size, this.size);
  }
  return this;
}