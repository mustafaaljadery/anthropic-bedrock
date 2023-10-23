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
}

interface CompletionCreateProps {
  model: string;
  prompt: string;
  max_tokens_to_sample?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

interface AnthropicBedrockProps {}

export class AnthropicBedrock {
  public Completion: Completion;
  public ChatCompletion: Chat;

  constructor() {
    this.Completion = new Completion();
    this.ChatCompletion = new Chat();
  }
}

class Completion {
  private bedrock_client: any;

  constructor() {}
  private check_model(model: string) {
    if (
      model != "anthropic.claude-v1" &&
      model != "anthropic.claude-v2" &&
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
    let text = "";
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
  }: CompletionCreateProps) {
    await Promise.all([
      this.check_model(model),
      this.check_max_tokens_to_sample(max_tokens_to_sample),
      this.check_temperature(temperature),
      this.check_top_p(top_p),
      this.check_top_k(top_k),
    ]);
  }
}

class Chat {
  private bedrock_client: any;
  constructor() {}

  private check_model() {}
  private check_max_tokens_to_sample() {}
  private check_temperature() {}
  private check_stop_sequences() {}
  private check_top_p() {}
  private check_top_k() {}

  private create_prompt(messages: MessageProps[]) {
    let prompt = "\n\n Human: you are a helpful assistant.";

    for (const message of messages) {
      if (message["role"] == "system") {
        prompt += `\n Assistant: ${message["content"]}`;
      } else if (message["role"] == "user") {
        prompt += `\n Human: ${message["content"]}`;
      } else {
        throw Error(`Got unknown role ${message["role"]}.`);
      }
    }
  }

  public async create({}: ChatCreateProps) {}
}
