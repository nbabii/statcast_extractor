 /* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
import Image from "next/image";
import Select from 'react-select';
import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player';
// import { list } from "postcss";


export default function Home() {
  const [teamsOptions, setTeamsOptions] = useState([]);
  const [videoList, setVideoList] = useState([])
  const [scheduleData, setScheduleData] = useState([])
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);

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
    return fetch(`https://statsapi.mlb.com/api/v1/teams?season=${selectedYear}`)
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

  const getGameContent = (selectedGame: any) => {
    return fetch(`https://statsapi.mlb.com/api/v1/game/${selectedGame}/content`)
    .then(response => response.json())
    .then(data => setVideoList(data?.highlights?.highlights?.items))
    .catch(error => console.error('Error fetching teams data:', error));
  }

  const onYearSelect = (selected: any) => {
    setSelectedYear(selected?.label)
  }

  const onTeamSelect = (selected: any) => {
    setSelectedTeam(selected?.name)
  }
  const onGameSelect  = (selected: any) => {
    getGameContent(selected?.gamePk)
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

const { officialDate='', teams={} } = selectedGame || {} as any;

  return (
    <div className="grid items-center justify-items-center  p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
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
        <div className="flex items-center gap-8 flex-wrap">
          {videoList?.map(({playbacks}: any) => (
            <ReactPlayer 
              key={playbacks[0]?.url} 
              url={playbacks[0]?.url}
              controls
              width='30%'
            />
            ) )}
          
          </div>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
             Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        {/* <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div> */}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
