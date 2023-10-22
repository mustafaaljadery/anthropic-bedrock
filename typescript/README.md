# Anthropic Bedrock Typescript SDK

`anthropic-bedrock` is a typescript library for interacting with Anthropic's models on AWS bedorck. It makes it really easy to use Anthropic's models in your application.

Created by: [Mustafa Aljadery](https://www.maxaljadery.com/) & [Siddharth Sharma](https://stanford.edu/~sidshr/).

Complete [Docs](https://www.anthropic-bedrock.com/)

## Installation

Install using npm.

```bash copy
npm install anthropic-bedrock
```

Install using yarn.

```bash copy
yarn add anthropic-bedrock
```

Install using pnpm.

```bash copy
pnpm add anthropic-bedrock
```

## Authetication

This is an example using access & secret keys. For more authentication examples, refer to the [docs](https://www.anthropic-bedrock.com/).

```typescript copy
import AnthropicBedrock from "anthropic-bedrock";

const anthropic = new AnthropicBedrock({
  access_key: process.env["AWS_ACCESS_KEY"],
  secret_key: process.env["AWS_SECRET_KEY"],
});
```

## Example

```typescript copy
import AnthropicBedrock from "anthropic-bedrock";

const anthropic = new AnthropicBedrock({
    access_key: process.env["AWS_ACCESS_KEY"],
    secret_key: process.env["AWS_SECRET_KEY"],
});

async function main() {
    const completion = await anthropic.Completion.create(
        model: "anthropic.claude-v2",
        prompt: "Why is the sky blue?",
        max_tokens_to_sample: 300
    )

    console.log(completion["completion"]);
}

main();
```

## Response

```markdown
There are a few main reasons why the sky appears blue:

- Rayleigh scattering - Light from the sun is scattered by nitrogen and oxygen molecules in the atmosphere. Shorter wavelengths like blue and violet are scattered more easily than longer wavelengths, making the sky appear blue.

- The composition of the atmosphere - Nitrogen and oxygen account for most of the atmosphere. These gases are efficient at scattering blue light.

- The angle of the sun - The sky appears blue during the day but red/orange during sunrise and sunset because of the angle sunlight has to pass through the atmosphere. More blue light is scattered away from the line of sight when the sun is higher overhead.

- Water and dust - Additional scattering by water and dust particles in the atmosphere can also contribute to the blue color.

So in summary, the main factors are Rayleigh scattering by air molecules that preferentially scatters blue light, the gases that make up our atmosphere, and the angle/amount of atmosphere sunlight has to pass through. This gives the sky its familiar blue hue during the day.
```
