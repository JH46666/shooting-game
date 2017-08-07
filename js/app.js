// 元素
var container = document.getElementById('game');
var levelText = document.querySelector('.game-level');
var nextLevelText = document.querySelector('.game-next-level');
var scoreText = document.querySelector('.game-info .score');
var totalScoreText = document.querySelector('.game-info-text .score');
// 画布
var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
// 更新画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;
// 获取hash
// var hash = location.hash;
// var isBaseVersion = hash === '#base';


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
    var self = this;

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
    // 更新
    this.status = opts.status || 'start';
    this.score = 0;
    this.keyBoard = new KeyBoard();

    // 加载图片资源，加载完成才能交互
    var resources = [
      opts.enemyIcon, 
      opts.enemyBoomIcon, 
      opts.planeIcon
    ];

    util.resourceOnload(resources, function(images) {
      // 更新图片
      opts.enemyIconImage = images[0];
      opts.enemyBoomIconImage = images[1];
      opts.planeIconImage = images[2];
      self.opts = opts;
      self.bindEvent();
    })
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
  /**
   * play 游戏开始需要设置
   * - 创建怪兽实例数组
   * - 创建飞机
   * - 修改
   */
  play: function() {
    // 获取游戏初始化 level
    var self = this;
    var opts = this.opts;
    var padding = this.padding;
    var level = opts.level;
    var numPerLine = opts.numPerLine;
    var enemyGap = opts.enemyGap;
    var enemySize = opts.enemySize;
    var enemySpeed = opts.enemySpeed;
    var enemyIconImage = opts.enemyIconImage;
    var enemyBoomIconImage = opts.enemyBoomIconImage;
    var planeIconImage = opts.planeIconImage;
    // 清空射击目标对象数组
    this.enemies = []; 

    // 创建基础 enmey 实例
    for (var i = 0; i < level; i++) {
      for (var j = 0; j < numPerLine; j++) {
        // 每个元素的
        var initOpt = {
          x: padding + j * (enemySize + enemyGap), 
          y: padding + i * enemySize,
          size: enemySize,
          speed: enemySpeed,
          icon: enemyIconImage,
          boomIcon: enemyBoomIconImage
        }
        this.enemies.push(new Enemy(initOpt));
      }
    }

    // 创建主角英雄
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      minX: this.planeMinX,
      maxX: this.planeMaxX,
      size: opts.planeSize,
      speed: opts.planeSpeed,
      bulletSize: opts.bulletSize, // 默认子弹长度
      bulletSpeed: opts.bulletSpeed, // 默认子弹的移动速度
      icon: planeIconImage
    });
    
    this.renderLevel();
    this.setStatus('playing');
    // 开始动画循环
    this.update();
  },
  pause: function() {
    this.setStatus('pause');
  },
  /**
   * 结束方式有三种
   * - all-success
   * - success
   * - failed
   */
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

    // 如果没有目标元素，则证明通关了
    if (enemies.length === 0) {
      // 判断是否全部关卡都通过
      var endType = opts.level === opts.totalLevel ? 'all-success' : 'success';
      this.end(endType);
      // 停止动画循环
      return;
    }

    // 判断最后一个元素是否已经到了底部，是则游戏结束
    if (enemies[enemies.length - 1].y >= this.enemyLimitY) {
      this.end('failed');
      // 停止动画循环
      return;
    }

    // 绘制画布
    this.draw();

    // 不断循环 update
    requestAnimFrame(function() {
      self.update()
    });
  },
  /**
   * 更新飞机，具体以下操作
   * - 判断是否点击了键盘移动飞机
   * - 判断是否需要射击子弹
   */
  updatePanel: function() {
    var plane = this.plane;
    var keyBoard = this.keyBoard;
    // 如果按了左方向键或者长按左方向键
    if (keyBoard.pressedLeft) {
      plane.translate('left');
    }
    // 如果按了右方向键或者长按右方向键
    if (keyBoard.pressedRight) {
      plane.translate('right');
    }
    // 如果按了上方向键
    if (keyBoard.pressedUp || keyBoard.pressedSpace) {
      // 飞机射击子弹
      plane.shoot();
      // 取消飞机射击
      keyBoard.pressedUp = false;
      keyBoard.pressedSpace = false;
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
    var enemiesBoundary = util.getHorizontalBoundary(enemies);

    // 判断目标是否到了水平边界，是的话更换方向且需要向下
    if (enemiesBoundary.minX < this.enemyMinX 
      || enemiesBoundary.maxX > this.enemyMaxX ) {
      opts.enemyDirection = opts.enemyDirection === 'right' ? 'left' : 'right'; 
      enemyNeedDown = true;
    }

    // 循环更新怪兽
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
    totalScoreText.innerText = this.score;
  }
}


// 初始化
GAME.init();
