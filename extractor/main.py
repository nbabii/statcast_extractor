from google.cloud import storage
import functions_framework
import logging
import json


PROJECT_ID = "glassy-acolyte-444919-c1"
LOCATION = "us-central1"

import vertexai
from vertexai.preview.generative_models import (
    GenerationConfig,
    GenerativeModel,
    Part
)


@functions_framework.http
def extract_stats(request):
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
    
    return json.dumps({"extraction_result": res}), 200


def extract(video_file_name):
    video_uri = f"gs://gcs_video_samples/temp/{video_file_name}"   
    vertexai.init(project=PROJECT_ID, location=LOCATION)    
    model = GenerativeModel("gemini-1.5-pro")
    generation_config = GenerationConfig(temperature=0)

    video_analysis_prompt = """You are an expert in detecting and extracting MLB statcast metrics such as pitch speed, etc. from game videos.
                            Extract pitch speed metric from this video and time when it was detected on the video.
                            Reply in json array of objects format like: {metric: statcast metric name, detection_time: detection time, metric_value: metric value}"""

    contents = [
        Part.from_uri(
            uri=video_uri,
            mime_type="video/mp4",
        ),
        video_analysis_prompt,
    ]
    
    response = model.generate_content(contents, generation_config=generation_config)
    
    return response.text
