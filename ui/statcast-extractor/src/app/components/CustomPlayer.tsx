// 'use client';
 import React, { useEffect, useState } from 'react'
 import ReactPlayer from 'react-player';
import {fetchVideoUploader, fetchVideoMetric} from "../service/api"
import { VideoMetric } from "../types/VideoMetric";
import { GameResponse } from '../types/Filters';

 interface ICustomPlayerProps {
    video: GameResponse,
    playing?: boolean,
 }
 
 export function CustomPlayer({video, playing}: ICustomPlayerProps) {
    const [metrics, setMetrics] = useState<VideoMetric[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    // const [fileName, setFileName] = useState('');

    const {gameDate, video_url: url, title, type} = video;

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const {video_file_name} = await fetchVideoUploader(url);
            const response = await fetchVideoMetric(video_file_name);
            setMetrics(response);
          } catch (error) {
            setError(true);
            console.error('Error fetching data:', error);
          } finally {
            setIsLoading(false);
          }
    }

    // useEffect(() => {
    //     const getFileName= async () => {
    //         const {video_file_name} = await Service.fetchVideoUploader(url);
    //         setFileName(video_file_name);
    //     }
    //     getFileName()
    // },[])\

    useEffect(()=>{
        setMetrics([]);
    },[url])

    return (
        <div className="flex flex-col gap-3 mb-3 border self-auto bg-gray-100 mb-2 rounded h-full">
            <div className="flex">
                <ReactPlayer 
                    key={url} 
                    url={url}
                    controls={playing}
                    width={'100%'}
                    height='100%'
                    playing={playing}
                />
            </div>
            <div className="flex flex-col px-3">
                <div className='line-clamp-2 font-bold '>{title}</div>
                <div className=''>{new Date(gameDate).toDateString()}</div>
                <div className="italic">{type}</div>
                {(metrics.length > 0 || error || !playing) ? null : <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-2 rounded w-[200px] mb-2" onClick={handleClick} disabled={isLoading} >
                    {isLoading ? 'Extracting...' : 'Extract Metrics'}
                </button>}
                {(metrics.length > 0 && !error && playing) ? <div className='bg-gray-200 rounded p-2 mt-3'>
                    <div className='flex bg-gray-300 rounded-md	px-3 mb-3 flex-wrap'>
                        {['Metric Name', 'Metric Value', 'Detection Time']?.map(metric => <div key={metric} className='flex-1 font-bold'>{metric}</div>)}
                    </div>
                    {metrics.map((item, idx) => (
                        <div className='flex px-3 flex-wrap mb-1' key={idx}>
                            <div className='flex-1'>{item.metric}</div>
                            <div className='flex-1'>{item.metric_value}</div>
                            <div className='flex-1'>{item.detection_time}</div> 
                        </div>
                        ))}
                    
                </div> : null}
                {error && <div className="flex flex-col gap-1">Error fetching data</div> }
            </div> 
        </div>
   );
 }
 