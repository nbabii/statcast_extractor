 /* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
import Select from 'react-select';
import React, { useState, useEffect } from 'react'
import Playlists from "./components/Playlists";

export default function Home() {
  const [teamsOptions, setTeamsOptions] = useState([]);
  const [scheduleData, setScheduleData] = useState([])
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedGame, setSelectedGame] = useState({});

  const getYears = () => {
    const currentYear = (new Date()).getFullYear();
    const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    return range(currentYear, currentYear - 30, -1).map((year) => ({
      value: year,
      label: year,
    }));
  }
  const yearsOptions = getYears();

  const getTeams = () => {
    return fetch(`https://statsapi.mlb.com/api/v1/teams?season=${selectedYear}&active=true`)
    .then(response => response.json())
    .then(data => setTeamsOptions(data?.teams))
    .catch(error => console.error('Error fetching teams data:', error));
  }

  const getSchedule = () => {
    return fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${selectedYear}&gameType=R`)
    .then(response => response.json())
    .then(data => {
      const filteredData = data?.dates?.map(({games})=> {
         const allGames = games.flat().filter(({teams}) =>{
          return teams?.away?.team?.name == selectedTeam || teams?.home?.team?.name == selectedTeam 
        })
        return allGames.flat()
      });
      setScheduleData(filteredData.flat())
    })
    .catch(error => console.error('Error fetching teams data:', error));
  }


  const onYearSelect = (selected: any) => {
    setSelectedYear(selected?.label)
  }

  const onTeamSelect = (selected: any) => {
    setSelectedTeam(selected?.name)
  }
  const onGameSelect  = (selected: any) => {
    setSelectedGame(selected)
  }

  useEffect(() => {
    if (selectedYear) {
      getTeams();
    }
    if(selectedYear && selectedTeam) {
      getSchedule();
    }
  }, [selectedYear, selectedTeam])

const { officialDate='', teams={}, gamePk } = selectedGame || {} as any;

return (
    <div className="grid items-center justify-items-center  p-8 pb-20 gap-16 ">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex items-center gap-8">
          <Select
            placeholder="Select year"
            name="year"
            options={yearsOptions}
            classNamePrefix="select"
            onChange={onYearSelect}
            isClearable
            isSearchable
          />
          {selectedYear && <Select
            placeholder="Select team"
            name="teams"
            options={teamsOptions}
            classNamePrefix="select"
            className="w-[300px]"
            isClearable
            isSearchable
            onChange={onTeamSelect}
            getOptionLabel={({name}) => name}
            getOptionValue={({id}) => id}
          />}
           {scheduleData?.length && <Select
            placeholder="Select game"
            name="games"
            options={scheduleData}
            classNamePrefix="select"
            className="w-[300px]"
            isClearable
            isSearchable
            onChange={onGameSelect}
            getOptionLabel={(option: any) => `${option.officialDate}: ${option.teams?.away?.team?.name} vs ${option.teams?.home?.team?.name}` }
            getOptionValue={({gamePk}) => gamePk}
          />}
        </div>
        <div className="flex items-center gap-8">
          {selectedYear && <span> Selected year: {selectedYear}</span>}
          {selectedTeam && <span> Selected team: {selectedTeam}</span>}
          {selectedGame && officialDate && (
            <span>Selected game on {officialDate}
              <span><b> Away:</b> {teams?.away.team.name}</span>
              <span> <b> Home:</b> {teams?.home.team.name}</span>
            </span>
          )}
        </div>

        <Playlists selectedGame={gamePk} />
      </main>
      
    </div>
  );
}
