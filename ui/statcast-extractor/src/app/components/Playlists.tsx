'use client';
import { getGameContent } from "../service/api"
import React, { useState, useEffect } from 'react'
import { CustomPlayer } from '../components/CustomPlayer';
import { PlaylistPlaybacks } from "../types/PlaylistContent";

export default function Playlists({ selectedGame }: { selectedGame: string }) {
    const [playlists, setPlaylists] = useState<PlaylistPlaybacks[]>([]);

    useEffect(() => {
        if(selectedGame) {
            const getContent= async () => {
                const data = await getGameContent(selectedGame);
                const allowedValues = ["hitting", "home-run", "player-tracking"];
                console.log('BEFORE', data?.highlights?.highlights?.items)
                const filteredData = data?.highlights?.highlights?.items.filter((item) =>
                    item.keywordsAll.some(
                    (keyword) => keyword.type === "taxonomy" && allowedValues.includes(keyword.value)
                    )
                );
                
                console.log("AFTER",filteredData);

                setPlaylists(filteredData);
            
            };
            getContent();
        }
    },[selectedGame])

    return (
        <div className="flex items-center gap-8 flex-wrap">
            {playlists?.map(({playbacks}: PlaylistPlaybacks) => (
            <CustomPlayer 
                key={playbacks[0]?.url}
                url={playbacks[0]?.url}
            />
            ))}
        </div>
    )
  }