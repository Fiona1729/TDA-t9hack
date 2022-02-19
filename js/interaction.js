c = document.getElementById('tdacanvas')
epsilon_ = document.getElementById('epsilon')
mode_select = document.getElementById('mode_select')

let interact_mode = "add"

let points = [] // 0-simplices, n-simplices generated by Cech complex.

let simplices = [] // 0-th index is 1-simplices, etc.

let epsilon = 20
let lastepsilon = 20

let distMatrix = []
let adjMatrix = []

let distCrossings = []

c.width = window.innerWidth
c.height = window.innerHeight

ctx = c.getContext("2d")

ctx.fill()


// Variable for timeout calls to recalculate
var recalculateTimeout = null

// Recalculate simplices
function recalculate () {
    console.log('recalculating')
    get_1simplices()
    get_nsimplices(2)
    get_nsimplices(3)
    requestAnimationFrame(do_update)
}

// Set recaclulate timeout
function do_recalculate () {
    if (recalculateTimeout) {clearTimeout(recalculateTimeout)}
    recalculateTimeout = setTimeout(recalculate, 20)
}

mode_select.oninput = function () {
    interact_mode = this.value
}

epsilon_.oninput = function () {
    epsilon = this.value / 50
    for (let x of distCrossings) {
        x = x / 2
        if (((lastepsilon < x) && (x < epsilon)) || ((epsilon < x) && (x < lastepsilon))) {
            do_recalculate()
        }
    }
    lastepsilon = epsilon
    requestAnimationFrame(do_update)
}

let Chain = class Chain { // a chain is an element on the free abelian group on simplices
    constructor(simplices, signs) {
        this.simplices = simplices
        this.signs = signs
    }
}

let Point = class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    d(x, y) {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2))
    }
}

function face(i, smplx) {
    return smplx.splice(i, 1);
}

function boundary(smplx) {
    let faces = []
    let signs = []
    for (let i = 0; i < this.n; n++) {
        faces.push(this.face(i))
        signs.push(i % 2 === 0 ? 1 : -1) // -1^i in the usual formula
    }
    return new Chain(
        faces,
        signs
    )
}


function drawSimplex(pts) { // draw a simplex from an array of point IDs
    ctx.beginPath()
    ctx.moveTo(points[pts[0]].x, points[pts[0]].y)
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(points[pts[i]].x, points[pts[i]].y)
    }
    if (pts.length > 2) {
        ctx.fillStyle = "rgba(20, 20, 255, 0.1)"
        ctx.fill()
    }
    ctx.strokeStyle = "rgb(40, 40, 40)"
    ctx.stroke()
}

function get_nsimplex_candidates_helper(n, k, j) {
    if (k === 1) {
        return _.range(j).map((x) => [x])
    }
    let v = []
    for (let i = k-1; i < j; i++) {

        let z = get_nsimplex_candidates_helper(n, k - 1, i)
        for (const x of z) {
            x.push(i)
        }
        v.push(...z)
    }
    return v
}

function get_nsimplex_candidates(n, k) {
    if ( k > n) {
        return []
    }
    if (k === 1) {
        return _.range(n).map((x) => [x])
    }
    let v = []
    for (let i = k-1; i < n; i++) {
        let z = get_nsimplex_candidates_helper(n, k - 1, i)
        for (const x of z) {
            x.push(i)
        }
        v.push(...z)
    }
    return v
}

function cartesian(n, k) {
    if (k === 1) {
        return _.range(n).map((x) => [x])
    }
    let v = []
    for (let i = 0; i < n; i++) {
        let z = cartesian(n, k - 1)
        for (const x of z) {
            x.push(i)
        }
        v.push(...z)
    }
    return v
}

function calcDistances() {
    distMatrix = []
    adjMatrix = []
    simplices[0] = []
    distMatrix = Array(points.length - 1).fill(0).map(() => new Array(points.length - 1).fill(0));
    adjMatrix = Array(points.length - 1).fill(0).map(() => new Array(points.length - 1).fill(() => 0));
    for (let i = 0; i < points.length; i++) {
        for (let k = i; k < points.length; k++) {
            if (i === k) {
                continue
            }
            let dist = points[i].d(points[k].x, points[k].y)

            distMatrix[i][k] = dist
            adjMatrix[i][k] = () => (dist < epsilon * 2 ? 1 : 0)
            distCrossings.push(dist)
        }
    }
    distCrossings = _.uniq(distCrossings)
}

function get_1simplices() {
    simplices[0] = []
    for (let i = 0; i < points.length; i++) {
        for (let k = i; k < points.length; k++) {
            if (i === k) {
                continue
            }
            if (distMatrix[i][k] < epsilon * 2) {
                simplices[0].push([i, k])
            }
        }
    }
}

function get_nsimplices(n) { // only for n > 2
    simplices[n - 1] = [];
    let candidates = get_nsimplex_candidates(points.length, n + 1)
    for (const cnd of candidates) {
        let found = 0

        for (let smplx of simplices[n - 2]) {
            if (_.isEqual(cnd.slice(1), smplx)) {
                found |= 1
            }
            if (_.isEqual(cnd.slice(0, cnd.length - 1), smplx)) {
                found |= 2
            }
        }
        for (let smplx of simplices[0]) {
            if (_.isEqual([cnd[0], cnd[cnd.length - 1]], smplx)) {
                found |= 4
            }
        }
        if (found === 7) {
            simplices[n - 1].push(cnd)
        }
    }
}


window.addEventListener('click', function (event) {
    let x = event.x - c.offsetLeft;
    let y = event.y - c.offsetTop;

    if (x < 0 || x > c.width || y < 0 || y > c.height) {
        return
    }
    if (interact_mode === "add") {
        //console.log("added " + points.length + "-th point")
        // calc offsets
        let p = new Point(x, y)
        points.push(p)

        calcDistances()
        get_1simplices()
        get_nsimplices(2)
        get_nsimplices(3)
    }
    if (interact_mode === "remove") {
        for (let i = 0; i < points.length; i++) {
            if (points[i].d(x, y) <= 5) {
                //console.log('removed ' + i + '-th point')
                points.splice(i, 1);
                calcDistances()
                get_1simplices()
                get_nsimplices(2)
                get_nsimplices(3)
                requestAnimationFrame(do_update)
                return
            }
        }
    }
    requestAnimationFrame(do_update)
})

function do_update(t) {
    //requestAnimationFrame(do_update)
    ctx.clearRect(0, 0, c.width, c.height)

    ctx.fillStyle = "rgb(220, 220, 220)"
    ctx.strokeStyle = "rgb(0, 0, 255)"
    for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, epsilon, 0, 2 * Math.PI, false)
        ctx.fill()
    }
    for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, epsilon, 0, 2 * Math.PI, false)
        ctx.stroke()
    }

    ctx.fillStyle = "rgb(0, 0, 0)"
    for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI, false)
        ctx.fill()
    }

    for (let i = 0; i < simplices.length; i++) {
        for (const splx of simplices[i]) {
            drawSimplex(splx)
        }
    }
}

//setInterval(function () {requestAnimationFrame(do_update)}, 500)
requestAnimationFrame(do_update)
