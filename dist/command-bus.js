"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
require("reflect-metadata");
const command_not_found_exception_1 = require("./exceptions/command-not-found.exception");
const index_1 = require("./index");
const constants_1 = require("./utils/constants");
const observable_bus_1 = require("./utils/observable-bus");
let CommandBus = class CommandBus extends observable_bus_1.ObservableBus {
    constructor() {
        super(...arguments);
        this.handlers = new Map();
        this.moduleRef = null;
    }
    setModuleRef(moduleRef) {
        this.moduleRef = moduleRef;
    }
    execute(command) {
        const handler = this.handlers.get(this.getCommandName(command));
        if (!handler) {
            throw new command_not_found_exception_1.CommandHandlerNotFoundException();
        }
        this.subject$.next(command);
        return handler.execute(command);
    }
    bind(handler, name) {
        this.handlers.set(name, handler);
    }
    register(handlers) {
        handlers.forEach(handler => this.registerHandler(handler));
    }
    registerHandler(handler) {
        if (!this.moduleRef) {
            throw new index_1.InvalidModuleRefException();
        }
        const instance = this.moduleRef.get(handler);
        if (!instance)
            return;
        const target = this.reflectCommandName(handler);
        if (!target) {
            throw new index_1.InvalidCommandHandlerException();
        }
        this.bind(instance, target.name);
    }
    getCommandName(command) {
        const { constructor } = Object.getPrototypeOf(command);
        return constructor.name;
    }
    reflectCommandName(handler) {
        return Reflect.getMetadata(constants_1.COMMAND_HANDLER_METADATA, handler);
    }
};
CommandBus = __decorate([
    common_1.Injectable()
], CommandBus);
exports.CommandBus = CommandBus;
