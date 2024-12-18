import functions_framework
import logging
import json

@functions_framework.http
def upload_video_file(request):
    request_json = request.get_json()

    if not request_json or "video_url" not in request_json:
        logging.error(f"Server error: 'video_url' property is required")
        return json.dumps({"error": "'video_url' property is required"}), 500
    
    if request.method == 'POST':
        try:
            logging.info("main body")
        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": "An unexpected error occurred."}), 500
    else:
        return json.dumps({"error": "Only POST requests are accepted"}), 405
    
    return "File uploaded successfully!", 200


def download_file(url):
  response = requests.get(video_url, stream=True)

  if response.status_code == 200:
      # Create a local file name to temporarily save the file
      temp_file_path = "d65a7f57-e3a95f3c-43f7c007-csvm-diamondx64-asset_1280x720_59_4000K.mp4"
      with open(temp_file_path, "wb") as f:
          for chunk in response.iter_content(chunk_size=8192):
              f.write(chunk)
      print(f"File downloaded: {temp_file_path}")
  else:
      raise Exception(f"Failed to download file: {response.status_code}, {response.text}")