import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("space");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x02030a, 0.0008);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 3000);
camera.position.set(0, 5, 18);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 40;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.7;

scene.add(new THREE.AmbientLight(0x516a9c, 0.7));
const sunLight = new THREE.PointLight(0xffffff, 90, 250);
sunLight.position.set(7, 4, 8);
scene.add(sunLight);

function stars(count=3200){
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count*3);
  for(let i=0;i<count*3;i++) pos[i]=(Math.random()-0.5)*1500;
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({color:0xffffff,size:1.3,sizeAttenuation:true});
  const p = new THREE.Points(geo,mat); scene.add(p); return p;
}
const starField = stars();

function sphere(color, radius=4){
  const geo = new THREE.SphereGeometry(radius,96,96);
  const mat = new THREE.MeshStandardMaterial({color,roughness:.75,metalness:.05});
  return new THREE.Mesh(geo,mat);
}

const earth = sphere(0x2779d8,4.5);
earth.position.set(5,1,0);
scene.add(earth);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.65,64,64),
  new THREE.MeshBasicMaterial({color:0x4da9ff,transparent:true,opacity:.10,side:THREE.BackSide})
);
atmosphere.position.copy(earth.position); scene.add(atmosphere);

const moon = sphere(0x777a82,1.05);
scene.add(moon);

const ring = new THREE.Mesh(
  new THREE.RingGeometry(6.1,7.2,96),
  new THREE.MeshBasicMaterial({color:0x6688ff,transparent:true,opacity:.045,side:THREE.DoubleSide})
);
ring.rotation.x=Math.PI/2; earth.add(ring);

const data = {
  Mercury:{color:0x8d8b87,info:"Small rocky world • Closest to the Sun"},
  Venus:{color:0xd49b55,info:"Hottest planet • Thick atmosphere"},
  Earth:{color:0x2c83dc,info:"Our home world • 1 Moon"},
  Mars:{color:0xa54e38,info:"The Red Planet • Ancient landscapes"},
  Jupiter:{color:0xc59b73,info:"Gas giant • Largest planet"},
  Saturn:{color:0xc9ae78,info:"Ringed giant • Iconic rings"},
  Uranus:{color:0x76cbd1,info:"Ice giant • Blue-green atmosphere"},
  Neptune:{color:0x365fbe,info:"Ice giant • Powerful winds"}
};

const list=document.getElementById("planetList");
Object.entries(data).forEach(([name,d],i)=>{
  const el=document.createElement("div");
  el.className="planet"+(name==="Earth"?" selected":"");
  el.dataset.name=name;
  el.innerHTML=`<div class="planet-orb" style="background:radial-gradient(circle at 35% 30%,#fff8,${"#"+d.color.toString(16).padStart(6,"0")} 42%,#050810 78%)"></div><b>${name.toUpperCase()}</b><small>${d.info.split("•")[0]}</small>`;
  el.onclick=()=>selectPlanet(name);
  list.appendChild(el);
});

let selected="Earth";
function selectPlanet(name){
  selected=name;
  document.querySelectorAll(".planet").forEach(x=>x.classList.toggle("selected",x.dataset.name===name));
  const d=data[name];
  document.getElementById("selectedName").textContent=name.toUpperCase();
  document.getElementById("selectedInfo").textContent=d.info;
  document.getElementById("selectedType").textContent=name==="Jupiter"||name==="Saturn"?"Gas Giant":(name==="Uranus"||name==="Neptune"?"Ice Giant":"Terrestrial Planet");
  const hex="#"+d.color.toString(16).padStart(6,"0");
  document.getElementById("miniOrb").style.background=`radial-gradient(circle at 35% 30%,#fff8,${hex} 42%,#050810 78%)`;
}

function animate(){
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0018;
  moon.position.x=5+Math.cos(performance.now()*0.00035)*7;
  moon.position.z=Math.sin(performance.now()*0.00035)*7;
  starField.rotation.y += 0.000025;
  atmosphere.rotation.y += 0.001;
  controls.update();
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

document.getElementById("fullscreen").onclick=()=>document.documentElement.requestFullscreen?.();
document.getElementById("explore").onclick=()=>document.getElementById("solar").scrollIntoView({behavior:"smooth"});
document.getElementById("random").onclick=()=>{
  const names=Object.keys(data); selectPlanet(names[Math.floor(Math.random()*names.length)]);
};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.target).scrollIntoView({behavior:"smooth"}));

const modal=document.getElementById("modal");
document.getElementById("details").onclick=()=>{
  document.getElementById("modalTitle").textContent=selected.toUpperCase();
  document.getElementById("modalText").textContent=data[selected].info+" This interactive explorer supports smooth 360° viewing with mouse and touch.";
  const d=data[selected]; document.getElementById("modalOrb").style.background=`radial-gradient(circle at 35% 30%,#fff8,#${d.color.toString(16).padStart(6,"0")} 42%,#050810 78%)`;
  modal.classList.remove("hidden");
};
document.getElementById("close").onclick=()=>modal.classList.add("hidden");
modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};

document.getElementById("search").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll(".planet").forEach(p=>p.style.display=p.dataset.name.toLowerCase().includes(q)?"block":"none");
});

document.getElementById("premiumBtn")?.addEventListener("click",()=>{
  alert("Premium is a paid feature. Connect your preferred payment gateway to activate real payments and ad removal.");
});
