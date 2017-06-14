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
