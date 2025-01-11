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

export default function Home() {

  const [yearsOptions, setYearsOptions] = useState<FilterOptions[]>([]);
  const [teamsOptions, setTeamsOptions] = useState<FilterOptions[]>([]);
  const [scheduleData, setScheduleData] = useState<GameResponse[]>([])
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedTeam, setSelectedTeam] = useState<FilterOptions>(defaultOption);
  const [selectedGame, setSelectedGame] = useState<SelectedGamePk>();

  useEffect(() => {
    const getSeasons = async () => {
      const data = await getFilters() as SeasonResponse[];
      setYearsOptions(data?.reverse().map(({season}) => ({
        value: season,
        label: season,
      })))
    };
    getSeasons();
  },[])

  const getTeams = async () => {
    const data = await getFilters(selectedYear) as TeamResponse[];
    setTeamsOptions(data?.map(({team_home}) => ({
      value: team_home,
      label: team_home,
    })))
  }

  const getSchedule = async () => {
    try {
      const data = await getFilters(selectedYear, selectedTeam?.value) as GameResponse[];
      setScheduleData(data)
    } catch (error) {
      console.error('Error fetching teams data:', error)
    }
  }


  const onYearSelect = (selected) => {
    // if(selectedYear == selected ) return;
    setSelectedYear(selected?.label)
    // setSelectedTeam(defaultOption);
    // setSelectedGame({gamePk: ''});
    // setScheduleData([]);
  }

  const onTeamSelect = (selected) => {
    setSelectedTeam(selected)
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

const defaultValue = { value: '2024', label: '2024' };

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
              placeholder="Select season"
              name="year"
              options={yearsOptions}
              defaultValue={defaultValue}
              classNamePrefix="select"
              onChange={onYearSelect}
              isSearchable
            />
            {selectedYear ? <Select
              placeholder="Select team"
              name="teams"
              options={teamsOptions}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable={!selectedTeam}
              isSearchable
              onChange={onTeamSelect}
              value={selectedTeam}
            /> : null}
            {scheduleData?.length ? <Select
              placeholder="Select game"
              name="games"
              options={scheduleData}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable
              isSearchable
              onChange={onGameSelect}
              getOptionLabel={(option: GameResponse) => `${new Date(option.gameDate).toDateString()}: ${option.team_away} vs ${option.team_home}` }
              getOptionValue={({gamePk}) => gamePk}
            /> : null}
          </div>
        </div>
      </div>
     {selectedGame?.gamePk ? <Playlists selectedGame={selectedGame?.gamePk} /> : null}
    </div>
  );
}
