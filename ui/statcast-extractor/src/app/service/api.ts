import { VideoMetric } from "../types/VideoMetric";
import { VideoUploader } from "../types/VideoUploader";
import { PlaylistContent } from "../types/PlaylistContent";

const BASE_URL = 'https://us-central1-glassy-acolyte-444919-c1.cloudfunctions.net';
const SITE_URL = 'https://statsapi.mlb.com/api/v1';

const fetchData = async <T>(endpoint: string, parameters: object = {}): Promise<never | T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  const getData = async <T>(endpoint: string): Promise<never | T> => {
    const response = await fetch(`${SITE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };


  export const fetchVideoUploader = (videoUrl: string): Promise<VideoUploader> => {
    const parameters = { video_url: videoUrl };
    return fetchData('/video_uploader', parameters);
  }

  export const fetchVideoMetric = (fileName: string): Promise<VideoMetric[]> => {
    const parameters = { video_file_name: fileName };
    return fetchData('/stat_extractor', parameters);
  }

  export const getGameContent = (selectedGame: string): Promise<PlaylistContent> => {
    return getData(`/game/${selectedGame}/content`);
  }
