/* Exact response of m e'' + d e' + k e = F, with zero initial velocity. */
const ImpedanceModel = (() => {
  function parameters(p) {
    const force=p.mode==='release'?0:10;
    const initial=p.mode==='release'?0.05:0;
    const omega=Math.sqrt(p.k/p.m);
    return {force,initial,omega,zeta:p.d/(2*Math.sqrt(p.m*p.k)),equilibrium:force/p.k};
  }
  function state(t,p) {
    const {force,initial,equilibrium,omega}=parameters(p);
    const A=initial-equilibrium,alpha=p.d/(2*p.m),delta=alpha*alpha-omega*omega;
    let y,v;
    if(Math.abs(delta)<1e-10*omega*omega){
      y=A*(1+alpha*t)*Math.exp(-alpha*t);
      v=-A*alpha*alpha*t*Math.exp(-alpha*t);
    }else if(delta<0){
      const w=Math.sqrt(-delta),decay=Math.exp(-alpha*t);
      y=A*decay*(Math.cos(w*t)+alpha/w*Math.sin(w*t));
      v=-A*decay*omega*omega/w*Math.sin(w*t);
    }else{
      const r1=-omega*omega/(alpha+Math.sqrt(delta));
      const r2=-alpha-Math.sqrt(delta);
      const c1=-A*r2/(r1-r2),c2=A*r1/(r1-r2);
      y=c1*Math.exp(r1*t)+c2*Math.exp(r2*t);
      v=c1*r1*Math.exp(r1*t)+c2*r2*Math.exp(r2*t);
    }
    const e=equilibrium+y,spring=-p.k*e,damper=-p.d*v;
    return {e,v,a:(force+spring+damper)/p.m,force,spring,damper,energy:.5*p.m*v*v+.5*p.k*e*e};
  }
  return {parameters,state};
})();
