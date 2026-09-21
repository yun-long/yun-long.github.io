/* Horizontal 2R arm, uniform rigid links, ideal torque actuation. SI units. */
const ImpedanceArm = (() => {
  const l1=.6,l2=.45,m1=1,m2=.7,c1=l1/2,c2=l2/2;
  const I1=m1*l1*l1/12,I2=m2*l2*l2/12;
  const a=I1+I2+m1*c1*c1+m2*(l1*l1+c2*c2),b=m2*l1*c2,d=I2+m2*c2*c2;
  function geometry(q){
    const [q1,q2]=q,s1=Math.sin(q1),c1=Math.cos(q1),s12=Math.sin(q1+q2),c12=Math.cos(q1+q2);
    return {elbow:[l1*c1,l1*s1],x:[l1*c1+l2*c12,l1*s1+l2*s12],J:[[-l1*s1-l2*s12,-l2*s12],[l1*c1+l2*c12,l2*c12]]};
  }
  function inverse(x,y){
    const cosine=Math.max(-1,Math.min(1,(x*x+y*y-l1*l1-l2*l2)/(2*l1*l2)));
    const q2=Math.acos(cosine),q1=Math.atan2(y,x)-Math.atan2(l2*Math.sin(q2),l1+l2*Math.cos(q2));
    return [q1,q2];
  }
  function mass(q){const c=Math.cos(q[1]);return [[a+2*b*c,d+b*c],[d+b*c,d]];}
  function coriolis(y){const h=b*Math.sin(y[1]);return [-h*(2*y[2]*y[3]+y[3]*y[3]),h*y[2]*y[2]];}
  function external(t,p){
    const on=p.experiment!=='target'&&t>=.5&&(p.experiment==='hold'||t<2.5);
    const f=on?p.force:0;return p.direction==='right'?[f,0]:[0,-f];
  }
  function observe(y,p,force){
    const g=geometry(y),J=g.J;
    const v=[J[0][0]*y[2]+J[0][1]*y[3],J[1][0]*y[2]+J[1][1]*y[3]];
    const e=[g.x[0]-p.tx,g.x[1]-p.ty];
    const spring=[-p.kx*e[0],-p.ky*e[1]],damper=[-p.damping*v[0],-p.damping*v[1]];
    const command=[spring[0]+damper[0],spring[1]+damper[1]];
    const transpose=f=>[J[0][0]*f[0]+J[1][0]*f[1],J[0][1]*f[0]+J[1][1]*f[1]];
    const tau=transpose(command),tauExternal=transpose(force),M=mass(y);
    const energy=.5*(M[0][0]*y[2]*y[2]+2*M[0][1]*y[2]*y[3]+M[1][1]*y[3]*y[3])+.5*(p.kx*e[0]*e[0]+p.ky*e[1]*e[1]);
    return {...g,v,e,spring,damper,command,tau,tauExternal,energy,force};
  }
  function derivative(y,p,force){
    const o=observe(y,p,force),M=mass(y),h=coriolis(y),det=M[0][0]*M[1][1]-M[0][1]*M[1][0];
    const r=[o.tau[0]+o.tauExternal[0]-h[0],o.tau[1]+o.tauExternal[1]-h[1]];
    return [y[2],y[3],(M[1][1]*r[0]-M[0][1]*r[1])/det,(-M[1][0]*r[0]+M[0][0]*r[1])/det];
  }
  function step(y,p,force,dt){
    const add=(k,s)=>y.map((v,i)=>v+s*k[i]);
    const k1=derivative(y,p,force),k2=derivative(add(k1,dt/2),p,force),k3=derivative(add(k2,dt/2),p,force),k4=derivative(add(k3,dt),p,force);
    return y.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
  }
  function simulate(p,dt=.001,duration=6){
    let y=[...inverse(.65,.25),0,0];const points=[];
    const count=Math.round(duration/dt),stride=Math.max(1,Math.round(.01/dt));
    for(let i=0;i<=count;i++){
      const t=i*dt;
      if(i%stride===0)points.push({t,y:[...y],...observe(y,p,external(t,p))});
      if(i<count)y=step(y,p,external(t+dt/2,p),dt);
    }
    return points;
  }
  return {l1,l2,m1,m2,geometry,inverse,mass,coriolis,external,observe,derivative,step,simulate};
})();
