export type SeasonResponse = {
    season: string;
}

export type TeamResponse = {
    team_home: string;
}
export type GameResponse = {
    gameDate: string,
    gamePk: string,
    season: string,
    team_away:string,
    team_home: string,
    title:string,
    type: string,
    video_url: string
}
export type FilterOptions = {
    value: string;
    label: string;
}