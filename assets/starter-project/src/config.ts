export const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
// id, start, length — edit these to retime the whole video
export const SCENES = [
  {id: 's1', from: s(0), dur: s(5)},
  {id: 's2', from: s(5), dur: s(5)},
  {id: 's3', from: s(10), dur: s(7)},
  {id: 's4', from: s(17), dur: s(7)},
  {id: 's5', from: s(24), dur: s(6)},
  {id: 's6', from: s(30), dur: s(8)},
  {id: 's7', from: s(38), dur: s(7)},
];
export const TOTAL = s(45);
export const MUSIC_FROM = s(5);
