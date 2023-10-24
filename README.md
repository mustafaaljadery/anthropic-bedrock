# Anthropic Bedrock

SDKs for Anthropic on AWS Bedrock

By [Mustafa Aljadery](https://www.maxaljadery.com/) & [Siddharth Sharma](https://stanford.edu/~sidshr/).

There are two SDKs, one for Python and the other for NodeJS. The goal is to make it extremely easy to build using Anthropic's models. Anthropic's models have amazing features not avaiable in other models, and example is the 100k context length. You can upload an entire book to Claude and chat with it.

## Features

This SDK supports all of these features out the box:

- Text completion
- Chat with context history
- Count tokens & estimate price
- Streaming
- Async functions

## Python Overview

In this example we use the Python SDK to

```python
import os
from bedrock_anthropic import AnthropicBedrock

anthropic = AnthropicBedrock(
    access_key=os.getenv("AWS_ACCESS_KEY"),
    secret_key=os.getenv("AWS_SECRET_KEY")
)

completion = anthropic.Completion.create(
    model="anthropic.claude-v2",
    prompt="In one sentence, what is good about the color blue?",
)

print(completion["completion"])
```

## Typescript Overview

In this example we use the Typescript SDK to get started with Claude 2 on AWS Bedrock.

```typescript
import Anthropic from "anthropic-bedrock";

const anthropic = new Anthropic({
  access_key: process.env["AWS_ACCESS_KEY"],
  secret_key: process.env["AWS_SECRET_KEY"],
});

async function main() {
    const completion = await anthropic.Completion.create(
        model: "anthropic.claude-v2",
        prompt: "In one sentence, what is good about the color blue?"
    )

    console.log(completion["completion"])
}

main();
```

## Credits

Check out the following for updates:

- Follow [Mustafa](https://twitter.com/maxaljadery) & [Sid](https://twitter.com/siddrrsh) on Twitter for updates.
- Contribute on [GitHub](https://github.com/mustafaaljadery/anthropic-bedrock).
