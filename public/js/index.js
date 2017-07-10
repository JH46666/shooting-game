// ### lib/uitl.js ###
// 判断是否有 requestAnimationFrame 方法，如果有则模拟实现
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
    window.setTimeout(callback, 1000 / 30);
};

/**
 * [getHorizontalBoundary] 获取目标对象实例们中最小的横坐标和最大的横坐标
 */
function getHorizontalBoundary(arrs) {
  var minX, maxX;
  arrs.forEach(function (item) {
    if (!minX && !maxX) {
      minX = item.x;
      maxX = item.x;
    } else {
      if (item.x < minX) {
        minX = item.x;
      }
      if (item.x > maxX) {
        maxX = item.x;
      }
    }
  });
  return {
    minX: minX,
    maxX: maxX
  }
}

// ###  lib/element.js ###
/**
 * 父类：element对象
 */
var Element = function (opts) {
  var opts = opts || {};
  // 设置坐标和尺寸
  this.x = opts.x;
  this.y = opts.y;
  this.size = opts.size;
  this.speed = opts.speed;
};
// 子弹对象原型
Element.prototype = {
  /**
   * 原型方法 move 
   */
  move: function(x, y) {
    var addX = x || 0;
    var addY = y || 0;
    this.x += x;
    this.y += y;
  },
  /**
   * 原型方法 draw 
   */
  draw: function() {
  }
}

// ### config.js ###
/**
 * 游戏相关配置
 * @type {Object}
 */
var CONFIG = {
  status: 'start', // 游戏开始默认为开始中
  level: 1, // 游戏默认等级
  totalLevel: 6, // 总共的关卡
  numPerLine: 7, // 游戏默认每行10个aim
  canvasPadding: 28, // 默认画布的间隔
  bulletSize: 10, // 默认子弹长度
  bulletSpeed: 10, // 默认子弹的移动速度
  enemySpeed: 2, // 默认敌人移动距离
  enemySize: 50, // 默认敌人的尺寸
  enemyGap: 10,  // 默认敌人之间的间距
  enemyIcon: './img/enemy.png',
  enemyBoomIcon: './img/boom.png',
  enemyDirection: 'right', // 默认敌人是往右移动
  planeSpeed: 5, // 默认飞机每一步移动的距离
  planeSize: {
    width: 60,
    height: 100
  }, // 默认飞机的尺寸,
  planeIcon: './img/plane.png',
};

// ### bullets.js ###
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

// ### plane.js ###
/**
 * 子类 Plane 飞机
 * 1、继承 Element
 * 2、依赖 Bullet
 */
var Plane = function (opts) {
  var opts = opts || {};
  Element.call(this, opts);
  // 特有属性
  this.minX = opts.minX;
  this.maxX = opts.maxX;
  this.bulletSpeed = opts.bulletSpeed || CONFIG.bulletSpeed;
  this.bulletSize = opts.bulletSize || CONFIG.bulletSize;
  console.log(11);
  this.bullets = [];
  this.load();
};

// 继承Element的方法
Plane.prototype = new Element();
/**
 * 方法: hasHit 判断是否击中当前元素
 * @param  {Aim}  aim 目标元素实例
 */
Plane.prototype.hasHit = function(aim) {
  var bullets = this.bullets;
  for (var j = bullets.length - 1; j >= 0; j--) {
    var bullet = bullets[j];
    var inX = aim.x < bullet.x && bullet.x < (aim.x + aim.size);
    var inY = aim.y < bullet.y && bullet.y < (aim.y + aim.size);
    // 如果子弹击中的是目标对象的范围，则销毁子弹
    if (inX && inY){
      this.bullets.splice(j, 1);
      return true;
    }
  }
  return false;
}
/**
 * 方法: load 下载资源
 */
Plane.prototype.load= function() {
  // 如果已经有这个图片,则直接返回
  if (Plane.icon) {
    return this;
  }
  var image = new Image();
  image.src = CONFIG.planeIcon;
  image.onload = function() {
    Plane.icon = image;
  }
  return this;
}
/**
 * 方法: translate 左右移动主角
 */
Plane.prototype.translate = function(direction) {
  var speed = this.speed;
  var addX;
  if (direction === 'left') {
    // 判断是否到达左边界，是的话则不移动，否则移动一个身位
    addX = this.x < this.minX ? 0 : -speed;
  } else {
    // 判断是否到达右边界，是的话则不移动，否则移动一个身位
    addX = this.x > this.maxX ? 0 : speed;
  }
  this.move(addX, 0);
  return this;
}
/**
 * 方法: shoot 方法
 */
Plane.prototype.shoot = function() {
  // 创建子弹,子弹位置是居中射出
  var x = this.x + this.size.width / 2;
  // 创建子弹
  this.bullets.push(new Bullet({
    x: x,
    y: this.y,
    size: this.bulletSize,
    speed: this.bulletSpeed 
  }));
  return this;
}
/**
 * 方法： drawBullets 画子弹
 */
Plane.prototype.drawBullets = function () {
  var bullets = this.bullets;
  var i = bullets.length;
  while (i--) {
    var bullet = bullets[i];
    // 更新子弹的位置
    bullet.fly();
    // 如果子弹对象超出边界,则删除
    if (bullet.y <= 0) {
      //如果子弹实例下降到底部，则需要在drops数组中清楚该实例对象
      bullets.splice(i, 1);
    }
    // 未超出的则绘画子弹
    bullet.draw();
  }
}
// 方法: draw 方法
Plane.prototype.draw = function() {
  this.drawBullets();
  if (!Plane.icon) {
    context.fillRect(this.x, this.y, this.size.width, this.size.height);
  } else {
    context.drawImage(Plane.icon, this.x, this.y, this.size.width, this.size.height);
  }
  
  return this;
}

// ### enemy.js ###
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

// ### keyboard.js ###
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
        break;
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
        break;
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

// ### app.js ###
// 元素
var container = document.getElementById('game');
var levelText = document.querySelector('.game-level');
var nextLevelText = document.querySelector('.game-next-level');
var scoreText = document.querySelector('.game-info .score');
var totalScoreText = document.querySelector('.game-failed .score');
// 画布
var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
// 更新画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;
// 获取hash
var hash = location.hash;
var isBaseVersion = hash === '#base';




/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function(opts) {
    var opts = Object.assign({}, opts, CONFIG);
    // 画布的间距
    var padding = opts.canvasPadding;
    this.padding = padding;
    // 射击目标极限纵坐标
    this.enemyLimitY = canvasHeight - padding - opts.planeSize.height;
    // 射击目标对象极限横坐标
    this.enemyMinX = padding;
    this.enemyMaxX = canvasWidth - padding - opts.enemySize;
    // 飞机对象极限横坐标
    var planeWidth = opts.planeSize.width;
    this.planeMinX = padding;
    this.planeMaxX = canvasWidth - padding - planeWidth;
    this.planePosX = canvasWidth / 2 - planeWidth;
    this.planePosY = this.enemyLimitY;
    // 更新opts
    this.opts = opts;
    this.score = 0;
    if (isBaseVersion) {
      this.opts.totalLevel = 1;
    }
    this.keyBoard = new KeyBoard();
    // 处于开始状态
    this.status = 'start';
    this.bindEvent();
    this.renderLevel();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtns = document.querySelectorAll('.js-replay');
    var nextBtn = document.querySelector('.js-next');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
    };
    // 重新玩游戏按钮绑定
    replayBtns.forEach(function (btn) {
      btn.onclick = function() {
        self.opts.level = 1;
        self.play();
        self.score = 0;
        totalScoreText.innerText = self.score;
      };
    })
    // 下一关按钮绑定
    nextBtn.onclick = function() {
      self.opts.level += 1;
      self.play();
    };
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * stop 游戏暂停
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
  },
  play: function() {
    // 获取游戏初始化 level
    var opts = this.opts;
    var self = this;
    var padding = this.padding;
    var level = opts.level;
    var numPerLine = opts.numPerLine;
    var enemyGap = opts.enemyGap;
    var enemySize = opts.enemySize;
    var enemySpeed = opts.enemySpeed;
    this.enemies = []; // 清空射击目标对象数组
    // 创建基础 enmey 实例
    for (var i = 0; i < level; i++) {
      for (var j = 0; j < numPerLine; j++) {
        // 每个元素的
        var initOpt = {
          x: padding + j * (enemySize + enemyGap), 
          y: padding + i * (enemySize + enemyGap),
          size: enemySize,
          speed: enemySpeed
        }
        this.enemies.push(new Enemy(initOpt));
      }
    }
    // 创建主角英雄
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      size: opts.planeSize,
      minX: this.planeMinX,
      speed: opts.planeSpeed,
      maxX: this.planeMaxX,
    });
   
    this.setStatus('playing');
    this.renderLevel();
    this.update();
  },
  pause: function() {
    this.setStatus('pause');
  },
  end: function(type) {
    // 先清理当前画布
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus(type);
  },
  /**
   * 游戏每一帧的更新函数
   */
  update: function() {
    var self = this;
    var opts = this.opts;
    var keyBoard = this.keyBoard;
    var padding = opts.padding;
    var enemySize = opts.enemySize;
    var enemies = this.enemies;
    // 先清理画布
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    // 更新飞机
    this.updatePanel();
    // 更新敌人
    this.updateEnemies();
    // 绘画
    this.draw();
    // 如果没有目标元素，则证明通关了
    if (enemies.length === 0) {
      // 如果是第六关通过成功
      if (self.opts.level === self.opts.totalLevel) {
        this.end('all-success');
      } else {
        this.end('success');
      }
      return;
    }
    // 判断最后一个元素是否已经到了底部，是则游戏结束
    // console.log(enemies[enemies.length - 1].y)
    if (enemies[enemies.length - 1].y >= this.enemyLimitY) {
      this.end('failed');
      return;
    }
    // 不断循环update
    requestAnimFrame(function() {
      self.update(this)
    });
  },
  /**
   * 更新飞机
   */
  updatePanel: function() {
    var plane = this.plane;
    var keyBoard = this.keyBoard;
    // 如果按了左方向键或者长按左方向键
    if (keyBoard.pressedLeft || keyBoard.heldLeft) {
      plane.translate('left');
    }
    // 如果按了右方向键或者长按右方向键
    if (keyBoard.pressedRight || keyBoard.heldRight) {
      plane.translate('right');
    }
    // 如果按了上方向键
    if (keyBoard.pressedUp || keyBoard.pressedSpace) {
      keyBoard.pressedUp = false;
      keyBoard.pressedSpace = false;
      plane.shoot();
    }
  },
  /**
   * 更新敌人实例数组
   */
  updateEnemies: function() {
    var opts = this.opts;
    var padding = opts.padding;
    var enemySize = opts.enemySize;
    var enemies = this.enemies;
    var plane = this.plane;
    var i = enemies.length;
    // 判断目标元素是否需要向下
    var enemyNeedDown = false; 
    // 获取当前目标实例数组中最小的横坐标和最大的横坐标
    var enemiesBoundary = getHorizontalBoundary(enemies);
    // 判断目标是否到了水平边界，是的话更换方向
    if (enemiesBoundary.minX < this.enemyMinX 
      || enemiesBoundary.maxX > this.enemyMaxX ) {
      opts.enemyDirection = opts.enemyDirection === 'right' ? 'left' : 'right'; 
      enemyNeedDown = true;
    }
    while (i--) {
      var enemy = enemies[i];
      // 是否需要向下移动
      if (enemyNeedDown) {
        enemy.down()
      }
      // 水平位移
      enemy.translate(opts.enemyDirection);
      switch(enemy.status) {
        case 'normal':
          // 判断是否击中未爆炸的敌人
          if (plane.hasHit(enemy)) {
            // 设置爆炸时长展示第一帧）
            enemy.booming();
          }
          break;
        case 'booming':
          enemy.booming();
          break;
        case 'boomed':
          this.enemies.splice(i, 1);
          this.score += 1;
      }
    }
  },
  /**
   * 游戏页面绘画操作函数
   */
  draw: function() {
    this.renderScore();
    this.plane.draw();
    this.enemies.forEach(function(enemy) {
      enemy.draw();
    });
  },
  renderLevel: function() {
    levelText.innerText = '当前Level：' + this.opts.level;
    nextLevelText.innerText = '下一个Level： ' + (this.opts.level + 1);
  },
  renderScore: function() {
    scoreText.innerText = this.score;
  }
}


// 初始化
GAME.init();
