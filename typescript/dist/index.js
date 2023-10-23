"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const anthropic = new client_1.AnthropicBedrock();
anthropic.Completion.create({
    model: "Hellow orld",
    prompt: "What is this about?",
});
exports.default = client_1.AnthropicBedrock;
