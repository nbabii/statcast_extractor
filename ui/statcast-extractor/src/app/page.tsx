"use client"
import Select from 'react-select';
import React, { useState, useEffect } from 'react'
import Playlists from "./components/Playlists";
import Image from 'next/image';
import { getUniqueListBy, isEmpty } from './utils/helpers';
import { getFilters } from './service/api';
import { FilterOptions, SeasonResponse, TeamResponse, GameResponse} from './types/Filters';
import dynamic from 'next/dynamic'
 
const NoSSRSelect = dynamic(() => import('react-select'), { ssr: false })

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
  const [games, setGames] = useState<GameResponse[]>([])
  const [playlists, setPlaylists] = useState<GameResponse[]>([])
  const [selectedYear, setSelectedYear] = useState<FilterOptions>(defaultOption);
  const [selectedTeam, setSelectedTeam] = useState<FilterOptions>(defaultOption);
  const [selectedGame, setSelectedGame] = useState<GameResponse>(defaultGameOption);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);

  const getSeasons = async () => {
    setIsLoading(true);
    try {
      const data = await getFilters() as SeasonResponse[];
      const season = data?.reverse().map(({season}) => ({
        value: season,
        label: season,
      })) as FilterOptions[]
      setYearsOptions(season)
      setSelectedYear(season[0])
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeams = async () => {
    setIsTeamLoading(true);
    try {
      const data = await getFilters(selectedYear.value || "2024") as TeamResponse[];
      const teamsData = data?.map(({team_home}) => ({
        value: team_home,
        label: team_home,
      }))
      setTeamsOptions(teamsData)
    } catch (err) {
      console.error(err);
    } finally {
      setIsTeamLoading(false);
    }
  }

  useEffect(() => {
    getSeasons();
    getTeams();
  },[])

  const getSchedule = async () => {
    setIsGameLoading(true)
    try {
      const data = await getFilters(selectedYear?.value, selectedTeam?.value)  as GameResponse[];
      const filteredData = getUniqueListBy(data, 'team_away') as GameResponse[];
      setGames(data)
      setScheduleData(filteredData)
    } catch (error) {
      console.error('Error fetching teams data:', error)
    } finally {
      setIsGameLoading(false);
    }
  }

  const onYearSelect = (selected) => {
    if(selectedYear?.value == selected?.value) return;
    const selectedData = selected?.value ? selected : {value: '2024', label: '2024'}
    setSelectedYear(selectedData)
    setSelectedTeam(defaultOption);
    setSelectedGame(defaultGameOption);
    setPlaylists([]);
  }

  const onTeamSelect = (selected) => {
    if(selectedTeam.value == selected?.value ) return;
    setSelectedTeam(selected)
    setSelectedGame(defaultGameOption);
    setPlaylists([]);
  }
  const onGameSelect  = (selected) => {
    setSelectedGame(selected);
    const list = [...games].filter(data => data.team_away == selected.team_away);
    setPlaylists(list)
  }

  useEffect(() => {
    if (selectedYear) {
      getTeams();
    }
    if(selectedYear.value && selectedTeam.value) {
      getSchedule();
    }
  }, [selectedYear, selectedTeam])

  return (
    <div className={`{ p-8 pb-20 gap-16}`}>
      <div className={`grid items-center justify-items-center gap-16 ${isEmpty(selectedGame) ? 'h-[calc(100vh_-_150px)]' : 'h-full'}`}>
        <div className={'flex items-center flex-col justify-center align-center m-6 justify-items-center'}>
          <div className={'flex items-center justify-center align-center m-2'}>
            <Image
              src="https://www.mlbstatic.com/team-logos/league-on-dark/1.svg"
              alt="Logo"
              width={100}
              height={10}
              onClick={() => onYearSelect(defaultOption)}
            />
            <div className='text-3xl font-bold items-center p-3'>Statcast Extractor</div>
          </div>
          <div className='text-xl items-center p-1'>Select season, team and game to review available content:</div>
        
          <div className="flex items-center justify-center align-center gap-8 m-2" suppressHydrationWarning>
            <NoSSRSelect
              styles={{
                container: provided => ({
                  ...provided,
                  width: 150
                })
              }}
              isLoading={isLoading}
              placeholder="Select season"
              name="year"
              options={yearsOptions}
              value={selectedYear}
              classNamePrefix="select"
              onChange={onYearSelect}
              isSearchable
              
            />
           <NoSSRSelect
              placeholder="Select team"
              name="teams"
              isLoading={isTeamLoading}
              options={teamsOptions}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable={!selectedTeam}
              isSearchable
              onChange={onTeamSelect}
              value={selectedTeam}
            /> 
            {selectedTeam?.value ? <Select
              placeholder="Select game"
              name="games"
              options={scheduleData}
              isLoading={isGameLoading}
              classNamePrefix="select"
              className="w-[300px]"
              isClearable={!selectedGame}
              isSearchable
              onChange={onGameSelect}
              value={selectedGame}
              getOptionLabel={({gameDate, team_away, team_home}: GameResponse) => gameDate ? ` ${team_away} vs ${team_home}` : '' }
              getOptionValue={({gameDate, gamePk, team_away, team_home, video_url}) => gameDate + gamePk + team_away + team_home + video_url}
            /> : null}
          </div>
        </div>
      </div>
     {selectedGame?.gamePk ? <Playlists playlists={playlists} /> : null}
    </div>
  );
}
