import os
import boto3
from botocore.config import Config
import json
from tokenizers import Tokenizer  # type: ignore[import]
from pathlib import Path
from typing import cast

class AnthropicBedrock():
    def __init__(self, region: str, access_key: str, secret_key:str):
        if access_key is None: 
            access_key = os.environ.get("ANTHROPIC_AUTH_TOKEN")
        self.access_key = access_key 

        if secret_key is None: 
            secret_key = os.environ.get("AWS_SECRET")

        if region is None:
            target_region = os.environ.get("AWS_REGION", os.environ.get("AWS_DEFAULT_REGION"))
        target_region = region

        self.target_region = region

        retry_config = Config(
            region_name=target_region,
            retries={
                "max_attempts": 10,
                "mode": "standard",
            },
        )

        session_kwargs = {"region_name": target_region}
        #session_kwargs = {"region_name": target_region, "aws_access_key_id": access_key, "aws_secret_access_key": secret_key}
        session = boto3.Session(**session_kwargs)
        client_kwargs = {**session_kwargs}
        service_name='bedrock-runtime'

        bedrock_client = session.client(
            service_name=service_name,
            config=retry_config,
            **client_kwargs
        )

        self.hello = "test"
        self.Completion = Completion(bedrock_client)
        self.bedrock_client = bedrock_client
    
    def _anthropic_tokenizer(self):
        tokenizer_path = Path(__file__).parent / "tokenizer.json" 
        text = tokenizer_path.read_text(encoding="utf-8")
        return cast(Tokenizer, Tokenizer.from_str(text)) 

    def count_tokens(self, prompt:str):
        tokenizer = self._anthropic_tokenizer() 
        encoded_text = tokenizer.encode(prompt)
        return len(encoded_text.ids)
    
    # Check for region errors
    def _region_errors(self, region: str):
        pass


class Completion():
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client

    def create(self, prompt, model):
        prompt = f"""Human: Please provide a summary of the following text.
        <text>
        {prompt}
        </text>

        Assistant:"""

        body = json.dumps({"prompt": prompt,
            "max_tokens_to_sample":300,
            "temperature":0.5,
            "top_k":250,
            "top_p":0.5,
            "stop_sequences":[]
        }) 

        accept = 'application/json'
        contentType = 'application/json'

        response = self.bedrock_client.invoke_model(body=body, modelId=model, accept=accept, contentType=contentType)
        response_body = json.loads(response.get('body').read())
        return response_body


class Chat():
    def __init__(self):
        pass


anthropic = AnthropicBedrock(region="us-east-1", access_key="bye", secret_key="s")
completion = anthropic.Completion.create(
    prompt="Who is steve jobs",
    model="anthropic.claude-v2"
)
print(anthropic.count_tokens("hello world"))

print(completion["completion"])