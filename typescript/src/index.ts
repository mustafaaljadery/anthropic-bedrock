import { AnthropicBedrock } from "./client";

const anthropic = new AnthropicBedrock();

const completion = anthropic.Completion.create({
  model: "Hellow orld",
  prompt: "What is this about?",
});

export default AnthropicBedrock;
