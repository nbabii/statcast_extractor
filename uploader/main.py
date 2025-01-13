from google.cloud import storage
import functions_framework
import logging
import json
import requests
import cv2
import os


@functions_framework.http
def upload_video_file(request):
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)
    
    request_json = request.get_json()

    if not request_json or "video_url" not in request_json:
        logging.error(f"Server error: 'video_url' property is required")
        return json.dumps({"error": "'video_url' property is required"}), 500

    if request.method == 'POST':
        try:
            file_name = download_file(request_json["video_url"])
            #get_frames(file_name)
            upload_temp_folder()
        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": f"An unexpected error occurred. E: {e}"}), 500
    else:
        return json.dumps({"error": "Only POST requests are accepted"}), 405
    
    headers = {"Access-Control-Allow-Origin": "*"}

    return json.dumps({"video_file_name": file_name}), 200, headers


def download_file(video_url):
  response = requests.get(video_url, stream=True)

  if response.status_code == 200:
      os.makedirs("./temp/", exist_ok=True)
      file_name = video_url.split("/")[-1]
      temp_file_path = f"./temp/{file_name}"
      with open(temp_file_path, "wb") as f:
          for chunk in response.iter_content(chunk_size=8192):
              f.write(chunk)
      logging.info(f"File downloaded: {file_name}")
  else:
      raise Exception(f"Failed to download file: {response.status_code}, {response.text}")
  
  return file_name


def get_frames(video_file, for_seconds=5):
    video_capture = cv2.VideoCapture(f"./temp/{video_file}")
    original_fps = int(video_capture.get(cv2.CAP_PROP_FPS))
    frames_folder = f"./temp/frames_{os.path.splitext(video_file)[0]}"
    os.makedirs(frames_folder, exist_ok=True)
    selected_frames_amount = original_fps * for_seconds
    frame_count = 0
    saved_frame_count = 0

    while True:
        ret, frame = video_capture.read()
        if not ret or frame_count >= selected_frames_amount:
            logging.info(f"Exit the loop when the video ends")
            break 

        frame_filename = os.path.join(frames_folder, f"frame_{saved_frame_count:04d}.jpg")
        
        cv2.imwrite(frame_filename, frame)
        saved_frame_count += 1
        frame_count += 1

    video_capture.release()
    logging.info(f"Extraction complete: {saved_frame_count} frames saved")


def upload_temp_folder():
    storage_client = storage.Client()
    bucket = storage_client.bucket(f"{os.environ.get('GCS_BUCKET')}")

    for root, _, files in os.walk("temp/"):
        for file in files:
            local_file_path = os.path.join(root, file)
            blob = bucket.blob(local_file_path)
            blob.upload_from_filename(local_file_path)
