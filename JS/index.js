var sw = 20, // 方块的宽
    sh = 20, // 方块的高
    tr = 30, // 行数
    td = 30; // 列数

var snake = null, //蛇的实例
    food = null, //食物的实例
    game = null; //游戏的实例

// 创建小方块的构造函数
// x,y代表小方块的坐标
// classname 代表等下小方块的样式
// 按照像素坐标 第一个0,0 第二个20,0  
// 但这里的x，y表示的是第一个0,0 第二个1,0
function Square(x, y, classname) {
    // 进行坐标 转换成像素坐标
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;
    this.viewContent = document.createElement('div'); // 小方块所对应的dom元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap'); // 方块的父级
}

Square.prototype.create = function () {
    this.viewContent.style.position = 'absolute'; // 创建方块DOM
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent); // 将小方块添加到页面当中
};

Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};

// 蛇

function Snake() {
    this.head = null; // 存一下蛇头的信息
    this.tail = null; // 存一下蛇尾的信息
    this.pos = []; // 存储蛇身上的每一个方块的位置   二维数组
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 180 //蛇头在不同的方向中 应该进行旋转
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }; //存储蛇走的方向  用一个对象来表示
}

Snake.prototype.init = function () {
    // 初始化
    // 创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead; // 存储蛇头信息
    this.pos.push([2, 0]); // 把蛇头的位置存储起来

    // 创建蛇的身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]); //把蛇身1的坐标存储

    // 创建蛇的身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.pos.push([0, 0]); //把蛇身2的坐标存储
    this.tail = snakeBody2; //存储蛇尾信息

    // 形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right; // 默认让蛇往右走
};

// 这个方法用来获取蛇头的下一个位置对应的元素  
// 要根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [
        // 蛇头要走的下一个点的坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ];

    // 下一个点是自己，代表撞到了自己，游戏结束
    var selfCollied = false; //是否撞到自己
    this.pos.forEach(function (value) {
        // 数组，对象，直接比较，还要比较引用值
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true; // 表示撞到了自己
        }
    });
    if (selfCollied) {
        // console.log('撞到自己的了');
        this.strategies.die.call(this);
        return;
    }

    // 下一个点是墙，代表撞到了围墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        // console.log('撞到墙上了');
        this.strategies.die.call(this);
        return;
    }

    // 下一个点是food，代表吃大了食物，吃

    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //说明蛇头要走的下一个点是食物的那个点
        // console.log('eat food');
        this.strategies.eat.call(this);
        return;
    }

    // 使用return 结束函数下面的代码运行，若是上述的情况均为发生，则最后的情况，肯定是空 

    // 下一个点是空，走
    this.strategies.move.call(this);

};

// 处理碰撞后的事件
Snake.prototype.strategies = {
    move: function (format) { // 这个参数用来决定要不要删除蛇尾    当传了操作（true）后为吃
        // 创建一个新的身体（在旧蛇头的位置）
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
        // 更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); // 把旧蛇头从原来的位置删除
        newBody.create();

        // 创建一个新的蛇头,在（nextPos 位置创建）
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
        // 更新链表的关系
        newHead.last = null;
        newHead.next = newBody;
        newHead.next.last = newHead;
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';

        newHead.create();
        // 蛇身上的每一个坐标进行更新
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead; //把this.head的信息更新

        // 删除蛇尾 通过判断是否吃food，如果吃了food，就不删除，若是没有吃，就删除

        if (!format) { //如果format 的值为false  表示需要删除（除了吃之外的操作）
            this.tail.remove();
            // 更新链表
            this.tail = this.tail.last;
            this.tail.next = null;

            // 更新蛇身坐标数组
            this.pos.pop();
        }
    },
    eat: function () {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function () {
        game.over();
    }
}

snake = new Snake();

// 创建食物
function createFood() {
    // 食物小方块的随机坐标
    var x = null,
        y = null;
    var include = true; // 循环跳出的条件，true表示随机生成的坐标在蛇身上，继续让他循环，false表示食物坐标不在蛇身上，不循环
    while (include) {
        // 0~29随机数
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))

        snake.pos.forEach(function (value) {
            if (value[0] != x && value[1] != y) {
                // 这个条件成立说明现在随机出的食物坐标，并未在蛇身上
                include = false;
            }
        });
    }
    // 生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y]; // 存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比 
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.create();
    }

}

// 创建游戏逻辑

function Game() {
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function () {
    snake.init();
    // snake.getNextPos();
    createFood();
    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) { //用户摁下左键时候，这条蛇不能是正在往右走
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
}

Game.prototype.start = function () { // 开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200)
}

Game.prototype.pause = function () {
    clearInterval(this.timer);
}

Game.prototype.over = function () {
    clearInterval(this.timer);
    alert('你的得分为：' + this.score + '分');

    // 游戏回到最初始的状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

// 开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
};

// 暂停
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function () {
    game.pause();
    pauseBtn.parentNode.style.display = 'block'
}

pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}