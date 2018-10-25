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
        gameState: 'white',
        // 五元组数组
        fiveGroup: [],
        // 五元组的分数
        fiveGroupScore: []
    },
    // 初始化225个棋子的位置
    onLoad () {
        this.OverSprite.node.active = false;
        var self = this;
        for (var i = 0;i < 15;i++) {
            for (var j = 0;j < 15;j++) {
                // 复制chess的预制资源
                var newChessNode = cc.instantiate(this.chessPrefab);
                this.node.addChild(newChessNode);
                // 根据棋盘和棋子来计算每一颗棋子节点对应的位置
                newChessNode.setPosition(cc.v2(i * 40 + 22, j * 40 + 22));
                // 根据每个棋子节点的flag属性，可以算出其二维坐标
                newChessNode.flag = i * 15 + j;
                newChessNode.on(cc.Node.EventType.TOUCH_END, function (event) {
                    self.touchChess = this;
                    // 如果当前下的是白棋，就将棋子的图片设置为白棋的图片
                    if (self.gameState === 'white' && this.getComponent(cc.Sprite).spriteFrame === null) {
                        this.getComponent(cc.Sprite).spriteFrame = self.whiteChess;
                        self.judgeOver();
                        if (self.gameState === 'black') {
                            self.scheduleOnce(function () { // 延迟一秒电脑下棋
                                self.aiLogic();
                            }, 1);
                        }
                    }
                },
                newChessNode
                );
                this.chessList.push(newChessNode);
            }
        }
        // 添加五元组
        // 横向
        for (var y = 0;y < 15;y++) {
            for (var x = 0;x < 11;x++) {
                this.fiveGroup.push([
                    y * 15 + x,
                    y * 15 + x + 1,
                    y * 15 + x + 2,
                    y * 15 + x + 3,
                    y * 15 + x + 4
                ]);
            }
        }
        // 纵向
        for (var a = 0;a < 15;a++) {
            for (var b = 0;b < 11;b++) {
                this.fiveGroup.push([
                    b * 15 + a,
                    (b + 1) * 15 + a,
                    (b + 2) * 15 + a,
                    (b + 3) * 15 + a,
                    (b + 4) * 15 + a
                ]);
            }
        }
        // 右上斜向
        for (var n = -10;n <= 10;n++) {
            for (var m = 0;m < 11;m++) {
                if (n + m < 0 || n + m > 10) {
                    continue;
                } else {
                    this.fiveGroup.push([
                        (n + m) * 15 + m,
                        (n + m + 1) * 15 + m + 1,
                        (n + m + 2) * 15 + m + 2,
                        (n + m + 3) * 15 + m + 3,
                        (n + m + 4) * 15 + m + 4
                    ]);
                }
            }
        }
        // 右斜向下
        for (var s = 4;s <= 24;s++) {
            for (var t = 0;t < 11;t++) {
                if (s - t < 4 || s - t > 14) {
                    continue;
                } else {
                    this.fiveGroup.push([
                        t * 15 + s - t,
                        (t + 1) * 15 + s - (t + 1),
                        (t + 2) * 15 + s - (t + 2),
                        (t + 3) * 15 + s - (t + 3),
                        (t + 4) * 15 + s - (t + 4)
                    ]);
                }
            }
        }
    },
    aiLogic: function () {
        cc.log('电脑下棋');
        // 评分
        for (var i = 0;i < this.fiveGroup.length;i++) {
            var b = 0; // 黑棋个数
            var w = 0; // 白棋个数
            for (var j = 0;j < 5;j++) {
                if (this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite).spriteFrame === this.blackChess) {
                    b++;
                } else if (this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite) === this.whiteChess) {
                    w++;
                }
            }
            // 五元组中无棋子
            if (b + w === 0) {
                this.fiveGroupScore[i] = 7;
            } else if (b > 0 && w > 0) { // 五元组中既有黑棋又有白棋
                this.fiveGroupScore[i] = 0;
            } else if (b === 1 && w === 0) { // 只有一颗黑棋
                this.fiveGroupScore[i] = 35;
            } else if (b === 2 && w === 0) {
                this.fiveGroupScore[i] = 800;
            } else if (b === 3 && w === 0) {
                this.fiveGroupScore[i] = 15000;
            } else if (b === 4 && w === 0) {
                this.fiveGroupScore[i] = 800000;
            } else if (b === 0 && w === 1) { // 只有一颗白棋
                this.fiveGroupScore[i] = 15;
            } else if (b === 0 && w === 2) {
                this.fiveGroupScore[i] = 400;
            } else if (b === 0 && w === 3) {
                this.fiveGroupScore[i] = 1800;
            } else if (b === 0 && w === 4) {
                this.fiveGroupScore[i] = 100000;
            }
        }
        // 找到最高分的五元组;
        var hScore = 0,
            mPosition = 0;
        for (var x = 0;x < this.fiveGroup.length;x++) {
            if (this.fiveGroupScore[x] > hScore) {
                hScore = this.fiveGroupScore[x];
                mPosition = (function (pos) {
                    return pos;
                })(x);
            }
        }
        // 在最高分的五元组中寻找最优下棋位置
        var flag1 = false; // 无子
        var flag2 = false; // 有子
        var nPosition = 0;
        for (var y = 0;y < 5;y++) {
            if (!flag1 && this.chessList[this.fiveGroup[mPosition][y]].getComponent(cc.Sprite).spriteFrame === null) {
                nPosition = (function (pos) {
                    return pos;
                })(y);
            }
            if (!flag2 && this.chessList[this.fiveGroup[mPosition][y]].getComponent(cc.Sprite).spriteFrame !== null) {
                flag1 = true;
                flag2 = true;
            }
            if (flag2 && this.chessList[this.fiveGroup[mPosition][y]].getComponent(cc.Sprite).spriteFrame === null) {
                nPosition = (function (pos) {
                    return pos;
                })(y);
                break;
            }
        }
        // 在最优的位置下棋

        this.chessList[this.fiveGroup[mPosition][nPosition]].getComponent(cc.Sprite).spriteFrame = this.blackChess;
        this.touchChess = this.chessList[this.fiveGroup[mPosition][nPosition]];
        this.judgeOver();
    },
    // 胜负判断
    judgeOver: function () {
        if (this.gameState === 'white') {
            this.gameState = 'black';
        } else {
            this.gameState = 'white';
        }
    },
    reStartGame: function () {
        cc.director.loadScene('Game');
    },
    toMeun: function () {
        cc.director.loadScene('Menu');
    }
});
