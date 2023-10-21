import os
import boto3

class AnthropicBedrock():
    def __init__(self, region: str, access_key: str, secret_key:str):
        if access_key is None: 
            access_key = os.environ.get("ANTHROPIC_AUTH_TOKEN")
        self.access_key = access_key 

        if region is None:
            target_region = os.environ.get("AWS_REGION", os.environ.get("AWS_DEFAULT_REGION"))
        self.target_region = region

        session_kwargs = {"region_name": target_region}
        client_kwargs = {**session_kwargs}
        profile_name = os.environ.get("AWS_PROFILE")

        print("profile", profile_name)



        session = boto3.Session(**session_kwargs)


        service_name = "bedrock"


        self.bedrock_client = session.client
