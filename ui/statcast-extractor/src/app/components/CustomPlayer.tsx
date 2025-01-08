// 'use client';
 import React, { useEffect, useState } from 'react'
 import ReactPlayer from 'react-player';
import {fetchVideoUploader, fetchVideoMetric} from "../service/api"
import { VideoMetric } from "../types/VideoMetric";

 interface IDataProps {
    url: string,
    type: string,
    playing?: boolean
 }
 
 export function CustomPlayer({url, type, playing}: IDataProps) {

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
    // },[])\

    useEffect(()=>{
        setMetrics([]);
    },[url])

    return (
        <div className="flex flex-col gap-3 mb-3 border bg-gray-100 mb-2rounded">
            <ReactPlayer 
                key={url} 
                url={url}
                controls={playing}
                width={'100%'}
                height='100%'
                playing={playing}
                onPlay={()=> false}
            />
            <div className="flex gap-3 mb-3">
                <div>
                    {<div className="flex flex-col gap-1 mx-3">Type: {type}</div>}
                    {(metrics.length > 0 || error) ? null : <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded w-[100px]" onClick={handleClick} disabled={isLoading} >
                        {isLoading ? 'Loading...' : 'Extract'}
                    </button>}
                </div>
                <div>
                    <div className="flex flex-col gap-1 mb-4">
                        {metrics?.map(({metric='', detection_time, metric_value}, idx) => (<span className='capitalize' key={idx}>{`${metric?.toLowerCase()} -> ${detection_time} -> ${metric_value}`}</span>))}
                    </div>
                    {error && <div className="flex flex-col gap-1">Error fetching data</div> }
                </div>  
            </div>
            
           
            
        </div>
   );
 }
 