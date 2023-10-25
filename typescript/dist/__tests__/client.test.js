"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
describe("AnthropicBedrock", () => {
    it("should initialize without anything needed", () => {
        const anthropic = new client_1.AnthropicBedrock({});
        expect(anthropic).toBeInstanceOf(Object);
    });
    it("should initialize with only region", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-east-1",
        });
        expect(anthropic).toBeInstanceOf(Object);
    });
    it("should initialize with access key, secret key region", () => {
        const anthropic = new client_1.AnthropicBedrock({
            access_key: process.env["AWS_ACCESS_KEY"],
            secret_key: process.env["AWS_SECRET_KEY"],
            region: "us-east-1",
        });
        expect(anthropic).toBeInstanceOf(Object);
    });
    it("wrong region should error", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-west-5",
        });
        const completion = anthropic.Completion.create({
            model: "anthropic.claude-v2",
            prompt: "Hello world",
        });
        expect(completion).toThrowError();
    });
    it("invalid model", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-east-1",
        });
        const completion = anthropic.Completion.create({
            model: "anthropic.claude-v6",
            prompt: "Hello world",
        });
        expect(completion).toThrowError();
    });
    it("invalid temperature", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-east-1",
        });
        const completion = anthropic.Completion.create({
            model: "anthropic.claude-v2",
            prompt: "Hello world",
            temperature: 12,
        });
        expect(completion).toThrowError();
    });
    it("invalid top_p", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-east-1",
        });
        const completion = anthropic.Completion.create({
            model: "anthropic.claude-v2",
            prompt: "Hello world",
            top_p: 1000,
        });
        expect(completion).toThrowError();
    });
    it("invalid top_k", () => {
        const anthropic = new client_1.AnthropicBedrock({
            region: "us-east-1",
        });
        const completion = anthropic.Completion.create({
            model: "anthropic.claude-v2",
            prompt: "Hello world",
            top_k: 100,
        });
        expect(completion).toThrowError();
    });
});
