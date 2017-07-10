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
