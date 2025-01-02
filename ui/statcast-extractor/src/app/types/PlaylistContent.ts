export type Playbacks = {
    url: string;
}
export type Keywords = {
    type:string;
    value: string;
}
export type PlaylistPlaybacks = {
    playbacks: Playbacks;
    keywordsAll: Keywords[];
}

export type Highlights = {
    items: PlaylistPlaybacks[];
   
}
export type HighlightsContent = {
    highlights: Highlights;
}
export type PlaylistContent = {
    highlights: HighlightsContent;
}

export enum PlaylistStatus {
    PlaylistContent,
    Highlights,
    PlaylistPlaybacks,
    HighlightsContent
  }