//@ts-ignore
const canvas: HTMLCanvasElement = document.getElementById("canvas")
const context = canvas.getContext("2d", { desynchronized: true })

class Line {
    touches: { pressure: number, x: number, y: number }[] = new Array()
    isDrawing: boolean = true

    drawLineOnCanvas(context: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
        // context.beginPath()
        // context.strokeStyle = "#FFFFFF"
        // context.moveTo(this.touches[0].x, this.touches[0].y)

        const points = this.touches

        let filteredPoints: { pressure: number, x: number, y: number }[] = new Array()

        points.forEach((point, i) => {
            if (i % 3 != 0) return
            filteredPoints.push(point)
        })

        const pointArray = new Array()

        points.forEach(((point, i) => {
            if (i % 3 != 0) return
            //return if x or y added to the offset are smaller than 0 or bigger than the canvas
            if (point.x + offsetX < 0 || point.y + offsetY < 0 || point.x + offsetX > canvas.width || point.y + offsetY > canvas.height) return

            pointArray.push(point.x + offsetX)
            pointArray.push(point.y + offsetY)
        }))

        drawCurve(context, pointArray, filteredPoints, 0.5, undefined, undefined, false)

        // this.touches.forEach((e, i) => {
        // if(!this.touches[i - 2]) return
        // context.bezierCurveTo(this.touches[i - 2].x, this.touches[i - 2].y, this.touches[i - 1].x, this.touches[i - 1].y, this.touches[i].x, this.touches[i].y)
        // context.lineTo(e.x, e.y)
        // })
        context.stroke()
    }

    drawLastLineOnCanvas(context: CanvasRenderingContext2D, offsetX: number, offsetY: number) {

        if (!this.touches[this.touches.length - 2]) return

        if (this.touches.length % 4 == 0) {

            context.beginPath()
            context.strokeStyle = "#2397F3"
            context.lineWidth = this.touches[this.touches.length - 2].pressure * 7
            context.moveTo(this.touches[this.touches.length - 5].x + offsetX, this.touches[this.touches.length - 5].y + offsetY)
            context.lineTo(this.touches[this.touches.length - 1].x + offsetX, this.touches[this.touches.length - 1].y + offsetY)
            context.stroke()

        }
    }
}

let lines: Line[] = new Array();

startup()

function startup() {
    canvas.addEventListener("pointerdown", pointerDown, false);
    canvas.addEventListener("pointerup", pointerUp, false);
    canvas.addEventListener("pointercancel", pointerCancel, false);
    canvas.addEventListener("pointermove", pointerMove, false);
}

function pointerDown(event: PointerEvent) {
    lines.push(new Line())
}

let offsetX = 0
let offsetY = 0

//read lines from local storage wraped in an try catch block and creating new lines for each entry
try {
    lines = new Array()
    const lineData: { touches: { pressure: number, x: number, y: number }[] }[] = JSON.parse(localStorage.getItem("lines") || "[]")
    lineData.forEach((line, i) => {
        lines.push(new Line())
        lines[i].touches = line.touches
    })
    lines[lines.length - 1].isDrawing = false
    redraw(offsetX, offsetY)
} catch (e) {
    console.log(e)
    lines = new Array()
}

function pointerUp(event: PointerEvent) {
    lines[lines.length - 1].isDrawing = false
    redraw(offsetX, offsetY)

    //save lines to local storage
    localStorage.setItem("lines", JSON.stringify(lines))
}

function pointerCancel(event: PointerEvent) {
    lines[lines.length - 1].isDrawing = false
}

function pointerMove(event: PointerEvent) {

    if (event.pointerType == "touch") {

        offsetX += event.movementX / 1.5
        offsetY += event.movementY / 1.5

        redraw(offsetX, offsetY)

    }

    if (event.pointerType != "pen") return
    if (event.pressure == 0) return

    if (!lines[lines.length - 1].isDrawing) return

    lines[lines.length - 1].touches.push({ pressure: event.pressure, x: event.x - offsetX, y: event.y - offsetY })
    if (!context) return
    lines[lines.length - 1].drawLastLineOnCanvas(context, offsetX, offsetY)

}

function redraw(offsetX: number, offsetY: number) {
    context?.clearRect(0, 0, canvas.width, canvas.height)

    if (!context) return;
    lines.forEach((e) => {
        e.drawLineOnCanvas(context, offsetX, offsetY)
    })
}

window.addEventListener("resize", () => {
    updateCanvasSize()
    redraw(offsetX, offsetY)
})
updateCanvasSize()

function updateCanvasSize() {
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
}


function drawCurve(ctx: CanvasRenderingContext2D, ptsa: any, pressure: { pressure: number, x: number, y: number }[], tension?: any, isClosed?: any, numOfSegments?: any, showPoints?: any) {

    showPoints = showPoints ? showPoints : false;

    drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments), pressure);

    if (showPoints) {
        ctx.stroke();
        ctx.beginPath();
        for (var i = 0; i < ptsa.length - 1; i += 2)
            ctx.rect(ptsa[i] - 2, ptsa[i + 1] - 2, 4, 4);
    }
}

function drawLines(ctx: CanvasRenderingContext2D, pts: any, pressure: { pressure: number, x: number, y: number }[]) {
    // ctx.moveTo(pts[0], pts[1]);
    let i
    for (i = 2; i < pts.length - 1; i += 2) {
        ctx.beginPath();
        ctx.lineWidth = pressure[Math.floor(i / 40)].pressure * 7
        ctx.moveTo(pts[i - 2], pts[i - 1]);
        ctx.lineTo(pts[i], pts[i + 1])
        ctx.stroke();
    }
}

function getCurvePoints(pts: any, tension: any, isClosed: any, numOfSegments: any) {

    // use input value if provided, or use a default value   
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [],    // clone array
        x, y,           // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i;       // steps based on num. of segments

    // clone array so we don't change the original
    //
    _pts = pts.slice(0);

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]); //copy last point and append
        _pts.push(pts[pts.length - 1]);
    }

    // ok, lets start..

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i = 2; i < (_pts.length - 4); i += 2) {
        for (t = 0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
            t2x = (_pts[i + 4] - _pts[i]) * tension;

            t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
            t2y = (_pts[i + 5] - _pts[i + 1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
            c4 = Math.pow(st, 3) - Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}

/**
 * create a class named clyde
 * with following properties
 * - name witch default value is fixl
 * - age witch default value is 15
 * - niceness witch default value is 42
 * with following methods
 * - bonk which takes a string of the person to bonk an a number as the strength to bonk and returns a string
 * - nice witch takes a string of the person to be nice to and returns a string clyde is nice to person
 * - code
 */
class Clyde {
    name = "fixl"
    age = 15
    niceness = 42
    bonk(person: string, strength: number) {
        return `${this.name} bonks ${person} with ${strength} strength`
    }
    nice(person: string) {
        return `${this.name} is nice to ${person}`
    }
    code() {
        return `${this.name} is coding`
    }
}
