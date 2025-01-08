'use client';
import { getGameContent } from "../service/api"
import React, { useState, useEffect } from 'react'
import { CustomPlayer } from '../components/CustomPlayer';
import { PlaylistPlaybacks } from "../types/PlaylistContent";
import { isEmpty } from "../utils/helpers";

type SelectedPlayer = {
    url: string;
    metric: string;
    description: string;
}

export default function Playlists({ selectedGame }: { selectedGame: string }) {
    const [playlists, setPlaylists] = useState<PlaylistPlaybacks[]>([]);
    const [selected, setSelected] = useState<SelectedPlayer>({url: '', metric: '', description: ''});
    const allowedValues = ["hitting", "home-run", "player-tracking"];

    useEffect(() => {
        if(selectedGame) {
            const getContent= async () => {
                const data = await getGameContent(selectedGame);                
                const filteredData = data?.highlights?.highlights?.items.filter((item) =>
                    item.keywordsAll.some(
                    (keyword) => keyword.type === "taxonomy" && allowedValues.includes(keyword.value)
                    )
                );
                
                setPlaylists(filteredData);
            
            };
            getContent();
        }
    },[selectedGame])

    const handleClickWrapper = ({url, metric, description}) => {
        setSelected({url, metric, description});
    }
    console.log('playlists', playlists)
    return (
        <div className="flex gap-3 items-start">
            <div className={`flex gap-5 justify-stretch items-stretch flex-wrap ${isEmpty(selected?.url) ? 'w-full' : 'w-3/12'} `}>
                {playlists?.map(({playbacks, keywordsAll, blurb}: PlaylistPlaybacks) => (
                    <div  className="w-[300px]" key={playbacks[0]?.url} 
                        onClick={() => handleClickWrapper({ url: playbacks[0]?.url, metric: keywordsAll.filter(item => allowedValues.includes(item.value)).map((item) => item.value).join("|"), description: blurb})}
                    >
                        <CustomPlayer 
                            url={playbacks[0]?.url}
                            type={keywordsAll.filter(item => allowedValues.includes(item.value)).map((item) => item.value).join("|")}
                            playing={false}
                            description={blurb}

                        />
                    </div>
                ))}
            </div>
            {selected?.url && (
                <div className="flex flex-row w-9/12 items-start relative">
                    <CustomPlayer 
                        url={selected?.url}
                        type={selected?.metric}
                        playing={true}
                        description={selected?.description}
                    />
                    <button className="absolute right-1 text-white text-xl font-bold" onClick={()=> setSelected({url: '', metric: '', description: ''})}>X</button>
                </div>
            )}
        </div>
    )
  }