"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.improvePivot = exports.findPivot = exports.findAntiPivot = exports.isZero = exports.equalMatrix = exports.multiplyMat = exports.copyMat = exports.idMat = exports.changeBasis = exports.vec2Tex = exports.mat2Tex = void 0;
const elementary_ops_1 = require("./elementary-ops");
function mat2Tex(mat) {
    const string = mat.map((row) => {
        return row.map((col) => col).join(' & ');
    }).join(" \\\\ ");
    const s = `\\left(\\begin{matrix}
      ${string}
    \\end{matrix}\\right)`;
    const ss = s.replace('/\/\g', '\\');
    return ss;
}
exports.mat2Tex = mat2Tex;
function vec2Tex(vec) {
    const string = "\\left(" + vec.join(', ') + "\\right)";
    const ss = string.replace('/\/\g', '\\');
    return ss;
}
exports.vec2Tex = vec2Tex;
function changeBasis(oldBasis, basechangeMat) {
    const newBasis = [];
    const dim = oldBasis.length;
    for (let j = 0; j < dim; j++) {
        let string = '';
        for (let i = 0; i < dim; i++) {
            const entry = basechangeMat[i][j];
            if (entry === 0)
                continue;
            else if (entry === 1)
                string += '+' + oldBasis[i];
            else if (entry === -1)
                string += '-' + oldBasis[i];
            else if (entry > 1)
                string += '+' + entry + oldBasis[i];
            else
                string += '-' + Math.abs(entry) + oldBasis[i];
        }
        if (string[0] === '+')
            string = string.slice(1);
        newBasis[j] = string;
    }
    return newBasis;
}
exports.changeBasis = changeBasis;
function idMat(size) {
    let mat = new Array(size);
    for (let i = 0; i < size; i++) {
        let col = new Array(size);
        for (let j = 0; j < size; j++)
            col[j] = 0;
        col[i] = 1;
        mat[i] = col;
    }
    return mat;
}
exports.idMat = idMat;
function copyMat(mat) {
    return mat.map(col => {
        return col.slice();
    });
}
exports.copyMat = copyMat;
function multiplyMat(A, B) {
    if (A[0].length !== B.length)
        throw new Error('Matrix dimension mismatch.');
    let prod = new Array(A.length);
    for (let i = 0; i < A.length; i++) {
        prod[i] = new Array(B[0].length);
    }
    for (let i = 0; i < A.length; i++)
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
                if (!Number.isSafeInteger(sum))
                    throw new Error('Integers too big.');
            }
            prod[i][j] = sum;
        }
    return prod;
}
exports.multiplyMat = multiplyMat;
function equalMatrix(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        return false;
    }
    for (let i = 0; i < A.length; i++)
        for (let j = 0; j < A[0].length; j++)
            if (A[i][j] !== B[i][j]) {
                return false;
            }
    return true;
}
exports.equalMatrix = equalMatrix;
function isZero(mat, offset = 0) {
    for (let i = offset; i < mat.length; i++)
        for (let j = offset; j < mat[0].length; j++) {
            if (!Number.isSafeInteger(mat[i][j]))
                throw new Error('Integers too big.');
            if (mat[i][j] !== 0)
                return false;
        }
    return true;
}
exports.isZero = isZero;
function findAntiPivot([s, t], mat, offset) {
    let alpha = Math.abs(mat[s][t]);
    for (let i = offset; i < mat.length; i++)
        for (let j = offset; j < mat[0].length; j++) {
            if (mat[i][j] % alpha !== 0) {
                return [i, j];
            }
        }
    return [];
}
exports.findAntiPivot = findAntiPivot;
function findPivot(mat, offset) {
    if (mat.length === offset)
        throw new Error('Matrix must be non-empty.');
    let min = Number.MAX_VALUE;
    let pos = new Array(2);
    for (let i = offset; i < mat.length; i++) {
        if (mat[i].length === offset)
            throw new Error('Column must be non-empty.');
        for (let j = offset; j < mat[0].length; j++) {
            if (!Number.isInteger(mat[i][j]))
                throw new Error('Matrix can not have non-integer values.');
            let elm = mat[i][j];
            if (Math.abs(elm) > 0 && Math.abs(min) > Math.abs(elm)) {
                min = elm;
                pos = [i, j];
            }
        }
    }
    if (min === Number.MAX_VALUE)
        throw new Error('Matrix can not have all zeros.');
    return pos;
}
exports.findPivot = findPivot;
function improvePivot(pivot, antiPivot, mat, offset = 0) {
    const [i, j] = pivot;
    mat = copyMat(mat);
    if (antiPivot.length === 0)
        return mat;
    const [s, t] = antiPivot;
    if (j === t) {
        let q = -Math.floor(mat[s][j] / mat[i][j]);
        (0, elementary_ops_1.replaceRow)(s, i, q, mat, { offset: offset });
    }
    else if (i === s) {
        let q = -Math.floor(mat[i][t] / mat[i][j]);
        (0, elementary_ops_1.replaceCol)(t, j, q, mat, { offset: offset });
    }
    else {
        if (mat[s][j] !== 0) {
            let q = -Math.floor(mat[s][j] / mat[i][j]);
            (0, elementary_ops_1.replaceRow)(s, i, q, mat, { offset: offset });
        }
        (0, elementary_ops_1.replaceRow)(i, s, 1, mat, { offset: offset });
        let q = -Math.floor(mat[i][t] / mat[i][j]);
        (0, elementary_ops_1.replaceCol)(t, j, q, mat, { offset: offset });
    }
    return mat;
}
exports.improvePivot = improvePivot;
