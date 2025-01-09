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
            }
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


def clear_extra_detections(response_array):
    # TODO
    return response_array

def extract(video_file_name):
    video_uri = f"gs://gcs_video_samples/temp/{video_file_name}"   
    vertexai.init(project=PROJECT_ID, location=LOCATION)    
    model = GenerativeModel("gemini-2.0-flash-exp")
    generation_config = GenerationConfig(temperature=0,
                                         response_mime_type="application/json",
                                         response_schema = response_schema)

    video_analysis_prompt = """
                            ##Task description
                            You are given an MLB game video and a list of MLB Statcast metrics with detection instructions in brackets:
                            - Pitch Velocity (value should be extracted from any available place you know);
                            - Exit Velocity (value should be only extracted if it is located near to text 'Exit Velocity', 'EV' or 'EVL');
                            - Projected HR Distance (value should be only extracted if it is located near to text 'Projected HR Distance', 'HR Distance', 'HR-DIS', "HR");
                            - Launch Angle (value should be only extracted if it is located near to text 'Launch Angle', 'Angle' or 'LA');
                            - Max Height (value should be only extracted if it is located near to text 'Max Height');
                            
                            Using the instructions, extract metrics from the video.

                            ##Output specification
                            You should provide the output in a strictly valid JSON format same as the following example. [
                            {"metric": "statcast metric name, words separated with space.",
                            "detection_time": "Timestamp of the event in mm:ss format.",
                            "metric_value": "metric value with units."
                            },
                            {"metric": "statcast metric name, words separated with space.",
                            "detection_time": "Timestamp of the event in mm:ss format.",
                            "metric_value": "metric value with units."
                            },]
                            """

    contents = [
        Part.from_uri(
            uri=video_uri,
            mime_type="video/mp4",
        ),
        video_analysis_prompt,
    ]
    
    response = model.generate_content(contents, generation_config=generation_config)
    
    final_result = clear_extra_detections(json.loads(response.text))

    return final_result
