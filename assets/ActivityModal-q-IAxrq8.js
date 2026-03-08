import{c as j,r as M,a as d,j as e,L as S,M as _}from"./index-Db5EDn_y.js";const q=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],E=j("navigation",q);const L=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],z=j("x",L);var A=M();const C=(o,l,s,a,t=5e3)=>{let i="",c="";return o>=51&&o<=99?(c="Indoor Venues & Museums",i=`
      node["tourism"="museum"](around:${t},${s},${a});
      node["amenity"="cinema"](around:${t},${s},${a});
      node["amenity"="library"](around:${t},${s},${a});
    `):l>25&&o<=3?(c="Parks & Water Activities",i=`
      node["natural"="beach"](around:${t},${s},${a});
      node["leisure"="park"](around:${t},${s},${a});
      node["tourism"="viewpoint"](around:${t},${s},${a});
    `):l>15&&l<=25&&o<=3?(c="Parks & Nature Reserves",i=`
      node["leisure"="park"](around:${t},${s},${a});
      node["leisure"="nature_reserve"](around:${t},${s},${a});
      node["tourism"="attraction"](around:${t},${s},${a});
    `):l<=15&&o<=3?(c="Cafes & Local Spots",i=`
      node["amenity"="cafe"](around:${t},${s},${a});
      node["amenity"="restaurant"](around:${t},${s},${a});
    `):(c="Nearby Attractions",i=`
      node["tourism"="museum"](around:${t},${s},${a});
      node["amenity"="cafe"](around:${t},${s},${a});
    `),{query:`
    [out:json][timeout:25];
    (
      ${i}
    );
    out body 15;
  `,title:c}};function F({isOpen:o,onClose:l,latitude:s,longitude:a,weatherCode:t,maxTemp:i,locationName:c}){const[m,y]=d.useState([]),[u,f]=d.useState(!1),[p,$]=d.useState(null),[x,v]=d.useState(""),N=c.split(",")[0].trim();return d.useEffect(()=>{if(!o)return;let r=!0;return(async()=>{f(!0),$(null),y([]);const{query:b,title:k}=C(t,i,s,a);v(k);try{const h=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:b});if(!h.ok)throw new Error("Failed to fetch places");const P=await h.json();if(r){const w=(P.elements||[]).filter(n=>n.tags&&n.tags.name).map(n=>({id:n.id,name:n.tags.name,type:n.tags.amenity||n.tags.tourism||n.tags.leisure||n.tags.natural||"place",lat:n.lat,lon:n.lon})),g=Array.from(new Map(w.map(n=>[n.name,n])).values());y(g.slice(0,8)),g.length===0&&$("We couldn't find many matching places nearby. Try exploring the city center!")}}catch{r&&$("Failed to load real-world locations. Please try again later.")}finally{r&&f(!1)}})(),()=>{r=!1}},[o,s,a,t,i]),o?A.createPortal(e.jsx("div",{className:"modal-overlay animate-fade-in",onClick:l,children:e.jsxs("div",{className:"modal-content",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"modal-header",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"modal-title",children:x}),e.jsxs("p",{className:"modal-subtitle",children:["Real places near ",N]})]}),e.jsx("button",{className:"close-button",onClick:l,"aria-label":"Close modal",children:e.jsx(z,{size:24})})]}),e.jsxs("div",{className:"modal-body",children:[u&&e.jsxs("div",{className:"modal-loading",children:[e.jsx(S,{className:"spinner-icon",size:32}),e.jsx("p",{children:"Discovering places..."})]}),p&&!u&&e.jsx("div",{className:"modal-error",children:e.jsx("p",{children:p})}),!u&&!p&&m.length>0&&e.jsx("ul",{className:"places-list",children:m.map(r=>e.jsxs("li",{className:"place-item",children:[e.jsxs("div",{className:"place-info",children:[e.jsx(_,{size:18,className:"place-icon"}),e.jsxs("div",{children:[e.jsx("h4",{className:"place-name",children:r.name}),e.jsx("span",{className:"place-type",children:r.type.replace("_"," ")})]})]}),e.jsxs("a",{href:`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lon}`,target:"_blank",rel:"noopener noreferrer",className:"map-link-btn",children:[e.jsx("span",{children:"View Map"}),e.jsx(E,{size:14})]})]},r.id))})]})]})}),document.body):null}export{F as ActivityModal};
