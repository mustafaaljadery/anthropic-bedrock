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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicBedrock = void 0;
const signature_v4_1 = require("@smithy/signature-v4");
const protocol_http_1 = require("@smithy/protocol-http");
const sha256_js_1 = require("@aws-crypto/sha256-js");
const axios_1 = __importDefault(require("axios"));
const js_tiktoken_1 = require("js-tiktoken");
const claude_json_1 = __importDefault(require("./claude.json"));
const credential_providers_1 = require("@aws-sdk/credential-providers");
const axios_retry_1 = __importDefault(require("axios-retry"));
class AnthropicBedrock {
    constructor({ access_key, secret_key, region, maxRetries = 2, timeout = 60 * 1000, }) {
        this.Completion = new Completion(access_key, secret_key, region, maxRetries, timeout);
        this.ChatCompletion = new Chat(access_key, secret_key, region, maxRetries, timeout);
    }
    countTokens(text) {
        const tokenizer = new js_tiktoken_1.Tiktoken({
            bpe_ranks: claude_json_1.default.bpe_ranks,
            special_tokens: claude_json_1.default.special_tokens,
            pat_str: claude_json_1.default.pat_str,
        });
        const encoded = tokenizer.encode(text.normalize('NFKC'), 'all');
        return encoded.length;
    }
}
exports.AnthropicBedrock = AnthropicBedrock;
class Completion {
    constructor(access_key, secret_key, region, retries, timeout) {
        this.access_key = access_key;
        this.secret_key = secret_key;
        this.region = region || "us-east-1";
        this.axiosInstance = axios_1.default.create({
            baseURL: `https://bedrock-runtime.${this.region}.amazonaws.com/model/`,
            timeout: timeout,
        });
        (0, axios_retry_1.default)(this.axiosInstance, {
            retries: retries,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkError(error);
            },
        });
    }
    auth_headers(access_key, secret_key, model, region, prompt, max_tokens_to_sample, temperature, top_k, top_p, stop_sequences, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials;
            if (!access_key || !secret_key) {
                credentials = (0, credential_providers_1.fromNodeProviderChain)();
            }
            else {
                credentials = {
                    accessKeyId: access_key,
                    secretAccessKey: secret_key,
                };
            }
            const signer = new signature_v4_1.SignatureV4({
                service: "bedrock",
                region: region || "us-east-1",
                credentials: credentials,
                sha256: sha256_js_1.Sha256,
            });
            const headers = {
                host: `bedrock-runtime.${region}.amazonaws.com`,
                "Content-Type": "application/json",
                Accept: "application/json",
            };
            const request = new protocol_http_1.HttpRequest({
                method: "POST",
                path: stream
                    ? `/model/${model}/invoke-with-response-stream`
                    : `/model/${model}/invoke`,
                hostname: `bedrock-runtime.${region}.amazonaws.com`,
                headers,
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens_to_sample: max_tokens_to_sample,
                    temperature: temperature,
                    top_k: top_k,
                    top_p: top_p,
                    stop_sequences: stop_sequences,
                    anthropic_version: "bedrock-2023-05-31",
                }),
            });
            const signed = yield signer.sign(request, {
                signingDate: new Date(),
            });
            return {
                headers: signed.headers,
                body: signed.body,
            };
        });
    }
    check_model(model) {
        if (model != "anthropic.claude-v1" &&
            model != "anthropic.claude-v2" &&
            model != "anthropic.claude-v2:1" &&
            model != "anthropic.claude-instant-v1") {
            throw Error(`Model ${model} not found.`);
        }
    }
    check_max_tokens_to_sample(tokens) {
        if (tokens < 0) {
            throw Error(`max_tokens_to_sample: ${tokens} is less than 0.`);
        }
    }
    check_temperature(temperature) {
        if (temperature < 0) {
            throw Error(`temperature: ${temperature} is less than 0.`);
        }
        else if (temperature > 1) {
            throw Error(`temperature: ${temperature} is greater than 1.`);
        }
    }
    check_top_p(top_p) {
        if (top_p < 0) {
            throw Error(`top_p: ${top_p} is less than 0.`);
        }
        else if (top_p > 1) {
            throw Error(`top_p: ${top_p} is greater than 1.`);
        }
    }
    check_top_k(top_k) {
        if (top_k < 0) {
            throw Error(`top_k: ${top_k} is less than 0.`);
        }
        else if (top_k > 500) {
            throw Error(`top_k: ${top_k} is greater than 500.`);
        }
    }
    create_prompt(prompt) {
        let text = `\n\nHuman: ${prompt}

    \n\nAssistant: `;
        return text;
    }
    create({ model, prompt, max_tokens_to_sample = 256, temperature = 1, top_p = 1, top_k = 250, stop_sequences = [], stream = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.all([
                this.check_model(model),
                this.check_max_tokens_to_sample(max_tokens_to_sample),
                this.check_temperature(temperature),
                this.check_top_p(top_p),
                this.check_top_k(top_k),
            ]);
            prompt = this.create_prompt(prompt);
            const aws_signer = yield this.auth_headers(this.access_key, this.secret_key, model, this.region, prompt, max_tokens_to_sample, temperature, top_k, top_p, stop_sequences, stream);
            if (stream) {
                const response = yield this.axiosInstance.post(`${model}/invoke-with-response-stream`, aws_signer.body, {
                    responseType: "stream",
                    headers: aws_signer.headers,
                });
                return response.data;
            }
            else {
                const result = yield this.axiosInstance.post(`${model}/invoke`, aws_signer.body, {
                    headers: aws_signer.headers,
                });
                return result.data;
            }
        });
    }
}
class Chat {
    constructor(access_key, secret_key, region, retries, timeout) {
        this.access_key = access_key;
        this.secret_key = secret_key;
        this.region = region;
        this.axiosInstance = axios_1.default.create({
            baseURL: `https://bedrock-runtime.${this.region}.amazonaws.com/model/`,
            timeout: timeout,
        });
        (0, axios_retry_1.default)(this.axiosInstance, {
            retries: retries,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkError(error);
            },
        });
    }
    auth_headers(access_key, secret_key, model, region, prompt, max_tokens_to_sample, temperature, top_k, top_p, stop_sequences) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials;
            if (!access_key || !secret_key) {
                credentials = (0, credential_providers_1.fromNodeProviderChain)();
            }
            else {
                credentials = {
                    accessKeyId: access_key,
                    secretAccessKey: secret_key,
                };
            }
            const signer = new signature_v4_1.SignatureV4({
                service: "bedrock",
                region: region || "us-east-1",
                credentials: credentials,
                sha256: sha256_js_1.Sha256,
            });
            const headers = {
                host: `bedrock-runtime.${region}.amazonaws.com`,
                "Content-Type": "application/json",
                Accept: "application/json",
            };
            const request = new protocol_http_1.HttpRequest({
                method: "POST",
                path: `/model/${model}/invoke`,
                hostname: `bedrock-runtime.${region}.amazonaws.com`,
                headers,
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens_to_sample: max_tokens_to_sample,
                    temperature: temperature,
                    top_k: top_k,
                    top_p: top_p,
                    stop_sequences: stop_sequences,
                    anthropic_version: "bedrock-2023-05-31",
                }),
            });
            const signed = yield signer.sign(request, {
                signingDate: new Date(),
            });
            return {
                headers: signed.headers,
                body: signed.body,
            };
        });
    }
    check_model(model) {
        if (model != "anthropic.claude-v1" &&
            model != "anthropic.claude-v2" &&
            model != "anthropic.claude-v2:1" &&
            model != "anthropic.claude-instant-v1") {
            throw Error(`Model ${model} not found.`);
        }
    }
    check_max_tokens_to_sample(tokens) {
        if (tokens < 0) {
            throw Error(`max_tokens_to_sample: ${tokens} is less than 0.`);
        }
    }
    check_temperature(temperature) {
        if (temperature < 0) {
            throw Error(`temperature: ${temperature} is less than 0.`);
        }
        else if (temperature > 1) {
            throw Error(`temperature: ${temperature} is greater than 1.`);
        }
    }
    check_top_p(top_p) {
        if (top_p < 0) {
            throw Error(`top_p: ${top_p} is less than 0.`);
        }
        else if (top_p > 1) {
            throw Error(`top_p: ${top_p} is greater than 1.`);
        }
    }
    check_top_k(top_k) {
        if (top_k < 0) {
            throw Error(`top_k: ${top_k} is less than 0.`);
        }
        else if (top_k > 500) {
            throw Error(`top_k: ${top_k} is greater than 500.`);
        }
    }
    create_prompt(messages) {
        let prompt = "\n\nHuman: you are a helpful assistant.";
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
        prompt += "\nAssistant: ";
        return prompt;
    }
    create({ model, messages, max_tokens_to_sample = 256, temperature = 1, top_p = 1, top_k = 250, stop_sequences = [], stream = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.all([
                this.check_model(model),
                this.check_max_tokens_to_sample(max_tokens_to_sample),
                this.check_temperature(temperature),
                this.check_top_p(top_p),
                this.check_top_k(top_k),
            ]);
            const prompt = this.create_prompt(messages);
            const aws_signer = yield this.auth_headers(this.access_key, this.secret_key, model, this.region, prompt, max_tokens_to_sample, temperature, top_k, top_p, stop_sequences);
            const result = yield this.axiosInstance.post(`${model}/invoke`, aws_signer.body, {
                headers: aws_signer.headers,
            });
            let msgs = messages;
            msgs.push({
                role: "system",
                content: result.data["completion"],
            });
            return {
                messages: msgs,
                stop_reason: result.data["stop_reason"],
            };
        });
    }
}
