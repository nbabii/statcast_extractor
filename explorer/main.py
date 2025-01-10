from google.cloud import storage
import functions_framework
import logging
import json
import requests
import cv2
import os


@functions_framework.http
def explore_videos(request):
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)
    
    if request.method == 'GET':
        try:
            logging.info(f"test")
        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": f"An unexpected error occurred. E: {e}"}), 500
    else:
        return json.dumps({"error": "Only GET requests are accepted"}), 405
    
    headers = {"Access-Control-Allow-Origin": "*"}

    return json.dumps({"available_videos": file_name}), 200, headers
