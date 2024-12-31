from google.cloud import storage
import functions_framework
import logging
import json
import typing_extensions as typing

import vertexai
from vertexai.preview.generative_models import (
    GenerationConfig,
    GenerativeModel,
    Part
)


response_schema = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "metric": {
                "type": "string",
            },
            "detection_time": {
                "type": "string",
            },
            "metric_value": {
                "type": "string",
            },
        },
    }
}


PROJECT_ID = "glassy-acolyte-444919-c1"
LOCATION = "us-central1"


@functions_framework.http
def extract_stats(request):
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)
    
    request_json = request.get_json()

    if not request_json or "video_file_name" not in request_json:
        logging.error(f"Server error: 'video_file_name' property is required")
        return json.dumps({"error": "'video_file_name' property is required"}), 500
    
    if request.method == 'POST':
        try:
            res = extract(request_json["video_file_name"])
        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": f"An unexpected error occurred. E: {e}"}), 500
    else:
        return json.dumps({"error": "Only POST requests are accepted"}), 405    

    headers = {"Access-Control-Allow-Origin": "*"}
    
    return res, 200, headers


def extract(video_file_name):
    video_uri = f"gs://gcs_video_samples/temp/{video_file_name}"   
    vertexai.init(project=PROJECT_ID, location=LOCATION)    
    model = GenerativeModel("gemini-1.5-pro")
    generation_config = GenerationConfig(temperature=0,
                                         response_mime_type="application/json",
                                         response_schema = response_schema)

    video_analysis_prompt = """You are an expert in detecting and extracting MLB statcast metrics such as pitch speed, exit velocity, etc. from game videos.
                            If available on video, extract Pitch Speed, Exit Velocity, etc. statcast metric(s) and time when it was detected.
                            Reply in json array of objects and format like: [{metric: official statcast metric name, detection_time: detection time, metric_value: metric value},]"""

    contents = [
        Part.from_uri(
            uri=video_uri,
            mime_type="video/mp4",
        ),
        video_analysis_prompt,
    ]
    
    response = model.generate_content(contents, generation_config=generation_config)
    
    return response.text
