"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiplyCol = exports.replaceCol = exports.exchangeCols = exports.multiplyRow = exports.replaceRow = exports.exchangeRows = void 0;
const utils_1 = require("./utils");
const DefaultOptions = {
    offset: 0,
    copy: false,
    changeBase: true
};
const ElementaryOptions = {
    offset: 0,
    copy: false,
    changeBase: false
};
function exchangeRows(i, k, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    let tmp = result[i];
    result[i] = result[k];
    result[k] = tmp;
    const E = opts.changeBase ? exchangeRows(i, k, (0, utils_1.idMat)(result.length), ElementaryOptions)[0] : [];
    return [result, E, E];
}
exports.exchangeRows = exchangeRows;
function replaceRow(i, k, q, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    for (let j = opts.offset || 0; j < result[0].length; j++)
        result[i][j] += q * result[k][j];
    let E = [], Einv = [];
    if (opts.changeBase) {
        E = replaceRow(i, k, q, (0, utils_1.idMat)(result.length), ElementaryOptions)[0];
        Einv = replaceRow(i, k, -q, (0, utils_1.idMat)(result.length), ElementaryOptions)[0];
    }
    return [result, E, Einv];
}
exports.replaceRow = replaceRow;
function multiplyRow(i, q, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    result[i] = result[i].map(val => q * val);
    const E = opts.changeBase ? multiplyRow(i, q, (0, utils_1.idMat)(result.length), ElementaryOptions)[0] : [];
    return [result, E, E];
}
exports.multiplyRow = multiplyRow;
function exchangeCols(j, k, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    for (let i = 0; i < result.length; i++) {
        let tmp = result[i][j];
        result[i][j] = result[i][k];
        result[i][k] = tmp;
    }
    const E = opts.changeBase ? exchangeCols(j, k, (0, utils_1.idMat)(result[0].length), ElementaryOptions)[0] : [];
    return [result, E, E];
}
exports.exchangeCols = exchangeCols;
function replaceCol(j, k, q, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    for (let i = opts.offset || 0; i < result.length; i++)
        result[i][j] += q * result[i][k];
    let E = [], Einv = [];
    if (opts.changeBase) {
        E = replaceCol(j, k, q, (0, utils_1.idMat)(result[0].length), ElementaryOptions)[0];
        Einv = replaceCol(j, k, -q, (0, utils_1.idMat)(result[0].length), ElementaryOptions)[0];
    }
    return [result, E, Einv];
}
exports.replaceCol = replaceCol;
function multiplyCol(j, q, mat, options) {
    const opts = { ...DefaultOptions, ...options };
    const result = opts.copy ? (0, utils_1.copyMat)(mat) : mat;
    for (let i = 0; i < result.length; i++)
        result[i][j] *= q;
    const E = opts.changeBase ? multiplyCol(j, q, (0, utils_1.idMat)(result[0].length), ElementaryOptions)[0] : [];
    return [result, E, E];
}
exports.multiplyCol = multiplyCol;
