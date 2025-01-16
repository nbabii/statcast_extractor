import React, { useEffect, useState } from 'react'
import { CustomPlayer } from '../components/CustomPlayer';
import { isEmpty } from "../utils/helpers";
import { GameResponse } from "../types/Filters";

interface IPlaylistsProps {
    playlists: GameResponse[]
}
const defaultSelection = {
    gameDate: '',
    gamePk: '',
    season: '',
    team_away:'',
    team_home: '',
    title:'',
    type: '',
    video_url: ''
}

export default function Playlists({ playlists}: IPlaylistsProps) {
    const [selected, setSelected] = useState<GameResponse>(defaultSelection);
    const [displayItems, setDisplayItems] = useState(5)
    const totalCount = playlists.length;
    
    const handleClickWrapper = (video) => {
        setSelected(video);
    }

    const displayMore = () => {
        setDisplayItems(displayItems + 10)
    }

    useEffect(()=>{
        setSelected(defaultSelection)
    },[playlists])

    return (
        <div className="flex flex-col justify-items-stretch">
            <div className="flex gap-3 items-start">
                <div className={`flex gap-5 justify-stretch items-stretch flex-wrap ${isEmpty(selected?.video_url) ? 'w-full' : 'w-3/12'} `}>
                    {playlists.slice(0, displayItems).map((video: GameResponse, idx) => (
                        <div className="w-[300px]" key={video.video_url+video.title+idx} 
                            onClick={() => handleClickWrapper(video)}
                        >
                            <CustomPlayer 
                                video={video}
                                playing={false}
                                controls={false}
                            />
                        </div>
                    ))}
                </div>
                {selected?.video_url && (
                    <div className="flex flex-row w-9/12 items-start relative">
                        <CustomPlayer 
                            video={selected}
                            playing={false}
                            controls={true}
                        />
                        <button className="absolute right-1 text-white text-xl font-bold" onClick={()=> setSelected(defaultSelection)}>X</button>
                    </div>
                )}
            </div>
            {displayItems <= totalCount ? (
                <button className="justify-self-end bg-blue-500 text-white font-bold py-1 m-3 rounded-md w-[120px] " onClick={displayMore}>Show More</button>
            ) : null} 
        </div>
    )
  }