import asyncio
import itertools
import sys
import subprocess
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY"
client_anthropic = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
client = AsyncOpenAI()
client.api_key = OPENAI_API_KEY

async def query_openai(model, system_prompt, user_prompt, max_tokens=4000, temperature=0.0):
    completion = await client.chat.completions.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        logprobs=False,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
    )
    return completion.choices[0].message.content

async def query_antropic(model, system_prompt, user_prompt, max_tokens=4000, temperature=0.0):
    message_list = [
        {
            "role": 'user',
            "content": [
                {"type": "text", "text": user_prompt}
            ]
        }
    ]

    response = await client_anthropic.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=message_list,
        system=system_prompt
    )
    return response.content[0].text


async def query(model, system_prompt, user_prompt, max_tokens=4000, temperature=0.0):
    # if model string contains 'gpt', use OpenAI API
    if 'gpt' in model:
        return await query_openai(model, system_prompt, user_prompt, max_tokens, temperature)
    else:
        return await query_antropic(model, system_prompt, user_prompt, max_tokens, temperature)
    
async def query_stream(model, system_prompt, user_prompt, max_tokens=4000, temperature=0.0):
    stream = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content