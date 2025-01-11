"use client"
import Select from 'react-select';
import React, { useState, useEffect } from 'react'
import Playlists from "./components/Playlists";
import Image from 'next/image';
import { isEmpty } from './utils/helpers';
import { getFilters } from './service/api';
import { FilterOptions, SeasonResponse, TeamResponse, GameResponse} from './types/Filters';

export type SelectedGamePk = {
  gamePk: string;
}

const defaultOption: FilterOptions = {
  value: '',
  label: ''
}
const defaultGameOption: GameResponse = {
    gameDate: '',
    gamePk: '',
    season: '',
    team_away:'',
    team_home: '',
    title:'',
    type: '',
    video_url: ''
}

export default function Home() {

  const [yearsOptions, setYearsOptions] = useState<FilterOptions[]>([]);
  const [teamsOptions, setTeamsOptions] = useState<FilterOptions[]>([]);
  const [scheduleData, setScheduleData] = useState<GameResponse[]>([])
  const [selectedYear, setSelectedYear] = useState<FilterOptions>(defaultOption);
  const [selectedTeam, setSelectedTeam] = useState<FilterOptions>(defaultOption);
  const [selectedGame, setSelectedGame] = useState<GameResponse>(defaultGameOption);

  useEffect(() => {
    const getSeasons = async () => {
      const data = await getFilters() as SeasonResponse[];
      const season = data?.reverse().map(({season}) => ({
        value: season,
        label: season,
      })) as FilterOptions[]
      setYearsOptions(season)
      setSelectedYear(season[0])
    };
    getSeasons();
  },[])

  const getTeams = async () => {
    const data = await getFilters(selectedYear?.value) as TeamResponse[];
    setTeamsOptions(data?.map(({team_home}) => ({
      value: team_home,
      label: team_home,
    })))
  }

  const getSchedule = async () => {
    try {
      const data = await getFilters(selectedYear?.value, selectedTeam?.value) as GameResponse[];
      setScheduleData(data)
    } catch (error) {
      console.error('Error fetching teams data:', error)
    }
  }

  const onYearSelect = (selected) => {
    if(selectedYear?.value == selected?.value ) return;
    setSelectedYear(selected)
    setSelectedTeam(defaultOption);
    setSelectedGame(defaultGameOption);
    setScheduleData([]);
  }

  const onTeamSelect = (selected) => {
    if(selectedTeam.value == selected?.value ) return;
    setSelectedTeam(selected)
    setSelectedGame(defaultGameOption);
    setScheduleData([]);
  }
  const onGameSelect  = (selected) => {
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

return (
    <div className={`{ p-8 pb-20 gap-16}`}>
      <div className={`grid items-center justify-items-center gap-16 ${isEmpty(selectedGame) ? 'h-[calc(100vh_-_150px)]' : 'h-full'}`}>
        <div className={'flex items-center flex-col justify-center align-center m-6 justify-items-center'}>
          <div className={'flex items-center justify-center align-center m-6'}>
            <Image
              src="https://www.mlbstatic.com/team-logos/league-on-dark/1.svg"
              alt="Logo"
              width={100}
              height={10}
            />
            <div className='text-3xl font-bold items-center p-3'>Statcast</div>
          </div>
        
          <div className="flex items-center justify-center align-center gap-8">
            <Select
              styles={{
                container: provided => ({
                  ...provided,
                  width: 150
                })
              }}
              isLoading={!yearsOptions.length}
              placeholder="Select season"
              name="year"
              options={yearsOptions}
              value={selectedYear}
              classNamePrefix="select"
              onChange={onYearSelect}
              isSearchable
            />
            {selectedYear ? <Select
              placeholder="Select team"
              name="teams"
              isLoading={!teamsOptions.length}
              options={teamsOptions}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable={!selectedTeam}
              isSearchable
              onChange={onTeamSelect}
              value={selectedTeam}
            /> : null}
            {selectedTeam?.value ? <Select
              placeholder="Select game"
              name="games"
              options={scheduleData}
              isLoading={!scheduleData.length}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable={!selectedGame}
              isSearchable
              onChange={onGameSelect}
              value={selectedGame}
              getOptionLabel={({gameDate, team_away, team_home}: GameResponse) => gameDate ? `${new Date(gameDate).toDateString()}: ${team_away} vs ${team_home}` : '' }
              getOptionValue={({gamePk}) => gamePk}
            /> : null}
          </div>
        </div>
      </div>
     {selectedGame?.gamePk ? <Playlists selectedGame={selectedGame?.gamePk} /> : null}
    </div>
  );
}
