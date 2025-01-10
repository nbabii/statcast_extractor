from google.cloud import bigquery
import functions_framework
import logging
import json


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
    
    query = """SELECT * FROM `glassy-acolyte-444919-c1.mlb.statcas_videos` LIMIT 1500"""

    if request.method == 'GET':
        try:
            client = bigquery.Client()
            results = client.query(query).result() 

            rows = [{
                "season": row.season,
                "team_away": row.team_away,
                "team_home": row.team_home,
                "gamePk": row.gamePk,
                "title": row.title,
                "video_url": row.video_url,
                } for row in results]

        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": f"An unexpected error occurred. E: {e}"}), 500
    else:
        return json.dumps({"error": "Only GET requests are accepted"}), 405
    
    headers = {"Access-Control-Allow-Origin": "*"}

    return json.dumps({"available_videos": rows}), 200, headers
