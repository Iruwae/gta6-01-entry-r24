export function createBus(){const m=new Map();return{on(e,f){if(!m.has(e))m.set(e,[]);m.get(e).push(f)},emit(e,d){const l=m.get(e);if(l)for(const f of l)f(d)}}}
