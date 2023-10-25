import bedrock_anthropic
from bedrock_anthropic import AnthropicBedrock
from bedrock_anthropic import AsyncAnthropicBedrock
import unittest
import os

class MyClassTests(unittest.TestCase):
    
    def initialize_without_anything(self):
        anthropic = AnthropicBedrock()
        self.assertIsInstance(anthropic, bedrock_anthropic.client.AnthropicBedrock)

    def initialize_with_only_region(self):
        anthropic = AnthropicBedrock(
            region="us-east-1"
        )
        self.assertIsInstance(anthropic, bedrock_anthropic.client.AnthropicBedrock)
    
    def initialize_with_keys(self):
        anthropic = AnthropicBedrock(
            access_key=os.getenv("AWS_ACCESS_KEY"),
            secret_key=os.getenv("AWS_SECRET_KEY"),
            region=os.getenv("REGION")
        )
        self.assertIsInstance(anthropic, bedrock_anthropic.client.AnthropicBedrock)
    
    def wrong_region(self):
        with self.assertRaises(ValueError):
            anthropic = AnthropicBedrock(
                access_key=os.getenv("AWS_ACCESS_KEY"),
                secret_key=os.getenv("AWS_SECRET_KEY"),
                region=os.getenv("REGION")
            )

            completion = anthropic.Completion.create(
                model="anthropic.claude-v2",
                prompt="In one sentence, what is good about the color blue?",
            )

            print(completion['completion'])
    
    def invalid_model(self):
        with self.assertRaises(ValueError):
            anthropic = AnthropicBedrock(
                access_key=os.getenv("AWS_ACCESS_KEY"),
                secret_key=os.getenv("AWS_SECRET_KEY"),
                region=os.getenv("REGION")
            )

            completion = anthropic.Completion.create(
                model="anthropic.claude-v6",
                prompt="In one sentence, what is good about the color blue?",
            )

            print(completion['completion'])

    def invalid_temperature(self):
         with self.assertRaises(ValueError):
            anthropic = AnthropicBedrock(
                access_key=os.getenv("AWS_ACCESS_KEY"),
                secret_key=os.getenv("AWS_SECRET_KEY"),
                region=os.getenv("REGION")
            )

            completion = anthropic.Completion.create(
                model="anthropic.claude-v2",
                prompt="In one sentence, what is good about the color blue?",
                temperature=12
            )

            print(completion['completion'])

    def invalid_top_p(self):
        with self.assertRaises(ValueError):
            anthropic = AnthropicBedrock(
                access_key=os.getenv("AWS_ACCESS_KEY"),
                secret_key=os.getenv("AWS_SECRET_KEY"),
                region=os.getenv("REGION")
            )

            completion = anthropic.Completion.create(
                model="anthropic.claude-v2",
                prompt="In one sentence, what is good about the color blue?",
                top_p=1000
            )

            print(completion['completion'])

    def invalid_top_k(self):
        with self.assertRaises(ValueError):
            anthropic = AnthropicBedrock(
                access_key=os.getenv("AWS_ACCESS_KEY"),
                secret_key=os.getenv("AWS_SECRET_KEY"),
                region=os.getenv("REGION")
            )

            completion = anthropic.Completion.create(
                model="anthropic.claude-v2",
                prompt="In one sentence, what is good about the color blue?",
                top_k=1000
            )

            print(completion['completion'])

if __name__ == '__main__':
    unittest.main()