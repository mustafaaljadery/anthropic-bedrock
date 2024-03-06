import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@smithy/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import axios from "axios";
import { Credentials } from "@aws-sdk/types";
import { Tiktoken, TiktokenBPE } from 'js-tiktoken'
import claude from "./claude.json";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import axiosRetry from "axios-retry";

interface MessageProps {
  role: string;
  content: string;
}

interface ChatCreateProps {
  model: string;
  messages: MessageProps[];
  max_tokens_to_sample?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

interface CompletionCreateProps {
  model: string;
  prompt: string;
  max_tokens_to_sample?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

interface AnthropicBedrockProps {
  access_key?: string;
  secret_key?: string;
  region?: string;
  maxRetries?: number;
  timeout?: number;
}

export class AnthropicBedrock {
  public Completion: Completion;
  public ChatCompletion: Chat;

  constructor({
    access_key,
    secret_key,
    region,
    maxRetries = 2,
    timeout = 60 * 1000,
  }: AnthropicBedrockProps) {
    this.Completion = new Completion(
      access_key,
      secret_key,
      region,
      maxRetries,
      timeout
    );
    this.ChatCompletion = new Chat(
      access_key,
      secret_key,
      region,
      maxRetries,
      timeout
    );
  }

  public countTokens(text: string) {
    const tokenizer = new Tiktoken({
      bpe_ranks: claude.bpe_ranks,
      special_tokens: claude.special_tokens,
      pat_str: claude.pat_str,
    } as TiktokenBPE);
    const encoded = tokenizer.encode(text.normalize('NFKC'), 'all')
    return encoded.length
  }
}

class Completion {
  private access_key: string | undefined;
  private secret_key: string | undefined;
  private region: string | undefined;
  private axiosInstance;

  constructor(
    access_key: string | undefined,
    secret_key: string | undefined,
    region: string | undefined,
    retries: number,
    timeout: number
  ) {
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.region = region || "us-east-1";

    this.axiosInstance = axios.create({
      baseURL: `https://bedrock-runtime.${this.region}.amazonaws.com/model/`,
      timeout: timeout,
    });

    axiosRetry(this.axiosInstance, {
      retries: retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkError(error);
      },
    });
  }

  private async auth_headers(
    access_key: string | undefined,
    secret_key: string | undefined,
    model: string,
    region: string | undefined,
    prompt: string,
    max_tokens_to_sample: number,
    temperature: number,
    top_k: number,
    top_p: number,
    stop_sequences: string[],
    stream: boolean
  ) {
    let credentials: Credentials | any;
    if (!access_key || !secret_key) {
      credentials = fromNodeProviderChain();
    } else {
      credentials = {
        accessKeyId: access_key,
        secretAccessKey: secret_key,
      };
    }

    const signer = new SignatureV4({
      service: "bedrock",
      region: region || "us-east-1",
      credentials: credentials,
      sha256: Sha256,
    });

    const headers = {
      host: `bedrock-runtime.${region}.amazonaws.com`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const request = new HttpRequest({
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

    const signed = await signer.sign(request, {
      signingDate: new Date(),
    });

    return {
      headers: signed.headers,
      body: signed.body,
    };
  }

  private check_model(model: string) {
    if (
      model != "anthropic.claude-v1" &&
      model != "anthropic.claude-v2" &&
      model != "anthropic.claude-v2:1" &&
      model != "anthropic.claude-3-sonnet-20240229-v1:0" &&
      model != "anthropic.claude-instant-v1"
    ) {
      throw Error(`Model ${model} not found.`);
    }
  }
  private check_max_tokens_to_sample(tokens: number) {
    if (tokens < 0) {
      throw Error(`max_tokens_to_sample: ${tokens} is less than 0.`);
    }
  }
  private check_temperature(temperature: number) {
    if (temperature < 0) {
      throw Error(`temperature: ${temperature} is less than 0.`);
    } else if (temperature > 1) {
      throw Error(`temperature: ${temperature} is greater than 1.`);
    }
  }
  private check_top_p(top_p: number) {
    if (top_p < 0) {
      throw Error(`top_p: ${top_p} is less than 0.`);
    } else if (top_p > 1) {
      throw Error(`top_p: ${top_p} is greater than 1.`);
    }
  }
  private check_top_k(top_k: number) {
    if (top_k < 0) {
      throw Error(`top_k: ${top_k} is less than 0.`);
    } else if (top_k > 500) {
      throw Error(`top_k: ${top_k} is greater than 500.`);
    }
  }

  private create_prompt(prompt: string) {
    let text = `\n\nHuman: ${prompt}

    \n\nAssistant: `;
    return text;
  }

  public async create({
    model,
    prompt,
    max_tokens_to_sample = 256,
    temperature = 1,
    top_p = 1,
    top_k = 250,
    stop_sequences = [],
    stream = false,
  }: CompletionCreateProps) {
    Promise.all([
      this.check_model(model),
      this.check_max_tokens_to_sample(max_tokens_to_sample),
      this.check_temperature(temperature),
      this.check_top_p(top_p),
      this.check_top_k(top_k),
    ]);

    prompt = this.create_prompt(prompt);

    const aws_signer = await this.auth_headers(
      this.access_key,
      this.secret_key,
      model,
      this.region,
      prompt,
      max_tokens_to_sample,
      temperature,
      top_k,
      top_p,
      stop_sequences,
      stream
    );

    if (stream) {
      const response = await this.axiosInstance.post(
        `${model}/invoke-with-response-stream`,
        aws_signer.body,
        {
          responseType: "stream",
          headers: aws_signer.headers,
        }
      );

      return response.data;
    } else {
      const result = await this.axiosInstance.post(
        `${model}/invoke`,
        aws_signer.body,
        {
          headers: aws_signer.headers,
        }
      );
      return result.data;
    }
  }
}

class Chat {
  private access_key: string | undefined;
  private secret_key: string | undefined;
  private region: string | undefined;
  private axiosInstance;

  constructor(
    access_key: string | undefined,
    secret_key: string | undefined,
    region: string | undefined,
    retries: number,
    timeout: number
  ) {
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.region = region;

    this.axiosInstance = axios.create({
      baseURL: `https://bedrock-runtime.${this.region}.amazonaws.com/model/`,
      timeout: timeout,
    });

    axiosRetry(this.axiosInstance, {
      retries: retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkError(error);
      },
    });
  }

  private async auth_headers(
    access_key: string | undefined,
    secret_key: string | undefined,
    model: string,
    region: string | undefined,
    prompt: string,
    max_tokens_to_sample: number,
    temperature: number,
    top_k: number,
    top_p: number,
    stop_sequences: string[]
  ) {
    let credentials: Credentials | any;
    if (!access_key || !secret_key) {
      credentials = fromNodeProviderChain();
    } else {
      credentials = {
        accessKeyId: access_key,
        secretAccessKey: secret_key,
      };
    }

    const signer = new SignatureV4({
      service: "bedrock",
      region: region || "us-east-1",
      credentials: credentials,
      sha256: Sha256,
    });

    const headers = {
      host: `bedrock-runtime.${region}.amazonaws.com`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const request = new HttpRequest({
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

    const signed = await signer.sign(request, {
      signingDate: new Date(),
    });

    return {
      headers: signed.headers,
      body: signed.body,
    };
  }

  private check_model(model: string) {
    if (
      model != "anthropic.claude-v1" &&
      model != "anthropic.claude-v2" &&
      model != "anthropic.claude-v2:1" &&
      model != "anthropic.claude-3-sonnet-20240229-v1:0" &&      
      model != "anthropic.claude-instant-v1"
    ) {
      throw Error(`Model ${model} not found.`);
    }
  }
  private check_max_tokens_to_sample(tokens: number) {
    if (tokens < 0) {
      throw Error(`max_tokens_to_sample: ${tokens} is less than 0.`);
    }
  }
  private check_temperature(temperature: number) {
    if (temperature < 0) {
      throw Error(`temperature: ${temperature} is less than 0.`);
    } else if (temperature > 1) {
      throw Error(`temperature: ${temperature} is greater than 1.`);
    }
  }
  private check_top_p(top_p: number) {
    if (top_p < 0) {
      throw Error(`top_p: ${top_p} is less than 0.`);
    } else if (top_p > 1) {
      throw Error(`top_p: ${top_p} is greater than 1.`);
    }
  }
  private check_top_k(top_k: number) {
    if (top_k < 0) {
      throw Error(`top_k: ${top_k} is less than 0.`);
    } else if (top_k > 500) {
      throw Error(`top_k: ${top_k} is greater than 500.`);
    }
  }

  private create_prompt(messages: MessageProps[]) {
    let prompt = "\n\nHuman: you are a helpful assistant.";

    for (const message of messages) {
      if (message["role"] == "system") {
        prompt += `\n Assistant: ${message["content"]}`;
      } else if (message["role"] == "user") {
        prompt += `\n Human: ${message["content"]}`;
      } else {
        throw Error(`Got unknown role ${message["role"]}.`);
      }
    }

    prompt += "\nAssistant: ";

    return prompt;
  }

  public async create({
    model,
    messages,
    max_tokens_to_sample = 256,
    temperature = 1,
    top_p = 1,
    top_k = 250,
    stop_sequences = [],
    stream = false,
  }: ChatCreateProps) {
    Promise.all([
      this.check_model(model),
      this.check_max_tokens_to_sample(max_tokens_to_sample),
      this.check_temperature(temperature),
      this.check_top_p(top_p),
      this.check_top_k(top_k),
    ]);

    const prompt = this.create_prompt(messages);

    const aws_signer = await this.auth_headers(
      this.access_key,
      this.secret_key,
      model,
      this.region,
      prompt,
      max_tokens_to_sample,
      temperature,
      top_k,
      top_p,
      stop_sequences
    );

    const result = await this.axiosInstance.post(
      `${model}/invoke`,
      aws_signer.body,
      {
        headers: aws_signer.headers,
      }
    );

    let msgs = messages;
    msgs.push({
      role: "system",
      content: result.data["completion"],
    });

    return {
      messages: msgs,
      stop_reason: result.data["stop_reason"],
    };
  }
}
