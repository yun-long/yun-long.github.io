/* Exact scalar fields for X ~ .5 N(-2, .45^2) + .5 N(2, .45^2). */
const GenerativePath = (() => {
  const dataVariance = 0.45 ** 2;
  function schedule(s, mode) {
    if (mode === 'linear') return { a:s, b:1-s, da:1, db:-1 };
    const w = Math.PI/2;
    return { a:Math.sin(w*s), b:Math.cos(w*s), da:w*Math.cos(w*s), db:-w*Math.sin(w*s) };
  }
  function fields(x, s, mode) {
    const {a,b,da,db} = schedule(s,mode);
    const variance = a*a*dataVariance+b*b;
    const normal = mean => Math.exp(-0.5*(x-mean)**2/variance)/Math.sqrt(2*Math.PI*variance);
    const density = (normal(-2*a)+normal(2*a))/2;
    const rightWeight = 1/(1+Math.exp(-4*a*x/variance));
    const mean = -2+4*rightWeight;
    const residual = x-a*mean;
    const score = -residual/variance;
    const noiseMean = b*residual/variance;
    const dataMean = mean+a*dataVariance*residual/variance;
    const velocity = da*dataMean+db*noiseMean;
    const fromScore = a > 0 ? (da/a)*x+((da/a)*b*b-b*db)*score : NaN;
    return { density,score,noiseMean,dataMean,velocity,fromScore };
  }
  return {schedule,fields};
})();
