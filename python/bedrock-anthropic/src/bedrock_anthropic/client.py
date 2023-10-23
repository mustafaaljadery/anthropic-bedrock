import os
import boto3
from botocore.config import Config
import json
from tokenizers import Tokenizer
from pathlib import Path
from typing import cast

class AnthropicBedrock():
    def __init__(self, region = None, access_key = None, secret_key = None, profile = None, assumed_role = None):
        if region is None:
            target_region = os.environ.get("AWS_REGION", os.environ.get("AWS_DEFAULT_REGION"))
        else: 
            target_region = region

        retry_config = Config(
            region_name=target_region,
            retries={
                "max_attempts": 10,
                "mode": "standard",
            },
        )

        session_kwargs = {"region_name": target_region}
        if access_key and secret_key: 
            session_kwargs = {"aws_access_key_id": access_key, "aws_secret_access_key": secret_key}

        if profile:
            print(f"  Using profile: {profile}")
            session_kwargs["profile_name"] = profile

        session = boto3.Session(**session_kwargs)
        client_kwargs = {**session_kwargs}
        service_name='bedrock-runtime'

        if assumed_role:
            print(f"  Using role: {assumed_role}", end='')
            sts = session.client("sts")
            response = sts.assume_role(
                RoleArn=str(assumed_role),
                RoleSessionName="langchain-llm-1"
            )
            print(" ... successful!")
            client_kwargs["aws_access_key_id"] = response["Credentials"]["AccessKeyId"]
            client_kwargs["aws_secret_access_key"] = response["Credentials"]["SecretAccessKey"]
            client_kwargs["aws_session_token"] = response["Credentials"]["SessionToken"]

        bedrock_client = session.client(
            service_name=service_name,
            config=retry_config,
            **client_kwargs
        )

        self.Completion = Completion(bedrock_client)
        self.ChatCompletion = Chat(bedrock_client)
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
        if region != "us-east-1" and region != "us-west-2" and region != "ap-southeast-1" and region != "ap-northeast-1" and region != "eu-central-1": 
            raise ValueError(f"Region {region} not found.")

class Completion():
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client
    
    def _check_stream(self, stream): 
        if not isinstance(stream, bool):
            raise ValueError(f"Stream value: {stream} is not a boolean")


    def _check_model(self, model):
        if not isinstance(model, str):
            raise ValueError(f"Value for model: {model} is not an string.")
        elif model != "anthropic.claude-v1" and model != "anthropic.claude-v2" and model != "anthropic.claude-instant-v1": 
            raise ValueError(f"Model {model} not found.")

    def _check_max_tokens_to_sample(self, tokens):
        if not isinstance(tokens, int) and not isinstance(tokens, float):
            raise ValueError(f"max_tokens_to_sample: {tokens} isn't a float or int.")
        elif tokens < 0: 
            raise ValueError(f"max_tokens_to_sample: {tokens} is less than 0.")
    
    def _check_temperature(self, temperature):
        if not isinstance(temperature, int) and not isinstance(temperature, float):
            raise ValueError(f"Value of temperature: {temperature} is not an int or float.")
        elif temperature < 0: 
            raise ValueError(f"temperature: {temperature} is less than 0.")
        elif temperature > 1: 
            raise ValueError(f"temperature: {temperature} is greater than 1.")

    def _check_stop_sequences(self, stop_sequences):
        if not isinstance(stop_sequences, list):
            raise ValueError("Make sure stop_sequences is a list.")
        
        for stop in stop_sequences: 
            if not isinstance(stop, str):
                raise ValueError("Make sure all items in stop_sequences are strs.")

    def _check_top_p(self, top_p):
        if not isinstance(top_p, int) and not isinstance(top_p, float):
            raise ValueError(f"Value of top_p: {top_p} is not an int or float.")
        elif top_p < 0:
            raise ValueError(f"top_p: {top_p} is less than 0.")
        elif top_p > 1:
            raise ValueError(f"top_p: {top_p} is greater than 1.")

    def _check_top_k(self, top_k):
        if not isinstance(top_k, int) and not isinstance(top_k, float):
            raise ValueError(f"Value of top_k: {top_k} is not an int or float.")
        elif top_k < 0:
            raise ValueError(f"top_k: {top_k} is less than 0.")
        elif top_k > 500:
            raise ValueError(f"top_k: {top_k} is greater than 500.")

    
    def _create_prompt(self, prompt):
        text = f"""\n\nHuman: {prompt}

        \nAssistant: """
        return text

    def create(self, prompt, model, max_tokens_to_sample = 256, top_p=1, top_k=250, temperature=1, stop_sequences=[], stream=False):
        self._check_stream(stream)
        self._check_model(model)
        self._check_max_tokens_to_sample(max_tokens_to_sample)
        self._check_temperature(temperature)
        self._check_stop_sequences(stop_sequences)
        self._check_top_k(top_k)
        self._check_top_p(top_p)

        prompt = self._create_prompt(prompt)

        body = json.dumps({
            "prompt": prompt,
            "max_tokens_to_sample": max_tokens_to_sample,
            "temperature": temperature,
            "top_k": top_k,
            "top_p": top_p,
            "stop_sequences": stop_sequences
        }) 

        accept = 'application/json'
        contentType = 'application/json'

        if stream:
            response = self.bedrock_client.invoke_model_with_response_stream(body=body, modelId=model, accept=accept, contentType=contentType)
            stream = response.get('body')
            return stream
        else:
            response = self.bedrock_client.invoke_model(body=body, modelId=model, accept=accept, contentType=contentType)
            response_body = json.loads(response.get('body').read())
            return response_body


class Chat():
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client
    
    def _check_stream(self, stream): 
        if not isinstance(stream, bool):
            raise ValueError(f"Stream value: {stream} is not a boolean")
    
    def _check_model(self, model):
        if not isinstance(model, str):
            raise ValueError(f"Value for model: {model} is not an string.")
        elif model != "anthropic.claude-v1" and model != "anthropic.claude-v2" and model != "anthropic.claude-instant-v1": 
            raise ValueError(f"Model {model} not found.")

    def _check_max_tokens_to_sample(self, tokens):
        if not isinstance(tokens, int) and not isinstance(tokens, float):
            raise ValueError(f"max_tokens_to_sample: {tokens} isn't a float or int.")
        elif tokens < 0: 
            raise ValueError(f"max_tokens_to_sample: {tokens} is less than 0.")

    def _check_temperature(self, temperature):
        if not isinstance(temperature, int) and not isinstance(temperature, float):
            raise ValueError(f"Value of temperature: {temperature} is not an int or float.")
        elif temperature < 0: 
            raise ValueError(f"temperature: {temperature} is less than 0.")
        elif temperature > 1: 
            raise ValueError(f"temperature: {temperature} is greater than 1.")

    def _check_stop_sequences(self, stop_sequences):
        if not isinstance(stop_sequences, list):
            raise ValueError("Make sure stop_sequences is a list.")

        for stop in stop_sequences: 
            if not isinstance(stop, str):
                raise ValueError("Make sure all items in stop_sequences are strs.")

    def _check_top_p(self, top_p):
        if not isinstance(top_p, int) and not isinstance(top_p, float):
            raise ValueError(f"Value of top_p: {top_p} is not an int or float.")
        elif top_p < 0:
            raise ValueError(f"top_p: {top_p} is less than 0.")
        elif top_p > 1:
            raise ValueError(f"top_p: {top_p} is greater than 1.")

    def _check_top_k(self, top_k):
        if not isinstance(top_k, int) and not isinstance(top_k, float):
            raise ValueError(f"Value of top_k: {top_k} is not an int or float.")
        elif top_k < 0:
            raise ValueError(f"top_k: {top_k} is less than 0.")
        elif top_k > 500:
            raise ValueError(f"top_k: {top_k} is greater than 500.")

    def _format_messages(self, messages):
        prompt = "\n\nHuman: You are a helpful assistant."

        for message in messages: 
            if message['role'] == "system": 
                prompt += f"\n Assistant: {message['content']}"
            elif message['role'] == "user": 
                prompt += f"\n Human: {message['content']}"
            else: 
                raise ValueError(f"Got unknown role {message['role']}.")

        prompt += "\n\n Assistant: "

        return prompt
    
    def create(self, messages, model, max_tokens_to_sample = 256, top_p=1, top_k=250, temperature=1, stop_sequences=[], stream=False):
        self._check_stream(stream)
        self._check_model(model)
        self._check_max_tokens_to_sample(max_tokens_to_sample)
        self._check_temperature(temperature)
        self._check_stop_sequences(stop_sequences)
        self._check_top_k(top_k)
        self._check_top_p(top_p)

        prompt = self._format_messages(messages) 

        body = json.dumps({
            "prompt": prompt,
            "max_tokens_to_sample": max_tokens_to_sample,
            "temperature": temperature,
            "top_k": top_k,
            "top_p": top_p,
            "stop_sequences": stop_sequences
        }) 

        accept = 'application/json'
        contentType = 'application/json'

        if stream:
            response = self.bedrock_client.invoke_model_with_response_stream(body=body, modelId=model, accept=accept, contentType=contentType)
            stream = response.get('body')
            return stream
        else:
            response = self.bedrock_client.invoke_model(body=body, modelId=model, accept=accept, contentType=contentType)
            response_body = json.loads(response.get('body').read())
            messages.append({
                "role": "system",
                "content": response_body["completion"]
            }) 

            return {
                "messages": messages, 
                "stop_reason": response_body["stop_reason"]
            }
