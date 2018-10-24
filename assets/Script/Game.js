cc.Class({
  extends: cc.Component,

  properties: {
    OverSprite: {
      default: null,
      type: cc.Sprite
    },
    ResultLabel: {
      default: null,
      type: cc.Label
    },
    chessPrefab: {
      // 棋子预制
      default: null,
      type: cc.Prefab
    },
    blackChess: {
      // 黑棋图片
      default: null,
      type: cc.SpriteFrame
    },
    chessList: {
      default: [],
      type: [cc.Node]
    },
    whiteChess: {
      // 白棋图片
      default: null,
      type: cc.SpriteFrame
    },
    // 每一回合落下的棋子
    touchChess: {
      default: null,
      type: cc.Node,
      visible: false // 属性窗口不显示
    },
    gameState: "white"
  },
  // 初始化225个棋子的位置
  onLoad() {
    this.OverSprite.node.active = false;
    var self = this;
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 15; j++) {
        // 复制chess的预制资源
        var newChessNode = cc.instantiate(this.chessPrefab);
        this.node.addChild(newChessNode);
        // 根据棋盘和棋子来计算每一颗棋子节点对应的位置
        newChessNode.setPosition(cc.v2(i * 40 + 22, j * 40 + 22));
        // 根据每个棋子节点的flag属性，可以算出其二维坐标
        newChessNode.flag = i * 15 + j;
        newChessNode.on(
          cc.Node.EventType.TOUCH_END,
          function(event) {
            self.touchChess = this;
            if (self.gameState === "white" && this.getComponent(cc.Sprite).spriteFrame === null) {
              this.getComponent(cc.Sprite).spriteFrame = self.whiteChess;
            }
          },
          newChessNode
        );
        this.chessList.push(newChessNode);
      }
    }
  },
  reStartGame: function() {
    cc.director.loadScene("Game");
  },
  toMeun: function() {
    cc.director.loadScene("Menu");
  }
});
