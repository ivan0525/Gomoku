cc.Class({
    extends: cc.Component,

    properties: {

    },
    startGame: function () {
        cc.director.loadScene('Game');
    }
});
