function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Game {
    constructor() {
        this.tickRate = 150
        this.field = new Field(new Size(20, 20))
        this._initEventListeners()
        this.tickCount = 0
    }

    start() {
        this.snake = new Snake()
        this.food = new Point()
        this._spawnFood()
        this.tickInterval = setInterval(_ => this._tick(), this.tickRate);
    }

    end() {
        if (this.tickInterval)
            clearInterval(this.tickInterval)
    }

    restart() {
        this.end()
        this.start()
    }

    setTickRate(ms) {
        this.tickRate = ms
    }

    _tick() {
        this.tickCount++
        this.field.clear()
        this.snake.move()
        this._detectCollision()
        this._render()
    }

    _render() {
        this.field.setFoodPixel(this.food)
        this.snake.getBodyPositions().forEach(point => {
            this.field.setSnakePixel(point)
        })
    }

    _initEventListeners() {
        document.onkeydown = (e) => {
            if (e.key === 'ArrowUp')
                this.snake.rotate().up()
            else if (e.key === 'ArrowDown')
                this.snake.rotate().down()
            else if (e.key === 'ArrowLeft')
                this.snake.rotate().left()
            else if (e.key === 'ArrowRight')
                this.snake.rotate().right()
        }
    }

    _spawnFood() {
        this.food = new Point(
            random(0, this.field.size.x - 1), 
            random(0, this.field.size.y - 1)
        )
    }

    _detectCollision() {
        const head = this.snake.getHeadPosition()
        
        if (head.equals(this.food))
            this._onFoodCollision()

        if (head.x < 0 ||
            head.x >= this.field.size.x ||
            head.y < 0 ||
            head.y >= this.field.size.y)
            this._onBorderCollision()
    }

    _onFoodCollision() {
        this.snake.increaseLength()
        this._spawnFood()
    }

    _onTailCollision() {
        this.restart()
    }

    _onBorderCollision() {
        this.restart()
    }
}

class Snake {
    constructor(initialPosition) {
        this.positions = [initialPosition || new Point()]
        this.mover = new SnakeMover(this)
        this.rotator = new SnakeRotator(this)
        this.movingVector = new Vector2(0, 0)
    }

    getHeadPosition() {
        return this.positions[0]
    }

    getBodyPositions() {
        return this.positions
    }

    move() {
        this.mover.move(this.movingVector)
    }

    rotate() {
        return this.rotator
    }

    increaseLength() {
        const lastPosition = this.positions[this.positions.length - 1]
        this.positions.push(Point.copy(lastPosition))
    }

    length() {
        return this.positions.length
    }
}

class SnakeMover {
    constructor(snake) {
        this.snake = snake
    }

    move(vector) {
        this._moveTail()
        this._moveHead(vector.x, vector.y)
    }

    _moveHead(xOffset, yOffset) {
        this.snake.positions[0].change(xOffset, yOffset)
    }

    _moveTail() {
        const points = this.snake.positions
        let lastIndex = points.length - 1

        if (points.length <= 1)
            return

        if (points[points.length - 1].equals(points[points.length - 2]))
            lastIndex = points.length - 2 

        for (let i = lastIndex; i > 0; i--)
            points[i] = Point.copy(points[i - 1])
    }
}

class SnakeRotator {
    constructor(snake) {
        this.snake = snake
    }

    up() {
        this.snake.movingVector = new Vector2(0, -1)
    }

    down() {
        this.snake.movingVector = new Vector2(0, 1)
    }

    left() { 
        this.snake.movingVector = new Vector2(-1, 0)
    }

    right() {
        this.snake.movingVector = new Vector2(1, 0)
    }
}

class Field {
    constructor(size) {
        this.pixelSize = 30
        this.size = size
        this.fieldNode = document.getElementById('field')
        this.matrix = []

        if (!this.fieldNode)
            throw new Error('No base element #field!')

        this._setFieldSize()
        this._populateField()
    }

    clear() {
        this.matrix.forEach(row => {
            row.forEach(pixel => {
                const defaultClass = pixel.classList[0]
                pixel.className = defaultClass
            })
        })
    }

    setSnakePixel(point) {
        this._addPixelClass(point, 'green')
    }

    setFoodPixel(point) {
        this._addPixelClass(point, 'red')
    }

    _addPixelClass(point, _class) {
        this.matrix[point.y][point.x].classList.add(_class)
    }

    _setFieldSize() {
        this._setNodeSize(this.fieldNode, this.size.multiply(this.pixelSize))
    }

    _populateField() {
        const pixelSize = new Size(this.pixelSize, this.pixelSize)

        for (let i = 0; i < this.size.y; i++) {
            this.matrix.push([])
            for (let j = 0; j < this.size.x; j++) {
                const pixel = document.createElement('div')
                pixel.classList.add('pixel')
                this._setNodeSize(pixel, pixelSize)
                this.matrix[i].push(pixel)
                this.fieldNode.appendChild(pixel)
            }
        }
    }

    _setNodeSize(node, size) {
        node.style.width = `${size.x}px`
        node.style.height = `${size.y}px`
    }
}

class Point {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }

    static copy(point) {
        return new Point(point.x, point.y)
    }

    multiply(value) {
        return new Point(this.x * value, this.y * value)
    }

    equals(other) {
        const result = (this.x === other.x && this.y === other.y)
        return result
    }

    change(x, y) {
        this.x += x
        this.y += y
        return this
    }
}

class Size extends Point {}
class Vector2 extends Point {}

const game = new Game()
game.start()