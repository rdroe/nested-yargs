"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deps = exports.isNode = exports.store = exports.loop = exports.post = exports.get = exports.repl = exports.hooks = exports.program = exports.match = exports.cache = void 0;
const setUp = __importStar(require("./src/setUp"));
const loop_ = __importStar(require("./src/loop"));
const hooks_ = __importStar(require("./src/hooks"));
const store_ = __importStar(require("./src/lib/store"));
var commands_1 = require("./src/commands");
Object.defineProperty(exports, "cache", { enumerable: true, get: function () { return commands_1.cache; } });
Object.defineProperty(exports, "match", { enumerable: true, get: function () { return commands_1.match; } });
Object.defineProperty(exports, "program", { enumerable: true, get: function () { return commands_1.program; } });
exports.default = setUp;
exports.hooks = hooks_;
var setUp_1 = require("./src/setUp");
Object.defineProperty(exports, "repl", { enumerable: true, get: function () { return setUp_1.repl; } });
var call_1 = require("./src/lib/api/call");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return call_1.get; } });
Object.defineProperty(exports, "post", { enumerable: true, get: function () { return call_1.post; } });
exports.loop = loop_;
exports.store = store_;
exports.isNode = new Function("try {return this===global;}catch(e){return false;}");
__exportStar(require("./src/lib/input/server"), exports);
const depsRef = {} = {};
if (exports.isNode()) {
}
const getDeps = (dn) => __awaiter(void 0, void 0, void 0, function* () {
    if (!depsRef[dn])
        throw new Error(`No dep available at ${dn}`);
    return depsRef[dn].then((resolvedDep) => {
        if (resolvedDep.default)
            return resolvedDep.default;
        return resolvedDep;
    });
});
exports.deps = ({
    get: getDeps,
    set: (depName, newDep) => {
        depsRef[depName] = newDep;
    }
});
//# sourceMappingURL=index.js.map