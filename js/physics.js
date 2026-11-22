export const C={h:6.62607015e-34,c:299792458,k:1.380649e-23,sigma:5.670374419e-8,b:2.897771955e-3};
export function planck(lambda,T){if(!(lambda>0&&T>0))return 0;const x=C.h*C.c/(lambda*C.k*T);if(x>700)return 0;return (2*C.h*C.c*C.c/Math.pow(lambda,5))/(Math.expm1(x));}
export function wien(T){return C.b/T;}
export function stefan(T,A=1,eps=1){return eps*C.sigma*Math.pow(T,4)*A;}
export function region(nm){if(nm<10)return 'X-ray / extreme UV';if(nm<380)return 'Ultraviolet';if(nm<450)return 'Violet';if(nm<495)return 'Blue';if(nm<570)return 'Green';if(nm<590)return 'Yellow';if(nm<620)return 'Orange';if(nm<750)return 'Red';return 'Infrared';}
export function spectrum(T,minNm=100,maxNm=3000,count=240){const out=[];const logMin=Math.log(minNm),logMax=Math.log(maxNm);for(let i=0;i<count;i++){const nm=Math.exp(logMin+(logMax-logMin)*i/(count-1));out.push({x:nm,y:planck(nm*1e-9,T)});}return out;}
export function fmt(n,d=3){if(!Number.isFinite(n))return '—';if(Math.abs(n)>=1e6||Math.abs(n)<1e-3&&n!==0)return n.toExponential(d);return n.toLocaleString(undefined,{maximumFractionDigits:d});}
export function rgbForTemp(T){let r,g,b;const t=T/100;if(t<=66){r=255;g=99.4708025861*Math.log(t)-161.1195681661;b=t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307;}else{r=329.698727446*Math.pow(t-60,-.1332047592);g=288.1221695283*Math.pow(t-60,-.0755148492);b=255;}return `rgb(${Math.round(Math.max(0,Math.min(255,r)))},${Math.round(Math.max(0,Math.min(255,g)))},${Math.round(Math.max(0,Math.min(255,b)))})`;}
export function tempGlow(T){const color=rgbForTemp(T);return {color,background:`radial-gradient(circle at 34% 30%, #fff7dc, ${color} 42%, #36170d 100%)`,boxShadow:`0 0 35px 10px ${color}66, 0 0 95px 32px ${color}33, inset -14px -15px 25px #45180c66`};}
