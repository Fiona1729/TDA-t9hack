"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalForm = void 0;
const utils_1 = require("./utils");
const elementary_ops_1 = require("./elementary-ops");
const utils_2 = require("./utils");
const DefaultNFOpts = {
    copy: true,
    changeBases: true,
    recordSteps: false
};
class NormalForm {
    A;
    n;
    m;
    P;
    Q;
    diag;
    D;
    steps;
    opts;
    Qinv;
    constructor(mat, options) {
        if (mat && mat.length === 0)
            throw new Error('Matrix is empty.');
        for (let row of mat)
            if (row.length === 0 || row.length !== mat[0].length)
                throw new Error('Matrix is malformed.');
        if ((0, utils_2.isZero)(mat))
            throw new Error('Matrix has all zero entries.');
        this.opts = { ...DefaultNFOpts, ...options };
        this.steps = [];
        this.A = (0, utils_1.copyMat)(mat);
        this.n = this.A.length;
        this.m = this.A[0].length;
        this.D = this.opts.copy ? (0, utils_1.copyMat)(mat) : mat;
        [this.P, this.Q, this.Qinv] = this.opts.changeBases ?
            [(0, utils_1.idMat)(this.m), (0, utils_1.idMat)(this.n), (0, utils_1.idMat)(this.n)] : [[], [], []];
        this.diag = new Array();
        this.reduce(0, Math.min(this.m, this.n));
    }
    isValid() {
        return (0, utils_1.equalMatrix)((0, utils_1.multiplyMat)(this.A, this.P), (0, utils_1.multiplyMat)(this.Q, this.D));
    }
    reduce(startOffset, endOffset) {
        if (startOffset >= endOffset || (0, utils_2.isZero)(this.D, startOffset))
            return;
        let [i, j] = this.improvePivot(startOffset);
        this.addStep({ name: "improvedPivot", pivot: [i, j], antiPivot: [], offset: startOffset });
        this.movePivot([i, j], startOffset);
        this.diagonalizePivot(startOffset);
        this.addStep({ name: "offset", offset: startOffset });
        this.diag.push(this.D[startOffset][startOffset]);
        this.reduce(startOffset + 1, endOffset);
    }
    improvePivot(offset) {
        let i, j;
        while (true) {
            [i, j] = (0, utils_2.findPivot)(this.D, offset);
            let antiPivot = (0, utils_2.findAntiPivot)([i, j], this.D, offset);
            if (antiPivot.length === 0)
                break;
            let [s, t] = antiPivot;
            this.addStep({ name: "improvePivot", pivot: [i, j], antiPivot: [s, t], offset: offset });
            if (j === t) {
                let q = -Math.floor(this.D[s][j] / this.D[i][j]);
                let [, E, Einv] = (0, elementary_ops_1.replaceRow)(s, i, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if (this.opts.changeBases) {
                    this.Q = (0, utils_1.multiplyMat)(this.Q, Einv);
                    this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
                }
                this.addStep({ name: "replaceRow", args: [s, i, q], offset: offset });
            }
            else if (i === s) {
                let q = -Math.floor(this.D[i][t] / this.D[i][j]);
                let [, E,] = (0, elementary_ops_1.replaceCol)(t, j, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if (this.opts.changeBases)
                    this.P = (0, utils_1.multiplyMat)(this.P, E);
                this.addStep({ name: "replaceCol", args: [t, j, q], offset: offset });
            }
            else {
                if (this.D[s][j] !== 0) {
                    let q = -Math.floor(this.D[s][j] / this.D[i][j]);
                    let [R, E, Einv] = (0, elementary_ops_1.replaceRow)(s, i, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                    if (this.opts.changeBases) {
                        this.Q = (0, utils_1.multiplyMat)(this.Q, Einv);
                        this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
                    }
                    this.addStep({ name: "replaceRow", args: [s, i, q], offset: offset });
                }
                let [R, E, Einv] = (0, elementary_ops_1.replaceRow)(i, s, 1, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if (this.opts.changeBases) {
                    this.Q = (0, utils_1.multiplyMat)(this.Q, Einv);
                    this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
                }
                this.addStep({ name: "replaceRow", args: [i, s, 1], offset: offset });
                let q = -Math.floor(this.D[i][t] / this.D[i][j]);
                [R, E, Einv] = (0, elementary_ops_1.replaceCol)(t, j, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if (this.opts.changeBases)
                    this.P = (0, utils_1.multiplyMat)(this.P, E);
                this.addStep({ name: "replaceCol", args: [t, j, q], offset: offset });
            }
        }
        return [i, j];
    }
    movePivot([i, j], offset) {
        if (i !== offset) {
            let [R, E, Einv] = (0, elementary_ops_1.exchangeRows)(offset, i, this.D, { changeBase: this.opts.changeBases });
            if (this.opts.changeBases) {
                this.Q = (0, utils_1.multiplyMat)(this.Q, Einv);
                this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
            }
            this.addStep({ name: "exchangeRows", args: [offset, i], offset: offset });
        }
        if (j !== offset) {
            let [R, E, Einv] = (0, elementary_ops_1.exchangeCols)(offset, j, this.D, { changeBase: this.opts.changeBases });
            if (this.opts.changeBases)
                this.P = (0, utils_1.multiplyMat)(this.P, E);
            this.addStep({ name: "exchangeCols", args: [offset, j], offset: offset });
        }
        if (this.D[offset][offset] < 0) {
            let [R, E, Einv] = (0, elementary_ops_1.multiplyRow)(offset, -1, this.D, { changeBase: this.opts.changeBases });
            if (this.opts.changeBases) {
                this.Q = (0, utils_1.multiplyMat)(this.Q, E);
                this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
            }
            this.addStep({ name: "multiplyRow", args: [offset, -1], offset: offset });
        }
    }
    diagonalizePivot(offset) {
        for (let i = offset + 1; i < this.n; i++) {
            if (this.D[i][offset] === 0)
                continue;
            let q = -Math.floor(this.D[i][offset] / this.D[offset][offset]);
            let [R, E, Einv] = (0, elementary_ops_1.replaceRow)(i, offset, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
            if (this.opts.changeBases) {
                this.Q = (0, utils_1.multiplyMat)(this.Q, Einv);
                this.Qinv = (0, utils_1.multiplyMat)(E, this.Qinv);
            }
            this.addStep({ name: "replaceRow", args: [i, offset], offset: offset });
        }
        for (let j = offset + 1; j < this.m; j++) {
            if (this.D[offset][j] === 0)
                continue;
            let q = -Math.floor(this.D[offset][j] / this.D[offset][offset]);
            let [R, E, Einv] = (0, elementary_ops_1.replaceCol)(j, offset, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
            if (this.opts.changeBases)
                this.P = (0, utils_1.multiplyMat)(this.P, E);
            this.addStep({ name: "replaceCol", args: [j, offset], offset: offset });
        }
    }
    addStep(step) {
        if (this.opts.recordSteps) {
            step.mat = (0, utils_1.copyMat)(this.D);
            this.steps.push(step);
        }
        return;
    }
}
exports.NormalForm = NormalForm;
