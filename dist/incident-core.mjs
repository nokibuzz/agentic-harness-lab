// Pure, deterministic teaching adapter. No network, credentials, or write operations.
export const POLICY={id:'POLICY-3',version:3,checked:'2026-11-24',clauses:{
  S1:'SEV1: potvrđen gubitak podataka, privatnost/bezbednost ili globalni prekid ključne funkcije duži od 5 min.',
  S2:'SEV2: ključna funkcija nedostupna delu korisnika duže od 10 min ili široka degradacija duže od 30 min.',
  S3:'SEV3: ograničena degradacija sa funkcionalnim workaroundom.',
  S4:'Nedovoljno dokaza: nepoznat obim/trajanje, sukob izvora ili signal stariji od 30 min.',
  S5:'Read-only: analitičar daje predlog; ne menja incident, tiket ili produkciju.'
}};

const missing=(incident,reason,clause,trace,fields=[])=>({
  id:incident.id,mode:'rules',status:'needs_review',severity:'POTREBNA_PROVERA',reason,
  policy:{id:POLICY.id,version:POLICY.version,clause},
  evidence:[{source:incident.id,fields},{source:POLICY.id,clause}],
  humanGate:'Čovek proverava podatke pre severity odluke. Nema upisa u incident sistem.',
  trace
});
const proposed=(incident,severity,reason,clause,trace,fields)=>({
  id:incident.id,mode:'rules',status:'proposed',severity,reason,
  policy:{id:POLICY.id,version:POLICY.version,clause},
  evidence:[{source:incident.id,fields},{source:POLICY.id,clause}],
  humanGate:'Čovek potvrđuje severity; simulacija ne menja incident sistem.',
  trace
});

export function analyzeIncident(incident){
  if(!incident||typeof incident.id!=='string'||!incident.id)throw new TypeError('Incident mora imati ID.');
  const trace=[{step:'Ulaz',status:'ok',detail:'Normalizovan zahtev za '+incident.id+'.'}];
  if(incident.access!=='allowed'){
    trace.push({step:'Pristup',status:'blocked',detail:'Zapis nije odobren za čitanje.'});
    return missing({id:incident.id},'Pristup incidentu nije odobren. Sadržaj nije korišćen.','S4/S5',trace,['access']);
  }
  trace.push({step:'Pristup',status:'ok',detail:'Dozvoljen samo pregled sintetičkog zapisa.'});
  const age=incident.signal_age_minutes;
  if(typeof age!=='number'||!Number.isFinite(age)||age<0||age>30){
    trace.push({step:'Svežina',status:'blocked',detail:'Signal je stariji od 30 minuta ili vreme nije poznato.'});
    return missing(incident,'Signal je zastareo ili vreme osvežavanja nije pouzdano.','S4',trace,['signal_age_minutes']);
  }
  trace.push({step:'Svežina',status:'ok',detail:'Signal je star '+age+' min.'});
  if(incident.conflicting_sources){
    trace.push({step:'Dokazi',status:'blocked',detail:'Izvori se ne slažu oko obima.'});
    return missing(incident,'Kontradiktorni signali o obimu; potrebna je ljudska provera.','S4',trace,['conflicting_sources','impact']);
  }
  trace.push({step:'Dokazi',status:'ok',detail:'Nije označen sukob izvora.'});
  const duration=incident.duration_minutes;
  const durationRequired=incident.data_loss!==true&&incident.security_or_privacy!==true&&incident.impact!=='ograničena degradacija';
  if(durationRequired&&(typeof duration!=='number'||!Number.isFinite(duration)||duration<0)){
    trace.push({step:'Klasifikacija',status:'blocked',detail:'Trajanje nije pouzdano.'});
    return missing(incident,'Trajanje incidenta nije pouzdano.','S4',trace,['duration_minutes']);
  }
  let result;
  if(incident.data_loss===true||incident.security_or_privacy===true){
    result=proposed(incident,'SEV1','Potvrđen je gubitak podataka ili incident privatnosti/bezbednosti.','S1',trace,['data_loss','security_or_privacy']);
  }else if(incident.impact==='potpuni prekid za sve korisnike'&&duration>5){
    result=proposed(incident,'SEV1','Potpuni prekid ključne funkcije za sve korisnike traje '+duration+' min.','S1',trace,['impact','duration_minutes']);
  }else if(incident.impact==='nedostupno za deo korisnika'&&duration>10){
    result=proposed(incident,'SEV2','Ključna funkcija je nedostupna delu korisnika '+duration+' min.','S2',trace,['impact','duration_minutes']);
  }else if(incident.impact==='široka degradacija ključne funkcije'&&duration>30){
    result=proposed(incident,'SEV2','Široka degradacija ključne funkcije traje '+duration+' min.','S2',trace,['impact','duration_minutes']);
  }else if(incident.impact==='ograničena degradacija'&&incident.workaround===true){
    result=proposed(incident,'SEV3','Ograničena degradacija ima funkcionalan workaround.','S3',trace,['impact','workaround']);
  }else{
    trace.push({step:'Klasifikacija',status:'blocked',detail:'Nijedno pravilo nema dovoljno podataka za predlog.'});
    return missing(incident,'Obim, trajanje ili workaround ne podržavaju sigurnu klasifikaciju.','S4',trace,['impact','duration_minutes','workaround']);
  }
  trace.push({step:'Klasifikacija',status:'ok',detail:'Predlog '+result.severity+' prema '+POLICY.id+' §'+result.policy.clause+'.'});
  trace.push({step:'Izveštaj',status:'ok',detail:'Priloženi su source ID, polja i pasus politike. Čovek potvrđuje.'});
  return result;
}
