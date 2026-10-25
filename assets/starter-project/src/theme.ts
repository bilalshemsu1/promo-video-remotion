import {loadFont as loadEth} from '@remotion/google-fonts/NotoSansEthiopic';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

const eth = loadEth('normal', {weights: ['500', '700'], subsets: ['ethiopic', 'latin']});
const inter = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin']});

export const FONT = `${inter.fontFamily}, ${eth.fontFamily}, -apple-system, system-ui, sans-serif`;

export const C = {
  tg: '#2AABEE',
  tg2: '#1B8FD6',
  sky: '#8FD3FF',
  dark: '#050B16',
  navy: '#0A1F3D',
  lime: '#C8F53A',
  orange: '#FF9F0A',
  pink: '#FF375F',
  green: '#30D158',
  red: '#FF453A',
  purple: '#7D5BFF',
  mute: 'rgba(255,255,255,.62)',
};
