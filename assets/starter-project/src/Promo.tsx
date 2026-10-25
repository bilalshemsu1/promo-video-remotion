import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {MUSIC_FROM, SCENES} from './config';
import {FONT} from './theme';
import {S1} from './scenes/S1';
import {S2} from './scenes/S2';
import {S3} from './scenes/S3';
import {S4} from './scenes/S4';
import {S5} from './scenes/S5';
import {S6} from './scenes/S6';
import {S7} from './scenes/S7';

const COMPS = [S1, S2, S3, S4, S5, S6, S7];

export const Promo = () => (
  <AbsoluteFill style={{fontFamily: FONT, background: '#0B1F3A'}}>
    {SCENES.map((sc, i) => {
      const S = COMPS[i];
      return (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.dur}>
          <S />
        </Sequence>
      );
    })}
    <Sequence from={MUSIC_FROM} layout="none">
      <Audio src={staticFile('audio/music.wav')} volume={0.3} />
    </Sequence>
  </AbsoluteFill>
);
