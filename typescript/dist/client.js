"use strict";
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
exports.AnthropicBedrock = void 0;
class AnthropicBedrock {
    constructor() {
        this.Completion = new Completion();
        this.ChatCompletion = new Chat();
    }
}
exports.AnthropicBedrock = AnthropicBedrock;
class Completion {
    constructor() { }
    check_model(model) {
        if (model != "" && model != "" && model != "") {
        }
    }
    check_max_tokens_to_sample(tokens) { }
    check_temperature(temperature) { }
    check_top_p(top_p) { }
    check_top_k(top_k) { }
    create_prompt(messages) {
        let prompt = "\n\n Human: you are a helpful assistant.";
        for (const message of messages) {
            if (message["role"] == "system") {
                prompt += `\n Assistant: ${message["content"]}`;
            }
            else if (message["role"] == "user") {
                prompt += `\n Human: ${message["content"]}`;
            }
            else {
                throw Error(`Got unknown role ${message["role"]}.`);
            }
        }
        prompt += "\n\n Assistant: ";
        return prompt;
    }
    create({ model, prompt, max_tokens_to_sample = 256, temperature = 1, top_p = 1, top_k = 250, stop_sequences = [], }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.check_model(model)]);
            console.log("done");
        });
    }
}
class Chat {
    constructor() { }
    check_model() { }
    check_max_tokens_to_sample() { }
    check_temperature() { }
    check_stop_sequences() { }
    check_top_p() { }
    check_top_k() { }
    create() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
