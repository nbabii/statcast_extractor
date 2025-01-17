from google.cloud import bigquery
import functions_framework
import logging
import json
import os

bq_table = f"{os.environ.get("GOOGLE_CLOUD_PROJECT")}.mlb.statcas_videos"

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
    
    season = request.args.get('season')
    team = request.args.get('team')

    query = f"SELECT DISTINCT season FROM `{bq_table}`"

    if season:
        query = f"SELECT DISTINCT team_home FROM `{bq_table}` WHERE season = {season} ORDER BY team_home"
    
    if season and team:
        query = f"SELECT * FROM `{bq_table}` WHERE season = {season} AND team_home = '{team}'"
    
    

    if request.method == 'GET':
        try:
            client = bigquery.Client()
            results = client.query(query).result()
            if season and team:
                rows = [{
                "season": row.season,
                "team_away": row.team_away,
                "team_home": row.team_home,
                "gamePk": row.gamePk,
                "title": row.title,
                "video_url": row.video_url,
                "type": row.type,
                "gameDate": row.gameDate.isoformat(),
                } for row in results]
            else:
                rows = [dict(row) for row in results]
        except Exception as e:
            logging.error(f"Server error: {e}")
            return json.dumps({"error": f"An unexpected error occurred. E: {e}"}), 500
    else:
        return json.dumps({"error": "Only GET requests are accepted"}), 405
    
    headers = {"Access-Control-Allow-Origin": "*"}

    return json.dumps(rows), 200, headers
