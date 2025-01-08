'use client';
import { getGameContent } from "../service/api"
import React, { useState, useEffect } from 'react'
import { CustomPlayer } from '../components/CustomPlayer';
import { PlaylistPlaybacks } from "../types/PlaylistContent";

type SelectedPlayer = {
    url: string;
    metric: string
}
export default function Playlists({ selectedGame }: { selectedGame: string }) {
    const [playlists, setPlaylists] = useState<PlaylistPlaybacks[]>([]);
    const [selected, setSelected] = useState<SelectedPlayer>();
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

    const handleClickWrapper = (url, metric, ) => {
        setSelected({url, metric});
    }

    return (
        <div className="flex gap-3 items-start">
            <div className="flex flex-row gap-3 w-[300px] flex-wrap">
                {playlists?.map(({playbacks, keywordsAll}: PlaylistPlaybacks) => (
                    <div key={playbacks[0]?.url} onClick={() => handleClickWrapper(playbacks[0]?.url, keywordsAll.filter(item => allowedValues.includes(item.value)).map((item) => item.value).join("|"))}>
                        <CustomPlayer 
                            url={playbacks[0]?.url}
                            type={keywordsAll.filter(item => allowedValues.includes(item.value)).map((item) => item.value).join("|")}
                            playing={false}

                        />
                    </div>
                ))}
            </div>
            {selected?.url && (
                <div className="flex flex-row gap-4 flex-wrap "> 
                    <CustomPlayer 
                        url={selected?.url}
                        type={selected?.metric}
                        playing={true}
                    />
                </div>
            )}
        </div>
    )
  }