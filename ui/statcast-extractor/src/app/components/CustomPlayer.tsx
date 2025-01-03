// 'use client';
 import React, { useState } from 'react'
 import ReactPlayer from 'react-player';
//  import { Suspense } from "react";
import {fetchVideoUploader, fetchVideoMetric} from "../service/api"
import { VideoMetric } from "../types/VideoMetric";

 interface IDataProps {
    url: string,
    type: string
 }
 
 export function CustomPlayer({url, type}: IDataProps) {

    const [metrics, setMetrics] = useState<VideoMetric[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    // const [fileName, setFileName] = useState('');

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
    // },[])

    console.log(type)
    return (
        <div className="flex items-center gap-8 flex-wrap">
            <ReactPlayer 
                key={url} 
                url={url}
                controls
                width='50%'
                height='100%'
            />
            {metrics.length > 0 || error ? null : <button onClick={handleClick} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Extract'}
            </button>}
            <div className="flex flex-col gap-1">
                {metrics?.map(({metric, detection_time, metric_value}, idx) => (<span key={idx}>{`${metric} -> ${detection_time} -> ${metric_value}`}</span>))}
            </div>
            {error && <div className="flex flex-col gap-1">Error fetching data</div> }
            <div className="flex flex-col gap-1">{type}</div>
        </div>
   );
 }
 