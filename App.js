import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Switch, Alert, Modal, BackHandler } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import EXERCISE_IMAGES from './exerciseImages';

const MUSCLE_GROUPS = ["Chest","Back","Shoulders","Biceps","Triceps","Quads","Hamstrings","Calves","Forearms","Abs","Glutes"];
const MUSCLE_COLORS = {
  'Chest':'#F97316','Back':'#10B981','Shoulders':'#EAB308','Biceps':'#EF4444','Triceps':'#6366F1',
  'Quads':'#3B82F6','Hamstrings':'#8B5CF6','Calves':'#14B8A6','Glutes':'#EC4899','Forearms':'#F59E0B','Abs':'#84CC16',
};
const MUSCLE_IMAGES = {
  'Chest':require('./assets/muscles/chest.png'),'Back':require('./assets/muscles/back.png'),
  'Shoulders':require('./assets/muscles/shoulders.png'),'Biceps':require('./assets/muscles/biceps.png'),
  'Triceps':require('./assets/muscles/triceps.png'),'Quads':require('./assets/muscles/quads.png'),
  'Hamstrings':require('./assets/muscles/hamstrings.png'),'Calves':require('./assets/muscles/calves.png'),
  'Forearms':require('./assets/muscles/forearms.png'),'Abs':require('./assets/muscles/abs.png'),'Glutes':require('./assets/muscles/glutes.png'),
};
const GENDER_OPTIONS = ["Male","Female","Other"];

const DARK = {
  bg:'#0F0F0F',card:'#1A1A1A',border:'#2A2A2A',accent:'#3B82F6',accentLight:'#1E3A5F',
  text:'#F1F1F1',textSecondary:'#A0A0A0',textMuted:'#606060',success:'#10B981',danger:'#EF4444',white:'#FFFFFF',
};
const LIGHT = {
  bg:'#F2F2F7',card:'#FFFFFF',border:'#D1D1D6',accent:'#3B82F6',accentLight:'#DBEAFE',
  text:'#1C1C1E',textSecondary:'#6C6C70',textMuted:'#AEAEB2',success:'#10B981',danger:'#EF4444',white:'#FFFFFF',
};

const parseDecimal = (val) => {
  if (typeof val !== 'string') return parseFloat(val) || 0;
  const n = parseFloat(val.replace(',','.'));
  return isNaN(n) ? 0 : n;
};

function ExPickerModal({ visible, exercises, onClose, onPick, C, recentExIds=[] }) {
  const [search, setSearch] = useState('');
  const [openMuscle, setOpenMuscle] = useState(null);
  const [previewEx, setPreviewEx] = useState(null);
  useEffect(() => { if (!visible) { setSearch(''); setOpenMuscle(null); setPreviewEx(null); } }, [visible]);
  if (!visible) return null;
  const styles = makeStyles(C);

  const renderExGrid = (list, onPickEx) => {
    const recent = list.filter(e=>recentExIds.includes(e.id));
    const rest = list.filter(e=>!recentExIds.includes(e.id));
    const renderCard = (e) => (
      <TouchableOpacity key={e.id} onPress={()=>onPickEx(e.id)}
        onLongPress={()=>setPreviewEx(e)} delayLongPress={400}
        style={{width:'48%',backgroundColor:C.card,borderRadius:12,padding:12,alignItems:'center',borderWidth:recentExIds.includes(e.id)?1:0.5,borderColor:recentExIds.includes(e.id)?C.accent:C.border}}>
        {e.image && EXERCISE_IMAGES[e.image] ? (
          <Image source={EXERCISE_IMAGES[e.image]} style={{width:70,height:70,borderRadius:8,marginBottom:6}} resizeMode="cover"/>
        ) : (
          <Text style={{fontSize:30,marginBottom:6}}>{e.isBodyweight?'🏃':'🏋️'}</Text>
        )}
        <Text style={[styles.cardTitle,{fontSize:13,textAlign:'center',marginBottom:2}]} numberOfLines={2}>{e.name}</Text>
        <Text style={[styles.cardSub,{fontSize:11,textAlign:'center'}]}>{e.equipment}</Text>
      </TouchableOpacity>
    );
    return (
      <>
        {recent.length>0&&(
          <>
            <Text style={[styles.cardSub,{marginBottom:8,color:C.accent}]}>Recent</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:12}}>
              {recent.map(e=>renderCard(e))}
            </View>
            <View style={{height:1,backgroundColor:C.border,marginBottom:12}}/>
          </>
        )}
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
          {rest.map(e=>renderCard(e))}
        </View>
      </>
    );
  };

  if (openMuscle) {
    const list = exercises.filter(e => e.muscle===openMuscle && e.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{width:'100%'}}>
          <View style={[styles.modal,{maxHeight:'92%',height:'92%'}]}>
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={()=>{setOpenMuscle(null);setSearch('');}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
              <Text style={styles.sectionTitle}>{openMuscle}</Text>
              <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
            </View>
            <TextInput style={[styles.searchInput,{marginTop:10}]} value={search} onChangeText={setSearch} placeholder="Search..." placeholderTextColor={C.textMuted}/>
            <ScrollView keyboardShouldPersistTaps="handled" style={{flex:1}} contentContainerStyle={{paddingBottom:20}}>
              {list.length===0?<Text style={[styles.emptyText,{marginTop:10}]}>No exercises here yet.</Text>:
                renderExGrid(list, (id)=>{onPick(id);setOpenMuscle(null);setSearch('');})
              }
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
      {previewEx&&(
        <Modal visible={true} transparent animationType="fade" onRequestClose={()=>setPreviewEx(null)}>
          <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setPreviewEx(null)}>
            <View style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
              {previewEx.image&&EXERCISE_IMAGES[previewEx.image]?
                <Image source={EXERCISE_IMAGES[previewEx.image]} style={{width:'100%',height:320}} resizeMode="contain"/>:
                <View style={{width:'100%',height:320,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{previewEx.isBodyweight?'🏃':'🏋️'}</Text></View>
              }
              <View style={{padding:16}}>
                <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{previewEx.name}</Text>
                <Text style={styles.cardSub}>{previewEx.muscle} · {previewEx.equipment}</Text>
                <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{onPick(previewEx.id);setPreviewEx(null);}}>
                  <Text style={styles.primaryBtnText}>+ Add to workout</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setPreviewEx(null)}>
                <Text style={{color:'white',fontSize:18}}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close</Text>
          </TouchableOpacity>
        </Modal>
      )}
      </>
    );
  }
  return (
    <>
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <View style={[styles.modal,{maxHeight:'92%',height:'92%'}]}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Add exercise</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
        </View>
        {exercises.length===0?<View style={styles.emptyState}><Text style={styles.emptyText}>No exercises yet. Go to Exercises tab!</Text></View>:<>
        <TextInput style={[styles.searchInput,{marginTop:10}]} value={search} onChangeText={setSearch} placeholder="Search exercises..." placeholderTextColor={C.textMuted}/>
        <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:20}}>
          {search.length>0?(
            renderExGrid(exercises.filter(e=>e.name.toLowerCase().includes(search.toLowerCase())), (id)=>{onPick(id);setSearch('');})
          ):(
            MUSCLE_GROUPS.map(muscle=>{
              const count=exercises.filter(e=>e.muscle===muscle).length;
              return (
                <TouchableOpacity key={muscle} style={styles.muscleGroupHeader} onPress={()=>{setOpenMuscle(muscle);setSearch('');}}>
                  <View style={styles.muscleIconWrapSmall}><Image source={MUSCLE_IMAGES[muscle]} style={{width:60,height:60}} resizeMode="contain"/></View>
                  <View style={{flex:1}}><Text style={styles.muscleGroupName}>{muscle}</Text><Text style={styles.cardSub}>{count} exercise{count!==1?'s':''}</Text></View>
                  <Text style={{color:C.textMuted,fontSize:18}}>›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView></>}
      </View>
    </TouchableOpacity>
    {previewEx&&(
      <Modal visible={true} transparent animationType="fade" onRequestClose={()=>setPreviewEx(null)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setPreviewEx(null)}>
          <View style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
            {previewEx.image&&EXERCISE_IMAGES[previewEx.image]?
              <Image source={EXERCISE_IMAGES[previewEx.image]} style={{width:'100%',height:320}} resizeMode="contain"/>:
              <View style={{width:'100%',height:320,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{previewEx.isBodyweight?'🏃':'🏋️'}</Text></View>
            }
            <View style={{padding:16}}>
              <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{previewEx.name}</Text>
              <Text style={styles.cardSub}>{previewEx.muscle} · {previewEx.equipment}</Text>
              <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{onPick(previewEx.id);setPreviewEx(null);}}>
                <Text style={styles.primaryBtnText}>+ Add to workout</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setPreviewEx(null)}>
              <Text style={{color:'white',fontSize:18}}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    )}
    </>
  );
}

function AddExModal({ visible, muscle, nextExId, onClose, onSave, C }) {
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('Barbell');
  const [isBodyweight, setIsBodyweight] = useState(false);
  useEffect(() => { if (!visible) { setName(''); setEquipment('Barbell'); setIsBodyweight(false); } }, [visible]);
  if (!visible) return null;
  const styles = makeStyles(C);
  return (
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{width:'100%'}}>
        <TouchableOpacity style={[styles.modal,{maxHeight:'90%'}]} activeOpacity={1} onPress={()=>{}}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Add exercise — {muscle}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
          </View>
          <Text style={[styles.cardSub,{marginTop:12,marginBottom:4}]}>Exercise name</Text>
          <TextInput style={styles.searchInput} value={name} onChangeText={setName} placeholder="e.g. Bench Press" placeholderTextColor={C.textMuted}/>
          <Text style={[styles.cardSub,{marginBottom:8}]}>Equipment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
            {EQUIPMENT_OPTIONS.map(eq=>(
              <TouchableOpacity key={eq} style={[styles.filterTag,equipment===eq&&styles.filterTagActive,{marginRight:6}]} onPress={()=>setEquipment(eq)}>
                <Text style={[styles.filterTagText,equipment===eq&&styles.filterTagTextActive]}>{eq}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={[styles.rowBetween,{marginBottom:16}]}>
            <Text style={styles.cardSub}>Bodyweight exercise (adds BW to weight)</Text>
            <Switch value={isBodyweight} onValueChange={setIsBodyweight} trackColor={{true:C.accent}} thumbColor={C.white}/>
          </View>
          <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center'}]} onPress={()=>{if(!name.trim())return;onSave({id:nextExId,name:name.trim(),muscle,equipment,isBodyweight});setName('');setEquipment('Barbell');setIsBodyweight(false);}}>
            <Text style={styles.primaryBtnText}>Save exercise</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
}

function EditWorkoutModal({ visible, workout, exercises, onClose, onSave, onAddExercise, C }) {
  const [local, setLocal] = useState(null);
  useEffect(() => { if (visible && workout) setLocal(JSON.parse(JSON.stringify(workout))); }, [visible, workout]);
  if (!visible || !local) return null;
  const styles = makeStyles(C);
  const getEx = (id) => exercises.find(e => e.id === id);
  const upd = (fn) => { const u=JSON.parse(JSON.stringify(local)); fn(u); setLocal(u); };
  return (
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity style={[styles.modal,{maxHeight:'90%'}]} activeOpacity={1} onPress={()=>{}}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Edit Workout</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.cardSub,{marginTop:12,marginBottom:4}]}>Workout name</Text>
          <TextInput style={styles.searchInput} value={local.name} onChangeText={t=>setLocal({...local,name:t})} placeholder="Workout name" placeholderTextColor={C.textMuted}/>
          <Text style={[styles.cardSub,{marginBottom:4}]}>Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.searchInput} value={local.date} onChangeText={t=>setLocal({...local,date:t})} placeholder="2026-06-29" placeholderTextColor={C.textMuted}/>
          <Text style={[styles.cardSub,{marginBottom:4}]}>Gym</Text>
          <TextInput style={styles.searchInput} value={local.gym||''} onChangeText={t=>setLocal({...local,gym:t})} placeholder="Gym name" placeholderTextColor={C.textMuted}/>
          <Text style={[styles.cardSub,{marginTop:4,marginBottom:8}]}>Exercises</Text>
          {local.exercises.map((ex,eIdx)=>{
            const info=getEx(ex.exId);
            return (
              <View key={eIdx} style={[styles.logExCard,{marginBottom:10,borderLeftColor:MUSCLE_COLORS[info?.muscle]||C.accent}]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{info?.name||'Unknown'}</Text>
                  <TouchableOpacity onPress={()=>upd(u=>u.exercises.splice(eIdx,1))}><Text style={{color:C.danger}}>X</Text></TouchableOpacity>
                </View>
                <View style={[styles.row,{marginBottom:4,marginTop:8}]}>
                  <Text style={[styles.tableHeader,{width:24}]}>#</Text>
                  <Text style={[styles.tableHeader,{flex:1}]}>kg</Text>
                  <Text style={[styles.tableHeader,{flex:1}]}>Reps</Text>
                  <Text style={{width:33}}/><Text style={{width:28}}/>
                </View>
                {ex.sets.map((set,sIdx)=>{
                  if (set.unilateral) {
                    const order=set.swapped?['R','L']:['L','R'];
                    return (
                      <View key={sIdx} style={{marginBottom:6}}>
                        <View style={styles.row}>
                          <Text style={[styles.cardSub,{width:24}]}>{order[0]}</Text>
                          <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[0]==='L'?(set.weightL??0):(set.weightR??0))} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx]['weight'+order[0]]=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                          <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[0]==='L'?(set.repsL??0):(set.repsR??0))} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx]['reps'+order[0]]=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                          <TouchableOpacity onPress={()=>upd(u=>{u.exercises[eIdx].sets[sIdx].completed=!set.completed;})} style={[styles.checkBadge,set.completed&&styles.checkBadgeActive]}>
                            <Text style={[styles.checkBadgeText,set.completed&&styles.checkBadgeTextActive]}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={()=>upd(u=>u.exercises[eIdx].sets.splice(sIdx,1))} style={{width:28,alignItems:'center'}}><Text style={{color:C.textMuted}}>X</Text></TouchableOpacity>
                        </View>
                        <View style={[styles.row,{marginTop:4}]}>
                          <Text style={[styles.cardSub,{width:24}]}>{order[1]}</Text>
                          <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[1]==='L'?(set.weightL??0):(set.weightR??0))} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx]['weight'+order[1]]=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                          <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[1]==='L'?(set.repsL??0):(set.repsR??0))} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx]['reps'+order[1]]=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                          <View style={{width:33}}/><View style={{width:28}}/>
                        </View>
                      </View>
                    );
                  }
                  return (
                    <View key={sIdx} style={{marginBottom:6}}>
                      <View style={styles.row}>
                        <Text style={[styles.cardSub,{width:24,color:set.warmup?'#EAB308':C.textSecondary}]}>{sIdx+1}</Text>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6},set.warmup&&styles.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.weight)} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx].weight=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6},set.warmup&&styles.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.reps)} onChangeText={v=>upd(u=>{u.exercises[eIdx].sets[sIdx].reps=parseDecimal(v);})} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <TouchableOpacity onPress={()=>upd(u=>{u.exercises[eIdx].sets[sIdx].completed=!set.completed;})} style={[styles.checkBadge,set.completed&&styles.checkBadgeActive]}>
                          <Text style={[styles.checkBadgeText,set.completed&&styles.checkBadgeTextActive]}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>upd(u=>u.exercises[eIdx].sets.splice(sIdx,1))} style={{width:28,alignItems:'center'}}><Text style={{color:C.textMuted}}>X</Text></TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity style={styles.addSetBtn} onPress={()=>upd(u=>u.exercises[eIdx].sets.push({reps:0,weight:0,warmup:false,unilateral:false,completed:false,hasPartials:false,partialReps:0,hasMyoReps:false,myoSets:0,myoReps:0}))}>
                  <Text style={styles.addSetBtnText}>+ Add set</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity style={[styles.addExBtn,{marginTop:8,marginBottom:4}]} onPress={onAddExercise}>
            <Text style={styles.addExBtnText}>+ Add exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:8,marginBottom:8}]} onPress={()=>onSave(local)}>
            <Text style={styles.primaryBtnText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function MachinePickerModal({ visible, machines, newMachineName, onChangeNewMachineName, onAddMachine, onDeleteMachine, onSelectMachine, onClose, C }) {
  const styles = makeStyles(C);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.6)'}}>
        <View style={[styles.modal,{maxHeight:'80%',marginBottom:50}]}>
          <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Select machine</Text><TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity></View>
          <ScrollView>
            {machines.length===0?<Text style={[styles.emptyText,{textAlign:'left',marginBottom:12}]}>No machines added yet.</Text>:machines.map(m=>(
              <View key={m.id} style={styles.gymRow}>
                <TouchableOpacity style={{flex:1}} onPress={()=>onSelectMachine(m.id)}><Text style={styles.cardTitle}>{m.name}</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>onDeleteMachine(m.id)} style={{padding:6}}><Text style={{color:C.danger}}>🗑</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={[styles.cardSub,{marginTop:14,marginBottom:6}]}>Add a new machine</Text>
          <View style={styles.row}>
            <TextInput style={[styles.searchInput,{flex:1,marginBottom:0,marginRight:8}]} value={newMachineName} onChangeText={onChangeNewMachineName} placeholder="e.g. Cable Machine A" placeholderTextColor={C.textMuted}/>
            <TouchableOpacity style={styles.primaryBtn} onPress={onAddMachine}><Text style={styles.primaryBtnText}>Add</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NotesModal({ visible, draft, onChangeDraft, onSave, onClose, C }) {
  const styles = makeStyles(C);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.6)'}}>
        <View style={[styles.modal,{maxHeight:'60%',marginBottom:50}]}>
          <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Exercise notes</Text><TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity></View>
          <Text style={[styles.cardSub,{marginBottom:8}]}>Seat position, pad height, etc.</Text>
          <TextInput style={[styles.searchInput,{height:90,textAlignVertical:'top'}]} value={draft} onChangeText={onChangeDraft} placeholder="e.g. Seat 4, pad high" placeholderTextColor={C.textMuted} multiline autoFocus/>
          <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={onSave}><Text style={styles.primaryBtnText}>Save notes</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ConfirmModal({ visible, title, message, confirmLabel, onConfirm, onCancel, C }) {
  if (!visible) return null;
  const styles = makeStyles(C);
  return (
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onCancel}>
      <TouchableOpacity style={[styles.modal,{maxHeight:'40%'}]} activeOpacity={1} onPress={()=>{}}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={[styles.cardSub,{marginTop:8,marginBottom:16}]}>{message}</Text>
        <View style={[styles.row,{gap:10}]}>
          <TouchableOpacity style={[styles.ghostBtn,{flex:1,alignItems:'center'}]} onPress={onCancel}><Text style={{color:C.text,fontSize:15}}>No</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn,{flex:1,alignItems:'center',backgroundColor:C.danger}]} onPress={onConfirm}><Text style={styles.primaryBtnText}>{confirmLabel||'Yes'}</Text></TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FavoritesBuilderModal({ visible, exercises, onClose, onSave, editingFav, C }) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMuscle, setOpenMuscle] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (visible && editingFav) { setName(editingFav.name); setSelectedIds([...editingFav.exerciseIds]); }
    else if (!visible) { setName(''); setSelectedIds([]); setOpenMuscle(null); setSearch(''); }
  }, [visible, editingFav]);
  if (!visible) return null;
  const styles = makeStyles(C);
  const toggleEx = (id) => setSelectedIds(prev => prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  if (openMuscle) {
    const list = exercises.filter(e=>e.muscle===openMuscle&&e.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{width:'100%'}}>
          <View style={[styles.modal,{maxHeight:'92%',height:'92%'}]}>
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={()=>{setOpenMuscle(null);setSearch('');}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
              <Text style={styles.sectionTitle}>{openMuscle}</Text>
              <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
            </View>
            <TextInput style={[styles.searchInput,{marginTop:8}]} value={search} onChangeText={setSearch} placeholder="Search..." placeholderTextColor={C.textMuted}/>
            <ScrollView keyboardShouldPersistTaps="handled" style={{flex:1}} contentContainerStyle={{paddingBottom:20}}>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                {list.map(e=>{const sel=selectedIds.includes(e.id);return(
                  <TouchableOpacity key={e.id} onPress={()=>toggleEx(e.id)}
                    style={{width:'48%',backgroundColor:C.bg,borderRadius:12,padding:10,alignItems:'center',borderWidth:sel?1.5:0.5,borderColor:sel?C.success:C.border}}>
                    <View style={{width:70,height:70,borderRadius:10,backgroundColor:C.card,alignItems:'center',justifyContent:'center',marginBottom:6,overflow:'hidden'}}>
                      {e.image&&EXERCISE_IMAGES[e.image]?<Image source={EXERCISE_IMAGES[e.image]} style={{width:70,height:70,borderRadius:10}} resizeMode="cover"/>:<Text style={{fontSize:28}}>{e.isBodyweight?'🏃':'🏋️'}</Text>}
                    </View>
                    <Text style={[styles.cardTitle,{fontSize:12,textAlign:'center',marginBottom:2}]} numberOfLines={2}>{e.name}</Text>
                    <Text style={[styles.cardSub,{fontSize:11}]}>{e.equipment}</Text>
                    {sel&&<Text style={{color:C.success,fontSize:13,marginTop:2}}>✓</Text>}
                  </TouchableOpacity>
                );})}
              </View>
            </ScrollView>
            <Text style={[styles.cardSub,{marginTop:8}]}>{selectedIds.length} exercises selected</Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity style={[styles.modal,{maxHeight:'90%'}]} activeOpacity={1} onPress={()=>{}}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{editingFav?'Edit favorite':'New favorite workout'}</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
        </View>
        <Text style={[styles.cardSub,{marginTop:8,marginBottom:4}]}>Template name</Text>
        <TextInput style={styles.searchInput} value={name} onChangeText={setName} placeholder="e.g. Push Day A" placeholderTextColor={C.textMuted}/>
        <Text style={[styles.cardSub,{marginBottom:8}]}>Select exercises ({selectedIds.length} selected)</Text>
        <ScrollView style={{maxHeight:340}}>
          {exercises.length===0?<Text style={styles.emptyText}>Add exercises to your library first.</Text>:
            MUSCLE_GROUPS.filter(m=>exercises.some(e=>e.muscle===m)).map(muscle=>{
              const count=exercises.filter(e=>e.muscle===muscle).length;
              const selCount=selectedIds.filter(id=>exercises.find(e=>e.id===id&&e.muscle===muscle)).length;
              return (
                <TouchableOpacity key={muscle} style={styles.muscleGroupHeader} onPress={()=>{setOpenMuscle(muscle);setSearch('');}}>
                  <View style={styles.muscleIconWrapSmall}><Image source={MUSCLE_IMAGES[muscle]} style={{width:60,height:60}} resizeMode="contain"/></View>
                  <View style={{flex:1}}><Text style={styles.muscleGroupName}>{muscle}</Text><Text style={styles.cardSub}>{count} exercise{count!==1?'s':''}{selCount>0?` · ${selCount} selected`:''}</Text></View>
                  <Text style={{color:C.textMuted,fontSize:18}}>›</Text>
                </TouchableOpacity>
              );
            })
          }
        </ScrollView>
        <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{if(!name.trim()||selectedIds.length===0)return;onSave({name:name.trim(),exerciseIds:selectedIds});}}>
          <Text style={styles.primaryBtnText}>Save favorite</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const makeStyles = (C) => StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  page:{flex:1,paddingHorizontal:19,paddingTop:66},
  centered:{alignItems:'center',justifyContent:'center'},
  pageTitle:{fontSize:28,fontWeight:'600',color:C.text,marginBottom:19},
  sectionTitle:{fontSize:19,fontWeight:'500',color:C.text},
  card:{backgroundColor:C.card,borderRadius:14,padding:19,marginBottom:14,borderWidth:0.5,borderColor:C.border},
  logExCard:{backgroundColor:C.card,borderRadius:14,padding:16,marginBottom:12,borderWidth:0.5,borderColor:C.border,borderLeftWidth:5},
  cardTitle:{fontSize:18,fontWeight:'500',color:C.text},
  cardSub:{fontSize:15,color:C.textSecondary,marginTop:2},
  exVolumeText:{fontSize:13,color:C.accent,fontWeight:'600',marginBottom:2},
  setVolumeText:{fontSize:11,color:C.textMuted,fontWeight:'500'},
  statRow:{flexDirection:'row',gap:12,marginBottom:19},
  statCard:{flex:1,backgroundColor:C.card,borderRadius:12,padding:14,borderWidth:0.5,borderColor:C.border},
  statVal:{fontSize:26,fontWeight:'500',color:C.text},
  statLabel:{fontSize:13,color:C.textMuted,marginTop:2},
  rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
  row:{flexDirection:'row',alignItems:'center'},
  primaryBtn:{backgroundColor:C.accent,paddingHorizontal:19,paddingVertical:9,borderRadius:9},
  primaryBtnText:{color:'#FFFFFF',fontWeight:'500',fontSize:16},
  ghostBtn:{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9},
  ghostBtnText:{color:C.textSecondary,fontSize:19},
  badge:{backgroundColor:C.accentLight,paddingHorizontal:12,paddingVertical:5,borderRadius:9},
  badgeText:{color:C.accent,fontSize:14,fontWeight:'500'},
  emptyState:{alignItems:'center',paddingVertical:47},
  emptyIcon:{fontSize:47,marginBottom:14},
  emptyText:{color:C.textMuted,fontSize:16,textAlign:'center',lineHeight:26},
  workoutNameInput:{flex:1,fontSize:19,fontWeight:'500',color:C.text,borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9,marginRight:9,backgroundColor:C.card},
  setInput:{borderWidth:0.5,borderColor:C.border,borderRadius:7,paddingHorizontal:6,paddingVertical:4,backgroundColor:C.card,color:C.text,textAlign:'center',fontSize:15},
  tableHeader:{fontSize:14,color:C.textMuted,marginBottom:2},
  addSetBtn:{borderWidth:1,borderStyle:'dashed',borderColor:C.border,borderRadius:9,padding:9,alignItems:'center',marginTop:7},
  addSetBtnText:{color:C.textMuted,fontSize:15},
  addExBtn:{borderWidth:1,borderStyle:'dashed',borderColor:C.border,borderRadius:9,padding:14,alignItems:'center',marginTop:5},
  addExBtnText:{color:C.textMuted,fontSize:16},
  searchInput:{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9,backgroundColor:C.card,color:C.text,fontSize:16,marginBottom:12},
  filterTag:{paddingHorizontal:14,paddingVertical:6,borderRadius:116,borderWidth:0.5,borderColor:C.border,backgroundColor:C.card,marginRight:7},
  filterTagActive:{backgroundColor:C.accentLight,borderColor:C.accent},
  filterTagText:{fontSize:14,color:C.textSecondary},
  filterTagTextActive:{color:C.accent},
  exRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12},
  exGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:5},
  exGridCard:{width:'47%',backgroundColor:C.bg,borderRadius:14,padding:14,alignItems:'center',borderWidth:0.5,borderColor:C.border},
  exGridImgWrap:{width:94,height:94,borderRadius:14,backgroundColor:C.card,alignItems:'center',justifyContent:'center',marginBottom:9},
  exGridName:{fontSize:15,fontWeight:'500',color:C.text,textAlign:'center',marginBottom:2},
  exGridSub:{fontSize:13,color:C.textMuted,textAlign:'center'},
  barRow:{flexDirection:'row',alignItems:'center',marginBottom:7},
  barLabel:{fontSize:13,color:C.textSecondary,width:70},
  barWrap:{flex:1,backgroundColor:C.card,borderRadius:5,height:26,overflow:'hidden'},
  barFill:{height:'100%',borderRadius:5,justifyContent:'center',paddingLeft:7},
  barText:{fontSize:13,color:C.accent,fontWeight:'500'},
  navbar:{flexDirection:'row',borderTopWidth:0.5,borderTopColor:C.border,backgroundColor:C.card,paddingBottom:20,paddingTop:9},
  navTab:{flex:1,alignItems:'center'},
  navIcon:{fontSize:26,opacity:0.5},
  navLabel:{fontSize:13,color:C.textMuted,marginTop:2},
  modalBackdrop:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'},
  modal:{backgroundColor:C.card,borderTopLeftRadius:16,borderTopRightRadius:16,padding:23},
  dropdownMenu:{marginTop:9,backgroundColor:C.card,borderRadius:12,borderWidth:0.5,borderColor:C.border,overflow:'hidden'},
  dropdownItem:{paddingVertical:14,paddingHorizontal:16},
  dropdownItemText:{fontSize:16,color:C.text},
  dropdownDivider:{height:0.5,backgroundColor:C.border},
  muscleGroupHeader:{flexDirection:'row',alignItems:'center',backgroundColor:C.card,borderRadius:14,padding:16,marginBottom:0,borderWidth:0.5,borderColor:C.border,gap:14},
  muscleGroupName:{fontSize:23,fontWeight:'600',color:C.text},
  muscleIconWrap:{width:152,height:152,borderRadius:47,alignItems:'center',justifyContent:'center'},
  muscleIconWrapSmall:{width:82,height:82,borderRadius:16,alignItems:'center',justifyContent:'center'},
  backBtn:{paddingVertical:7,paddingHorizontal:14,borderRadius:9,backgroundColor:C.card,borderWidth:0.5,borderColor:C.border},
  backBtnText:{color:C.accent,fontSize:16,fontWeight:'500'},
  lastSessionHint:{fontSize:13,color:C.textMuted,marginLeft:28,marginTop:-2},
  warmupBadge:{width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:C.card},
  warmupBadgeActive:{backgroundColor:'#3A2E0A',borderColor:'#EAB308'},
  warmupBadgeText:{fontSize:13,fontWeight:'600',color:C.textMuted},
  warmupBadgeTextActive:{color:'#EAB308'},
  setInputWarmup:{borderColor:'#EAB308',backgroundColor:'#1A1608'},
  warmupBadgeIdle:{borderColor:'#5A4A1A'},
  warmupBadgeTextIdle:{color:'#EAB308'},
  unilateralBadge:{width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:'#3A2E5A',alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:C.card},
  unilateralBadgeText:{fontSize:13,fontWeight:'600',color:'#8B5CF6'},
  unilateralBadgeActive:{backgroundColor:'#1E1A3A',borderColor:'#8B5CF6'},
  unilateralBadgeTextActive:{color:'#8B5CF6'},
  unilateralBadgeBorder:{borderColor:'#3A2E5A'},
  wordBadge:{paddingHorizontal:14,paddingVertical:8,borderRadius:8,borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center',marginRight:8,backgroundColor:C.card},
  wordBadgeText:{fontSize:13,fontWeight:'600',color:C.textMuted},
  partialsBadgeIdle:{borderColor:'#1E4A5A'},partialsBadgeTextIdle:{color:'#22D3EE'},partialsBadgeActive:{backgroundColor:'#0A2E38',borderColor:'#22D3EE'},partialsBadgeTextActive:{color:'#22D3EE'},
  myoBadgeIdle:{borderColor:'#5A1A3A'},myoBadgeTextIdle:{color:'#F472B6'},myoBadgeActive:{backgroundColor:'#3A0A22',borderColor:'#F472B6'},myoBadgeTextActive:{color:'#F472B6'},
  dropBadgeIdle:{borderColor:'#1A3A2A'},dropBadgeTextIdle:{color:'#34D399'},dropBadgeActive:{backgroundColor:'#0A2A1A',borderColor:'#34D399'},dropBadgeTextActive:{color:'#34D399'},
  swapBtn:{alignSelf:'flex-start',marginTop:7,paddingVertical:5,paddingHorizontal:12,borderRadius:7,backgroundColor:C.card,borderWidth:0.5,borderColor:C.border,marginLeft:28},
  swapBtnText:{color:C.accent,fontSize:14,fontWeight:'500'},
  checkBadge:{width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:C.border,alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:C.card},
  checkBadgeActive:{backgroundColor:'#0E3A26',borderColor:'#10B981'},
  checkBadgeText:{fontSize:15,fontWeight:'700',color:C.textMuted},
  checkBadgeTextActive:{color:'#10B981'},
  settingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:14,borderBottomWidth:0.5,borderBottomColor:C.border},
  settingLabel:{fontSize:16,color:C.text},
  settingInput:{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:12,paddingVertical:8,backgroundColor:C.bg,color:C.text,fontSize:16,minWidth:100,textAlign:'right'},
});

function DraggableExCard({ children, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  return (
    <View style={{flexDirection:'row', alignItems:'stretch'}}>
      <View style={{width:32, justifyContent:'center', alignItems:'center', gap:4}}>
        <TouchableOpacity onPress={onMoveUp} disabled={!canMoveUp}
          style={{opacity:canMoveUp?1:0.2, padding:4}}>
          <Text style={{fontSize:18, color:'#3B82F6'}}>▲</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMoveDown} disabled={!canMoveDown}
          style={{opacity:canMoveDown?1:0.2, padding:4}}>
          <Text style={{fontSize:18, color:'#3B82F6'}}>▼</Text>
        </TouchableOpacity>
      </View>
      <View style={{flex:1}}>
        {children}
      </View>
    </View>
  );
}

function FavBuilderPageV2({ exercises, editingFav, onBack, onSave, C }) {
  const styles = makeStyles(C);
  const [fbName, setFbName] = useState(editingFav?.name||'');
  const [fbSelected, setFbSelected] = useState(editingFav?.exerciseIds?[...editingFav.exerciseIds]:[]);
  const [fbMuscle, setFbMuscle] = useState(null);
  const [fbSearch, setFbSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [fbPreview, setFbPreview] = useState(null);

  const toggleEx = (id) => setFbSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const removeEx = (id) => setFbSelected(prev=>prev.filter(x=>x!==id));
  const moveEx = (idx, dir) => {
    setFbSelected(prev => {
      const arr = [...prev];
      const newIdx = dir==='up'?idx-1:idx+1;
      if (newIdx<0||newIdx>=arr.length) return arr;
      const tmp = arr[idx]; arr[idx]=arr[newIdx]; arr[newIdx]=tmp;
      return arr;
    });
  };
  const [nameError, setNameError] = useState(false);
  const save = () => {
    if (!fbName.trim()) { setNameError(true); return; }
    if (fbSelected.length===0) return;
    setNameError(false);
    onSave({name:fbName.trim(),exerciseIds:fbSelected});
  };

  // Exercise picker - muscle list
  if (showPicker && !fbMuscle) {
    const filtered = fbSearch.length>0
      ? exercises.filter(e=>e.name.toLowerCase().includes(fbSearch.toLowerCase()))
      : null;
    return (
      <>
      <View style={{flex:1,backgroundColor:C.bg}}>
        <View style={[styles.rowBetween,{paddingHorizontal:16,paddingTop:56,paddingBottom:8}]}>
          <TouchableOpacity onPress={()=>{setShowPicker(false);setFbSearch('');}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.pageTitle,{margin:0}]}>Add exercise</Text>
          <View style={{width:60}}/>
        </View>
        <TextInput style={[styles.searchInput,{marginHorizontal:16}]} value={fbSearch} onChangeText={setFbSearch} placeholder="Search exercises..." placeholderTextColor={C.textMuted} autoFocus={false}/>
        <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">
          {filtered ? (
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
              {filtered.map(e=>{const sel=fbSelected.includes(e.id);return(
                <TouchableOpacity key={e.id} onPress={()=>toggleEx(e.id)} onLongPress={()=>setFbPreview(e)} delayLongPress={400}
                  style={{width:'48%',backgroundColor:C.card,borderRadius:12,padding:10,alignItems:'center',borderWidth:sel?1.5:0.5,borderColor:sel?C.success:C.border}}>
                  <View style={{width:70,height:70,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginBottom:6,overflow:'hidden'}}>
                    {e.image&&EXERCISE_IMAGES[e.image]?<Image source={EXERCISE_IMAGES[e.image]} style={{width:70,height:70}} resizeMode="cover"/>:<Text style={{fontSize:28}}>{e.isBodyweight?'🏃':'🏋️'}</Text>}
                  </View>
                  <Text style={[styles.cardTitle,{fontSize:12,textAlign:'center',marginBottom:2}]} numberOfLines={2}>{e.name}</Text>
                  <Text style={[styles.cardSub,{fontSize:11}]}>{e.equipment}</Text>
                  {sel&&<Text style={{color:C.success,fontSize:12,marginTop:2}}>✓</Text>}
                </TouchableOpacity>
              );})}
            </View>
          ) : (
            MUSCLE_GROUPS.filter(m=>exercises.some(e=>e.muscle===m)).map(muscle=>{
              const count=exercises.filter(e=>e.muscle===muscle).length;
              const selCount=fbSelected.filter(id=>exercises.find(e=>e.id===id&&e.muscle===muscle)).length;
              return (
                <TouchableOpacity key={muscle} style={[styles.muscleGroupHeader,{marginBottom:8}]} onPress={()=>setFbMuscle(muscle)}>
                  <View style={styles.muscleIconWrapSmall}><Image source={MUSCLE_IMAGES[muscle]} style={{width:60,height:60}} resizeMode="contain"/></View>
                  <View style={{flex:1}}>
                    <Text style={styles.muscleGroupName}>{muscle}</Text>
                    <Text style={styles.cardSub}>{count} exercise{count!==1?'s':''}{selCount>0?` · ${selCount} selected`:''}</Text>
                  </View>
                  <Text style={{color:selCount>0?C.success:C.textMuted,fontSize:18}}>{selCount>0?`✓ ${selCount}`:'›'}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
      {fbPreview&&(
        <Modal visible={true} transparent animationType="fade" onRequestClose={()=>setFbPreview(null)}>
          <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setFbPreview(null)}>
            <View style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
              {fbPreview.image&&EXERCISE_IMAGES[fbPreview.image]?
                <Image source={EXERCISE_IMAGES[fbPreview.image]} style={{width:'100%',height:320}} resizeMode="contain"/>:
                <View style={{width:'100%',height:320,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{fbPreview.isBodyweight?'🏃':'🏋️'}</Text></View>
              }
              <View style={{padding:16}}>
                <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{fbPreview.name}</Text>
                <Text style={styles.cardSub}>{fbPreview.muscle} · {fbPreview.equipment}</Text>
                <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{toggleEx(fbPreview.id);setFbPreview(null);}}>
                  <Text style={styles.primaryBtnText}>{fbSelected.includes(fbPreview.id)?'✓ Selected — tap to remove':'+ Add to favorite'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setFbPreview(null)}>
                <Text style={{color:'white',fontSize:18}}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close</Text>
          </TouchableOpacity>
        </Modal>
      )}
      </>
    );
  }

  // Exercise picker - muscle exercises
  if (showPicker && fbMuscle) {
    const list = exercises.filter(e=>e.muscle===fbMuscle&&e.name.toLowerCase().includes(fbSearch.toLowerCase()));
    return (
      <>
      <View style={{flex:1,backgroundColor:C.bg}}>
        <View style={[styles.rowBetween,{paddingHorizontal:16,paddingTop:56,paddingBottom:8}]}>
          <TouchableOpacity onPress={()=>{setFbMuscle(null);setFbSearch('');}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
          <Text style={[styles.pageTitle,{margin:0}]}>{fbMuscle}</Text>
          <Text style={[styles.cardSub,{color:C.accent}]}>{fbSelected.length} selected</Text>
        </View>
        <TextInput style={[styles.searchInput,{marginHorizontal:16}]} value={fbSearch} onChangeText={setFbSearch} placeholder="Search..." placeholderTextColor={C.textMuted}/>
        <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
            {list.map(e=>{const sel=fbSelected.includes(e.id);return(
              <TouchableOpacity key={e.id} onPress={()=>toggleEx(e.id)} onLongPress={()=>setFbPreview(e)} delayLongPress={400}
                style={{width:'48%',backgroundColor:C.card,borderRadius:12,padding:10,alignItems:'center',borderWidth:sel?1.5:0.5,borderColor:sel?C.success:C.border}}>
                <View style={{width:70,height:70,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginBottom:6,overflow:'hidden'}}>
                  {e.image&&EXERCISE_IMAGES[e.image]?<Image source={EXERCISE_IMAGES[e.image]} style={{width:70,height:70}} resizeMode="cover"/>:<Text style={{fontSize:28}}>{e.isBodyweight?'🏃':'🏋️'}</Text>}
                </View>
                <Text style={[styles.cardTitle,{fontSize:12,textAlign:'center',marginBottom:2}]} numberOfLines={2}>{e.name}</Text>
                <Text style={[styles.cardSub,{fontSize:11}]}>{e.equipment}</Text>
                {sel&&<Text style={{color:C.success,fontSize:12,marginTop:2}}>✓ Selected</Text>}
              </TouchableOpacity>
            );})}
          </View>
        </ScrollView>
      </View>
      {fbPreview&&(
        <Modal visible={true} transparent animationType="fade" onRequestClose={()=>setFbPreview(null)}>
          <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setFbPreview(null)}>
            <View style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
              {fbPreview.image&&EXERCISE_IMAGES[fbPreview.image]?
                <Image source={EXERCISE_IMAGES[fbPreview.image]} style={{width:'100%',height:320}} resizeMode="contain"/>:
                <View style={{width:'100%',height:320,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{fbPreview.isBodyweight?'🏃':'🏋️'}</Text></View>
              }
              <View style={{padding:16}}>
                <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{fbPreview.name}</Text>
                <Text style={styles.cardSub}>{fbPreview.muscle} · {fbPreview.equipment}</Text>
                <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{toggleEx(fbPreview.id);setFbPreview(null);}}>
                  <Text style={styles.primaryBtnText}>{fbSelected.includes(fbPreview.id)?'✓ Selected — tap to remove':'+ Add to favorite'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setFbPreview(null)}>
                <Text style={{color:'white',fontSize:18}}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close</Text>
          </TouchableOpacity>
        </Modal>
      )}
      </>
    );
  }

  // Main page - shows selected exercises
  return (
    <>
    <KeyboardAvoidingView style={{flex:1,backgroundColor:C.bg}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={[styles.rowBetween,{paddingHorizontal:16,paddingTop:56,paddingBottom:8}]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
        <Text style={[styles.pageTitle,{margin:0}]}>{editingFav?'Edit favorite':'New favorite v3'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={save}><Text style={styles.primaryBtnText}>Save</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">
        <Text style={[styles.cardSub,{marginBottom:6,color:nameError?C.danger:C.textSecondary}]}>Name {nameError?'— required':''}</Text>
        <TextInput style={[styles.searchInput,{marginBottom:16,borderColor:nameError?C.danger:C.border}]} value={fbName} onChangeText={t=>{setFbName(t);if(t.trim())setNameError(false);}} placeholder="e.g. Push Day A" placeholderTextColor={C.textMuted}/>
        
        <View style={[styles.rowBetween,{marginBottom:12}]}>
          <Text style={[styles.cardSub,{alignSelf:'center'}]}>{fbSelected.length} exercise{fbSelected.length!==1?'s':''}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={()=>{setShowPicker(true);setFbSearch('');setFbMuscle(null);}}>
            <Text style={styles.primaryBtnText}>+ Add exercise</Text>
          </TouchableOpacity>
        </View>

        {fbSelected.length===0?(
          <View style={[styles.emptyState,{paddingVertical:24}]}>
            <Text style={styles.emptyText}>No exercises yet.{'\n'}Tap "+ Add exercise" to start.</Text>
          </View>
        ):(
          fbSelected.map((id,idx)=>{
            const e=exercises.find(ex=>ex.id===id);
            if(!e) return null;
            return (
              <View key={id} style={[styles.card,{flexDirection:'row',alignItems:'center',paddingVertical:10,marginBottom:8}]}>
                <View style={{width:32,alignItems:'center',gap:4}}>
                  <TouchableOpacity onPress={()=>moveEx(idx,'up')} disabled={idx===0} style={{opacity:idx===0?0.2:1,padding:2}}>
                    <Text style={{fontSize:16,color:C.accent}}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>moveEx(idx,'down')} disabled={idx===fbSelected.length-1} style={{opacity:idx===fbSelected.length-1?0.2:1,padding:2}}>
                    <Text style={{fontSize:16,color:C.accent}}>▼</Text>
                  </TouchableOpacity>
                </View>
                <View style={{width:44,height:44,borderRadius:8,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginHorizontal:8,overflow:'hidden'}}>
                  {e.image&&EXERCISE_IMAGES[e.image]?<Image source={EXERCISE_IMAGES[e.image]} style={{width:44,height:44}} resizeMode="cover"/>:<Text style={{fontSize:22}}>{e.isBodyweight?'🏃':'🏋️'}</Text>}
                </View>
                <View style={{flex:1}}>
                  <Text style={[styles.cardTitle,{fontSize:14}]} numberOfLines={1}>{e.name}</Text>
                  <Text style={[styles.cardSub,{fontSize:12}]}>{e.muscle} · {e.equipment}</Text>
                </View>
                <TouchableOpacity onPress={()=>removeEx(id)} style={{padding:8}}>
                  <Text style={{color:C.danger,fontSize:18}}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    {fbPreview&&(
      <Modal visible={true} transparent animationType="fade" onRequestClose={()=>setFbPreview(null)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setFbPreview(null)}>
          <View style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
            {fbPreview.image&&EXERCISE_IMAGES[fbPreview.image]?
              <Image source={EXERCISE_IMAGES[fbPreview.image]} style={{width:'100%',height:320}} resizeMode="contain"/>:
              <View style={{width:'100%',height:320,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{fbPreview.isBodyweight?'🏃':'🏋️'}</Text></View>
            }
            <View style={{padding:16}}>
              <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{fbPreview.name}</Text>
              <Text style={styles.cardSub}>{fbPreview.muscle} · {fbPreview.equipment}</Text>
              <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={()=>{toggleEx(fbPreview.id);setFbPreview(null);}}>
                <Text style={styles.primaryBtnText}>{fbSelected.includes(fbPreview.id)?'✓ Selected — tap to remove':'+ Add to favorite'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setFbPreview(null)}>
              <Text style={{color:'white',fontSize:18}}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    )}
    </>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [progressTab, setProgressTab] = useState('exercise'); // 'exercise' | 'weekly' | 'measurements'
  const [restTimer, setRestTimer] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [restTarget, setRestTarget] = useState(90);
  const [showRestModal, setShowRestModal] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [measureDraft, setMeasureDraft] = useState({date:'',chest:'',waist:'',hips:'',arms:'',thighs:'',weight:''});
  const [darkMode, setDarkMode] = useState(true);
  const C = darkMode ? DARK : LIGHT;

  // Profile / settings
  const [profile, setProfile] = useState({name:'',gender:'Male',weight:'',height:'',unit:'kg'});

  const [workouts, setWorkouts] = useState([]);
  const [nextWorkoutId, setNextWorkoutId] = useState(1);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [finishedWorkoutSummary, setFinishedWorkoutSummary] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishWorkoutName, setFinishWorkoutName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [nextExId, setNextExId] = useState(1);
  const [showExPicker, setShowExPicker] = useState(false);
  const [showExPickerEdit, setShowExPickerEdit] = useState(false);
  const [progressExId, setProgressExId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(null);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [addExMuscle, setAddExMuscle] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [openMuscle, setOpenMuscle] = useState(null);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [nextFavId, setNextFavId] = useState(1);
  const [showFavBuilder, setShowFavBuilder] = useState(false);
  const [favMenuId, setFavMenuId] = useState(null);
  const [editingFav, setEditingFav] = useState(null);
  const [collapsedEx, setCollapsedEx] = useState({});
  const [expandedSets, setExpandedSets] = useState({});
  const [exerciseMenuOpen, setExerciseMenuOpen] = useState(null);
  const [swapExEIdx, setSwapExEIdx] = useState(null);
  const [machines, setMachines] = useState([]);
  const [nextMachineId, setNextMachineId] = useState(1);
  const [showMachinePicker, setShowMachinePicker] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [machinePickerEIdx, setMachinePickerEIdx] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesEIdx, setNotesEIdx] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [progressMachineId, setProgressMachineId] = useState(null);
  const timerRef = useRef(null);

  const styles = makeStyles(C);

  useEffect(() => {
    const load = async () => {
      try {
        const keys = ['exercises','nextExId','workouts','nextWorkoutId','favorites','nextFavId','machines','nextMachineId','profile','darkMode','measurements'];
        const [ex,exId,wk,wkId,fav,favId,mach,machId,prof,dm,meas] = await Promise.all(keys.map(k=>AsyncStorage.getItem(k)));
        // Always load exercises from seed file
        const defaults = require('./exercises_seed.json');
        const validDefaults = Array.isArray(defaults) && defaults.length > 0 ? defaults : [];
        if (validDefaults.length > 0) {
          setExercises(validDefaults);
          setNextExId(validDefaults.length + 1);
          AsyncStorage.setItem('exercises', JSON.stringify(validDefaults));
          AsyncStorage.setItem('nextExId', JSON.stringify(validDefaults.length + 1));
        } else if (ex) {
          setExercises(JSON.parse(ex));
          if(exId) setNextExId(JSON.parse(exId));
        }
        if(wk) setWorkouts(JSON.parse(wk));
        if(wkId) setNextWorkoutId(JSON.parse(wkId));
                        if(fav) setFavorites(JSON.parse(fav));
        if(favId) setNextFavId(JSON.parse(favId));
        if(mach) setMachines(JSON.parse(mach));
        if(machId) setNextMachineId(JSON.parse(machId));
        if(prof) setProfile(JSON.parse(prof));
        if(dm!==null) setDarkMode(JSON.parse(dm));
        if(meas) setMeasurements(JSON.parse(meas));
      } catch(e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (timerRunning) { timerRef.current = setInterval(()=>setTimerSecs(s=>s+1),1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const restRef = useRef(null);

  useEffect(() => {
    const onBack = () => {
      if (showFinishModal) { setShowFinishModal(false); setTimerRunning(true); return true; }
      if (showExPicker||showExPickerEdit||showAddExModal||showEditModal||showFavBuilder||showMachinePicker||showNotesModal||showDiscardConfirm||showResetConfirm||showRestModal||showMeasureModal||previewExercise) {
        setShowExPicker(false); setShowExPickerEdit(false); setShowAddExModal(false);
        setShowEditModal(false); setShowFavBuilder(false);
        setShowMachinePicker(false); setShowNotesModal(false); setShowDiscardConfirm(false);
        setShowResetConfirm(false); setShowRestModal(false); setShowMeasureModal(false);
        setPreviewExercise(null);
        return true;
      }
      if (page === 'settings') { setPage('dashboard'); return true; }
      if (page === 'favbuilder') { setPage('favorites'); setEditingFav(null); return true; }
      if (page === 'summary') { setFinishedWorkoutSummary(null); setPage('dashboard'); return true; }
      if (page !== 'dashboard') { setPage('dashboard'); return true; }
      if (openMuscle) { setOpenMuscle(null); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [page, openMuscle, showFinishModal, showExPicker, showExPickerEdit, showAddExModal, showEditModal, showFavBuilder, showMachinePicker, showNotesModal, showDiscardConfirm, showResetConfirm, showRestModal, showMeasureModal, previewExercise]);
  useEffect(() => {
    if (restRunning) {
      restRef.current = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) { setRestRunning(false); clearInterval(restRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    } else { clearInterval(restRef.current); }
    return () => clearInterval(restRef.current);
  }, [restRunning]);

  const startRest = (secs) => { setRestTimer(secs); setRestRunning(true); setShowRestModal(true); };
  const fmtRest = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const saveMeasurement = () => {
    const m = {...measureDraft, date: measureDraft.date || new Date().toISOString().slice(0,10)};
    const updated = [...measurements, m].sort((a,b)=>b.date.localeCompare(a.date));
    setMeasurements(updated);
    AsyncStorage.setItem('measurements', JSON.stringify(updated));
    setShowMeasureModal(false);
    setMeasureDraft({date:'',chest:'',waist:'',hips:'',arms:'',thighs:'',weight:''});
  };

  const saveProfile = (p) => { setProfile(p); AsyncStorage.setItem('profile',JSON.stringify(p)); };
  const toggleDarkMode = (val) => { setDarkMode(val); AsyncStorage.setItem('darkMode',JSON.stringify(val)); };

  const bw = parseDecimal(profile.weight);
  const unit = profile.unit || 'kg';

  const fmtTimer = () => { const m=Math.floor(timerSecs/60),sec=timerSecs%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); };
  const getEx = (id) => exercises.find(e=>e.id===id);

  const effectiveWeight = (set, ex) => {
    const info = getEx(ex?.exId);
    const isDumbbell = info?.equipment === 'Dumbbell';
    const mult = isDumbbell ? 2 : 1;
    if (info?.isBodyweight) {
      const bodyWt = bw > 0 ? bw : 0;
      if (set.unilateral) return { weightL: (bodyWt + parseDecimal(set.weightL))*mult, weightR: (bodyWt + parseDecimal(set.weightR))*mult };
      return { weight: (bodyWt + parseDecimal(set.weight))*mult };
    }
    if (isDumbbell) {
      if (set.unilateral) return { weightL: parseDecimal(set.weightL)*2, weightR: parseDecimal(set.weightR)*2 };
      return { weight: parseDecimal(set.weight)*2 };
    }
    return set;
  };

  const setVolume = (set, ex) => {
    if (!set.completed || set.warmup) return 0;
    const ew = effectiveWeight(set, ex);
    const wL = ew.weightL !== undefined ? ew.weightL : parseDecimal(set.weightL);
    const wR = ew.weightR !== undefined ? ew.weightR : parseDecimal(set.weightR);
    const w = ew.weight !== undefined ? ew.weight : parseDecimal(set.weight);
    let v;
    if (set.unilateral) v = parseDecimal(set.repsL)*wL + parseDecimal(set.repsR)*wR;
    else v = parseDecimal(set.reps)*w;
    if (set.hasMyoReps) {
      const mw = set.unilateral ? Math.max(wL,wR) : w;
      v += parseDecimal(set.myoSets)*parseDecimal(set.myoReps)*mw;
    }
    if (set.hasDropSets && set.dropSets) {
      v += set.dropSets.reduce((s,d) => s + parseDecimal(d.reps)*parseDecimal(d.weight), 0);
    }
    return v;
  };
  const exerciseVolume = (ex) => ex.sets.reduce((s,set)=>s+setVolume(set,ex),0);
  const totalVol = (w) => w.exercises.reduce((sum,ex)=>sum+exerciseVolume(ex),0);
  const totalSets = (w) => (w.exercises||[]).reduce((sum,ex)=>sum+(ex.sets||[]).reduce((c,set)=>set.completed?(c+(set.unilateral?2:1)):c,0),0);

  const getLastSession = (exId) => {
    const past = workouts.filter(w=>w.exercises.some(e=>e.exId===exId)).sort((a,b)=>b.date.localeCompare(a.date));
    if (!past.length) return null;
    return past[0].exercises.find(e=>e.exId===exId).sets;
  };
  const getMachine = (id) => machines.find(m=>m.id===id);
  const fmtDate = (d) => { const dt=new Date(d+'T00:00:00'); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; };
  const fmtDay = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long'});

  const startWorkout = () => { setActiveWorkout({name:'New Workout',exercises:[]}); setTimerSecs(0); setTimerRunning(true); setPage('log'); };

  const normalizeWorkout = (workout) => {
    const w = JSON.parse(JSON.stringify(workout));
    w.exercises.forEach(ex=>ex.sets.forEach(set=>{
      set.weight=parseDecimal(set.weight); set.reps=parseDecimal(set.reps);
      if(set.unilateral){set.weightL=parseDecimal(set.weightL);set.weightR=parseDecimal(set.weightR);set.repsL=parseDecimal(set.repsL);set.repsR=parseDecimal(set.repsR);}
      if(set.hasPartials)set.partialReps=parseDecimal(set.partialReps);
      if(set.hasMyoReps){set.myoSets=parseDecimal(set.myoSets);set.myoReps=parseDecimal(set.myoReps);}
    }));
    return w;
  };

  const finishWorkout = () => {
    setFinishWorkoutName(activeWorkout.name || 'New Workout');
    setShowFinishModal(true);
    setTimerRunning(false);
  };

  const confirmFinishWorkout = (name) => {
    const w = normalizeWorkout({...activeWorkout, name: name.trim()||'New Workout', id:nextWorkoutId, date:new Date().toISOString().slice(0,10), duration:Math.round(timerSecs/60)});
    const updated = [w,...workouts]; const newId = nextWorkoutId+1;
    setWorkouts(updated); setNextWorkoutId(newId);
    setActiveWorkout(null); setTimerSecs(0);
    setFinishedWorkoutSummary(w); setPage('summary');
    setShowFinishModal(false);
    AsyncStorage.setItem('workouts',JSON.stringify(updated)); AsyncStorage.setItem('nextWorkoutId',JSON.stringify(newId));
  };


  const addMachine = () => {
    if (!newMachineName.trim()) return;
    const machine={id:nextMachineId,name:newMachineName.trim()}; const updated=[...machines,machine]; const newId=nextMachineId+1;
    setMachines(updated); setNextMachineId(newId); setNewMachineName('');
    AsyncStorage.setItem('machines',JSON.stringify(updated)); AsyncStorage.setItem('nextMachineId',JSON.stringify(newId));
  };
  const deleteMachine=(machineId)=>{const u=machines.filter(m=>m.id!==machineId);setMachines(u);AsyncStorage.setItem('machines',JSON.stringify(u));};

  const assignMachine=(eIdx,machineId)=>{const u=JSON.parse(JSON.stringify(activeWorkout));u.exercises[eIdx].machineId=machineId;setActiveWorkout(u);setShowMachinePicker(false);setMachinePickerEIdx(null);};
  const openNotesEditor=(eIdx)=>{setNotesEIdx(eIdx);setNotesDraft(activeWorkout.exercises[eIdx].notes||'');setShowNotesModal(true);setExerciseMenuOpen(null);};
  const saveNotes=()=>{const u=JSON.parse(JSON.stringify(activeWorkout));u.exercises[notesEIdx].notes=notesDraft;setActiveWorkout(u);setShowNotesModal(false);setNotesEIdx(null);};

  const saveFavorite = (fav) => {
    let updated;
    if (editingFav) { updated=favorites.map(f=>f.id===editingFav.id?{...f,name:fav.name,exerciseIds:fav.exerciseIds}:f); }
    else { const newFav={id:nextFavId,name:fav.name,exerciseIds:fav.exerciseIds}; updated=[...favorites,newFav]; const newId=nextFavId+1; setNextFavId(newId); AsyncStorage.setItem('nextFavId',JSON.stringify(newId)); }
    setFavorites(updated); setPage('favorites'); setEditingFav(null); AsyncStorage.setItem('favorites',JSON.stringify(updated));
  };
  const deleteFavorite=(favId)=>{const u=favorites.filter(f=>f.id!==favId);setFavorites(u);AsyncStorage.setItem('favorites',JSON.stringify(u));};

  const startFromFavorite=(fav)=>{
    const exs=fav.exerciseIds.filter(id=>exercises.some(e=>e.id===id)).map(id=>({exId:id,sets:[{reps:0,weight:0,completed:false}]}));
    const collapsed={};
    exs.forEach((_,i)=>collapsed[i]=true);
    setCollapsedEx(collapsed);
    setActiveWorkout({name:fav.name,exercises:exs}); setTimerSecs(0); setTimerRunning(true); setPage('log');
  };

  const addSet=(eIdx)=>{
    const u=JSON.parse(JSON.stringify(activeWorkout)); const sets=u.exercises[eIdx].sets; const prev=sets[sets.length-1]||null;
    const newSet={reps:0,weight:0,warmup:false,unilateral:false,completed:false,hasPartials:false,partialReps:0,hasMyoReps:false,myoSets:0,myoReps:0,hasDropSets:false,dropSets:[]};
    if(prev){if(prev.unilateral){newSet.unilateral=true;newSet.weightL=prev.weightL;newSet.repsL=prev.repsL;newSet.weightR=prev.weightR;newSet.repsR=prev.repsR;}else{newSet.weight=prev.weight;newSet.reps=prev.reps;}}
    sets.push(newSet); setActiveWorkout(u);
  };
  const upd=(fn)=>{const u=JSON.parse(JSON.stringify(activeWorkout));fn(u);setActiveWorkout(u);};
  const toggleWarmup=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].warmup=!u.exercises[eIdx].sets[sIdx].warmup;});
  const toggleCompleted=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].completed=!u.exercises[eIdx].sets[sIdx].completed;});
  const togglePartials=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].hasPartials=!u.exercises[eIdx].sets[sIdx].hasPartials;});
  const updatePartialReps=(eIdx,sIdx,val)=>upd(u=>{u.exercises[eIdx].sets[sIdx].partialReps=parseInt(val)||0;});
  const toggleMyoReps=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].hasMyoReps=!u.exercises[eIdx].sets[sIdx].hasMyoReps;});
  const updateMyoReps=(eIdx,sIdx,field,val)=>upd(u=>{u.exercises[eIdx].sets[sIdx][field]=parseInt(val)||0;});
  const toggleDropSets=(eIdx,sIdx)=>upd(u=>{
    const set=u.exercises[eIdx].sets[sIdx];
    set.hasDropSets=!set.hasDropSets;
    if(set.hasDropSets&&(!set.dropSets||set.dropSets.length===0)) set.dropSets=[{weight:'',reps:''}];
  });
  const addDrop=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].dropSets.push({weight:'',reps:''});});
  const removeDrop=(eIdx,sIdx,dIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].dropSets.splice(dIdx,1);});
  const updateDrop=(eIdx,sIdx,dIdx,field,val)=>upd(u=>{u.exercises[eIdx].sets[sIdx].dropSets[dIdx][field]=val;});
  const toggleUnilateral=(eIdx,sIdx)=>upd(u=>{const set=u.exercises[eIdx].sets[sIdx];set.unilateral=!set.unilateral;if(set.unilateral){set.weightL=parseDecimal(set.weight);set.repsL=parseDecimal(set.reps);set.weightR=parseDecimal(set.weight);set.repsR=parseDecimal(set.reps);}});
  const updateUnilateralSet=(eIdx,sIdx,side,field,val)=>upd(u=>{u.exercises[eIdx].sets[sIdx][field+side]=val;});
  const swapSides=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets[sIdx].swapped=!u.exercises[eIdx].sets[sIdx].swapped;});
  const removeSet=(eIdx,sIdx)=>upd(u=>{u.exercises[eIdx].sets.splice(sIdx,1);});
  const updateSet=(eIdx,sIdx,field,val)=>upd(u=>{u.exercises[eIdx].sets[sIdx][field]=val;});

  const pickExercise=(exId)=>{
    if(swapExEIdx!==null){upd(u=>{u.exercises[swapExEIdx].exId=exId;});setSwapExEIdx(null);setShowExPicker(false);return;}
    const u=JSON.parse(JSON.stringify(activeWorkout)); const newIdx=u.exercises.length;
    u.exercises.push({exId,sets:[{reps:0,weight:0,warmup:false,unilateral:false,completed:false}]});
    setActiveWorkout(u); setCollapsedEx(prev=>({...prev,[newIdx]:true})); setShowExPicker(false);
  };
  const deleteExerciseFromWorkout=(eIdx)=>upd(u=>{u.exercises.splice(eIdx,1);setExerciseMenuOpen(null);});
  const moveExercise=(eIdx,dir)=>{
    const newIdx=dir==='up'?eIdx-1:eIdx+1;
    upd(u=>{
      if(newIdx<0||newIdx>=u.exercises.length) return;
      const tmp=u.exercises[eIdx];
      u.exercises[eIdx]=u.exercises[newIdx];
      u.exercises[newIdx]=tmp;
    });
    setCollapsedEx(prev=>{
      const next={...prev};
      const tmpC=next[eIdx];
      next[eIdx]=next[newIdx];
      next[newIdx]=tmpC;
      return next;
    });
    setExerciseMenuOpen(null);
  };

  const startSwapExercise=(eIdx)=>{setSwapExEIdx(eIdx);setExerciseMenuOpen(null);setShowExPicker(true);};
  const saveNewExercise=(ex)=>{const updated=[...exercises,ex];const newId=nextExId+1;setExercises(updated);setNextExId(newId);setShowAddExModal(false);AsyncStorage.setItem('exercises',JSON.stringify(updated));AsyncStorage.setItem('nextExId',JSON.stringify(newId));};
  const deleteExercise=(exId)=>{const u=exercises.filter(e=>e.id!==exId);setExercises(u);AsyncStorage.setItem('exercises',JSON.stringify(u));};

  const resetAllData = async () => {
    const blank = {name:'',gender:'Male',weight:'',height:'',unit:'kg'};
    setProfile(blank);
    await AsyncStorage.setItem('profile', JSON.stringify(blank));
    setShowResetConfirm(false);
  };

  const availableMachinesForEx = progressExId ? machines.filter(m=>workouts.some(w=>w.exercises.some(e=>e.exId===progressExId&&e.machineId===m.id))) : [];
  const progressData = progressExId ? workouts
    .filter(w=>w.exercises.some(e=>e.exId===progressExId&&(!progressMachineId||e.machineId===progressMachineId)))
    .sort((a,b)=>a.date.localeCompare(b.date)).slice(-8)
    .map(w=>{
      const ex=w.exercises.find(e=>e.exId===progressExId&&(!progressMachineId||e.machineId===progressMachineId));
      return {date:fmtDate(w.date),vol:ex.sets.reduce((s,set)=>s+setVolume(set,ex),0),maxWt:Math.max(...ex.sets.map(set=>set.unilateral?Math.max(parseDecimal(set.weightL),parseDecimal(set.weightR)):parseDecimal(set.weight)))};
    }) : [];
  const maxVol = Math.max(...progressData.map(d=>d.vol),1);

  const getPR = (exId) => {
    const allWts = workouts.flatMap(w=>{const ex=w.exercises.find(e=>e.exId===exId);return ex?ex.sets.filter(s=>s.completed&&!s.warmup).map(s=>s.unilateral?Math.max(parseDecimal(s.weightL),parseDecimal(s.weightR)):parseDecimal(s.weight)):[];});
    return allWts.length>0?Math.max(...allWts):null;
  };

  const getWeekStart = () => {const now=new Date();const d=now.getDay();const mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(d===0?6:d-1));mon.setHours(0,0,0,0);return mon;};
  const weekStart = getWeekStart();
  const thisWeek = workouts.filter(w=>new Date(w.date+'T00:00:00')>=weekStart);

  const weeklyVolumeData = (() => {
    const ws = getWeekStart();
    return Array.from({length:8},(_,i)=>{
      const wStart=new Date(ws); wStart.setDate(wStart.getDate()-( 7-i)*7);
      const wEnd=new Date(wStart); wEnd.setDate(wEnd.getDate()+7);
      const vol=workouts.filter(w=>{const d=new Date(w.date+'T00:00:00');return d>=wStart&&d<wEnd;}).reduce((s,w)=>s+totalVol(w),0);
      return {label:`${String(wStart.getDate()).padStart(2,'0')}/${String(wStart.getMonth()+1).padStart(2,'0')}`,vol};
    });
  })();
  const maxWeeklyVol = Math.max(...weeklyVolumeData.map(d=>d.vol),1);

  const recent = [...workouts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const recentExIds = [...new Set(
    [...workouts].sort((a,b)=>b.date.localeCompare(a.date))
      .flatMap(w=>w.exercises.map(e=>e.exId))
  )].slice(0,10);

  const renderDashboard = () => (
    <ScrollView style={styles.page}>
      <View style={styles.rowBetween}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <TouchableOpacity onPress={()=>setPage('settings')} style={{padding:8}}>
          <Text style={{color:C.text,fontSize:22,fontWeight:'300'}}>☰</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.cardSub,{marginBottom:8,marginTop:-10}]}>Week of {String(weekStart.getDate()).padStart(2,'0')}/{String(weekStart.getMonth()+1).padStart(2,'0')}/{weekStart.getFullYear()} (resets Mon)</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}><Text style={styles.statVal}>{thisWeek.length}</Text><Text style={styles.statLabel}>Workouts{'\n'}this week</Text></View>
        <View style={styles.statCard}><Text style={styles.statVal}>{thisWeek.reduce((n,w)=>n+totalSets(w),0)}</Text><Text style={styles.statLabel}>Sets{'\n'}this week</Text></View>
        <View style={styles.statCard}><Text style={styles.statVal}>{(()=>{const v=thisWeek.reduce((n,w)=>n+totalVol(w),0);return v>999?(v/1000).toFixed(1)+'k':v;})()}</Text><Text style={styles.statLabel}>{unit}{'\n'}lifted</Text></View>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Recent workouts</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={startWorkout}><Text style={styles.primaryBtnText}>Start workout</Text></TouchableOpacity>
      </View>
      {recent.length===0?<View style={styles.emptyState}><Text style={styles.emptyText}>No workouts yet.{'\n'}Start your first one!</Text></View>:
        recent.map(w=>(
          <TouchableOpacity key={w.id} style={styles.card} activeOpacity={0.7} onPress={()=>{setEditingWorkout(w);setShowEditModal(true);}}>
            <View style={styles.rowBetween}>
              <View style={{flex:1}}>
                <Text style={styles.cardTitle}>{w.name}</Text>
                <Text style={[styles.cardSub,{color:C.accent,fontSize:13}]}>{fmtDay(w.date)}</Text>
                <Text style={styles.cardSub}>{fmtDate(w.date)} · {w.exercises.length} exercises · {totalSets(w)} sets · {w.duration} min</Text>
              </View>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <View style={styles.badge}><Text style={styles.badgeText}>{totalVol(w).toLocaleString()} {unit}</Text></View>
                <TouchableOpacity onPress={(e)=>{e.stopPropagation&&e.stopPropagation();setShowWorkoutMenu(showWorkoutMenu===w.id?null:w.id);}} hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:10}}>
                  <Text style={{fontSize:24,color:C.textMuted}}>...</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showWorkoutMenu===w.id&&(
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={()=>{setEditingWorkout(w);setShowEditModal(true);setShowWorkoutMenu(null);}}><Text style={styles.dropdownItemText}>✏️  Edit workout</Text></TouchableOpacity>
                <View style={styles.dropdownDivider}/>
                <TouchableOpacity style={styles.dropdownItem} onPress={()=>{const u=workouts.filter(x=>x.id!==w.id);setWorkouts(u);AsyncStorage.setItem('workouts',JSON.stringify(u));setShowWorkoutMenu(null);}}><Text style={[styles.dropdownItemText,{color:C.danger}]}>🗑  Delete workout</Text></TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))
      }
      <View style={{height:20}}/>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.page} contentContainerStyle={{paddingBottom:40}}>
      <View style={styles.rowBetween}>
        <TouchableOpacity onPress={()=>setPage('dashboard')} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
        <View style={{width:60}}/>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle,{marginBottom:12}]}>Profile</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Name</Text>
          <TextInput style={styles.settingInput} value={profile.name} onChangeText={t=>saveProfile({...profile,name:t})} placeholder="Your name" placeholderTextColor={C.textMuted}/>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Gender</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {GENDER_OPTIONS.map(g=>(
              <TouchableOpacity key={g} onPress={()=>saveProfile({...profile,gender:g})} style={[styles.filterTag,profile.gender===g&&styles.filterTagActive]}>
                <Text style={[styles.filterTagText,profile.gender===g&&styles.filterTagTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Bodyweight ({unit})</Text>
          <TextInput style={styles.settingInput} value={String(profile.weight)} onChangeText={t=>saveProfile({...profile,weight:t})} placeholder="0" placeholderTextColor={C.textMuted} keyboardType="decimal-pad"/>
        </View>
        <View style={[styles.settingRow,{borderBottomWidth:0}]}>
          <Text style={styles.settingLabel}>Height (cm)</Text>
          <TextInput style={styles.settingInput} value={String(profile.height)} onChangeText={t=>saveProfile({...profile,height:t})} placeholder="0" placeholderTextColor={C.textMuted} keyboardType="decimal-pad"/>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle,{marginBottom:12}]}>Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Units</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {['kg','lbs'].map(u=>(
              <TouchableOpacity key={u} onPress={()=>saveProfile({...profile,unit:u})} style={[styles.filterTag,profile.unit===u&&styles.filterTagActive]}>
                <Text style={[styles.filterTagText,profile.unit===u&&styles.filterTagTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.settingRow,{borderBottomWidth:0}]}>
          <Text style={styles.settingLabel}>Dark mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{true:C.accent}} thumbColor={C.white}/>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle,{marginBottom:12}]}>Profile</Text>
        <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',backgroundColor:C.danger}]} onPress={()=>setShowResetConfirm(true)}>
          <Text style={styles.primaryBtnText}>Reset profile</Text>
        </TouchableOpacity>
      </View>

      {profile.name?<View style={[styles.card,{alignItems:'center'}]}>
        <Text style={{fontSize:40}}>👤</Text>
        <Text style={[styles.cardTitle,{marginTop:8}]}>{profile.name}</Text>
        <Text style={styles.cardSub}>{profile.gender}{profile.weight?` · ${profile.weight} ${unit}`:''}{profile.height?` · ${profile.height} cm`:''}</Text>
      </View>:null}

      <View style={{height:20}}/>
    </ScrollView>
  );

  const renderLog = () => {
    if (!activeWorkout) return (
      <View style={[styles.page,styles.centered]}>
        <Text style={styles.emptyIcon}>➕</Text><Text style={styles.emptyText}>No active workout.</Text>
        <TouchableOpacity style={[styles.primaryBtn,{marginTop:16}]} onPress={startWorkout}><Text style={styles.primaryBtnText}>Start new workout</Text></TouchableOpacity>
      </View>
    );
    return (
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={Platform.OS==='ios'?90:0}>
      <ScrollView style={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.rowBetween}>
          <TextInput style={styles.workoutNameInput} value={activeWorkout.name} onChangeText={t=>setActiveWorkout({...activeWorkout,name:t})} placeholder="Workout name" placeholderTextColor={C.textMuted}/>
          <TouchableOpacity style={styles.primaryBtn} onPress={finishWorkout}><Text style={styles.primaryBtnText}>Finish</Text></TouchableOpacity>
        </View>
        <View style={[styles.card,styles.rowBetween]}>
          <View><Text style={styles.statLabel}>Duration</Text><Text style={[styles.statVal,{fontSize:32}]}>{fmtTimer()}</Text></View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.ghostBtn} onPress={()=>setTimerRunning(r=>!r)}><Text style={styles.ghostBtnText}>{timerRunning?'⏸':'▶'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn,{marginLeft:8,borderColor:C.danger}]} onPress={()=>setShowDiscardConfirm(true)}><Text style={[styles.ghostBtnText,{color:C.danger}]}>✕</Text></TouchableOpacity>
          </View>
        </View>
        {activeWorkout.exercises.map((ex,eIdx)=>{
          const info=getEx(ex.exId); const color=MUSCLE_COLORS[info?.muscle]||C.accent;
          const lastSets=getLastSession(ex.exId); const isCollapsed=!!collapsedEx[eIdx];
          const menuKey=eIdx; const machine=ex.machineId?getMachine(ex.machineId):null;
          return (
            <DraggableExCard key={eIdx}
              canMoveUp={eIdx>0}
              canMoveDown={eIdx<activeWorkout.exercises.length-1}
              onMoveUp={()=>moveExercise(eIdx,'up')}
              onMoveDown={()=>moveExercise(eIdx,'down')}>
            <View style={[styles.logExCard,{borderLeftColor:color}]}>
              <TouchableOpacity style={styles.rowBetween} activeOpacity={0.7}
                onPress={()=>setCollapsedEx(prev=>({...prev,[eIdx]:!prev[eIdx]}))}>

                <TouchableOpacity onPress={()=>info&&setPreviewExercise(info)} style={{width:48,height:48,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginRight:10,overflow:'hidden'}}>
                  {info?.image&&EXERCISE_IMAGES[info.image]?<Image source={EXERCISE_IMAGES[info.image]} style={{width:48,height:48,borderRadius:10}} resizeMode="cover"/>:<Text style={{fontSize:28}}>{info?.isBodyweight?'🏃':'🏋️'}</Text>}
                </TouchableOpacity>
                <View style={{flex:1}}>
                  <Text style={styles.cardTitle}>{info?.name||'Unknown'}</Text>
                  <Text style={styles.cardSub}>{info?.muscle} · {info?.equipment}{isCollapsed?` · ${ex.sets.length} set${ex.sets.length!==1?'s':''}`:''}</Text>
                  {(machine||ex.notes)&&<Text style={[styles.cardSub,{color:C.accent,marginTop:1}]}>{machine?`⚙️ ${machine.name}`:''}{machine&&ex.notes?' · ':''}{ex.notes?`📝 ${ex.notes}`:''}</Text>}
                </View>
                <View style={{alignItems:'flex-end',marginRight:4}}>
                  <Text style={styles.exVolumeText}>{exerciseVolume(ex).toLocaleString()} {unit}</Text>
                  <Text style={{color:C.textMuted,fontSize:14}}>{isCollapsed?'▼':'▲'}</Text>
                </View>
                <TouchableOpacity onPress={()=>setExerciseMenuOpen(exerciseMenuOpen===menuKey?null:menuKey)} hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:10}}>
                  <Text style={{fontSize:24,color:C.textMuted}}>⋮</Text>
                </TouchableOpacity>
              </TouchableOpacity>
              {exerciseMenuOpen===menuKey&&(
                <View style={styles.dropdownMenu}>
                  <View style={[styles.row,{justifyContent:'center',padding:8,gap:8}]}>
                    <TouchableOpacity onPress={()=>moveExercise(eIdx,'up')} disabled={eIdx===0} style={[styles.ghostBtn,{flex:1,alignItems:'center',opacity:eIdx===0?0.3:1}]}><Text style={styles.ghostBtnText}>↑</Text></TouchableOpacity>
                    <TouchableOpacity onPress={()=>moveExercise(eIdx,'down')} disabled={eIdx===activeWorkout.exercises.length-1} style={[styles.ghostBtn,{flex:1,alignItems:'center',opacity:eIdx===activeWorkout.exercises.length-1?0.3:1}]}><Text style={styles.ghostBtnText}>↓</Text></TouchableOpacity>
                  </View>
                  <View style={styles.dropdownDivider}/>
                  <TouchableOpacity style={styles.dropdownItem} onPress={()=>startSwapExercise(eIdx)}><Text style={styles.dropdownItemText}>🔁  Swap exercise</Text></TouchableOpacity>
                  <View style={styles.dropdownDivider}/>
                  <TouchableOpacity style={styles.dropdownItem} onPress={()=>{setMachinePickerEIdx(eIdx);setShowMachinePicker(true);setExerciseMenuOpen(null);}}><Text style={styles.dropdownItemText}>⚙️  Machine</Text></TouchableOpacity>
                  <View style={styles.dropdownDivider}/>
                  <TouchableOpacity style={styles.dropdownItem} onPress={()=>openNotesEditor(eIdx)}><Text style={styles.dropdownItemText}>📝  Notes</Text></TouchableOpacity>
                  <View style={styles.dropdownDivider}/>
                  <TouchableOpacity style={styles.dropdownItem} onPress={()=>deleteExerciseFromWorkout(eIdx)}><Text style={[styles.dropdownItemText,{color:C.danger}]}>🗑  Delete exercise</Text></TouchableOpacity>
                </View>
              )}
              {!isCollapsed&&<>
              <View style={[styles.row,{marginTop:8,marginBottom:4}]}>
                <Text style={[styles.tableHeader,{width:24}]}>#</Text>
                <Text style={[styles.tableHeader,{flex:1}]}>Weight ({unit})</Text>
                <Text style={[styles.tableHeader,{flex:1}]}>Reps</Text>
                <Text style={{width:32}}/><Text style={{width:28}}/>
              </View>
              {ex.sets.map((set,sIdx)=>{
                const lastSet=lastSets?lastSets[sIdx]:null;
                const setKey=eIdx+'-'+sIdx; const setOpen=!!expandedSets[setKey];
                if (set.unilateral) {
                  const order=set.swapped?['R','L']:['L','R'];
                  return (
                    <View key={sIdx} style={{marginBottom:6}}>
                      <View style={[styles.rowBetween,{marginBottom:2}]}>
                        <Text style={[styles.cardSub,{fontSize:12}]}>Set {sIdx+1}</Text>
                        <Text style={styles.setVolumeText}>{setVolume(set,ex).toLocaleString()} {unit}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={[styles.cardSub,{width:24}]}>{order[0]}</Text>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[0]==='L'?(set.weightL??0):(set.weightR??0))} onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[0],'weight',v)} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[0]==='L'?(set.repsL??0):(set.repsR??0))} onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[0],'reps',v)} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <TouchableOpacity onPress={()=>toggleCompleted(eIdx,sIdx)} style={[styles.checkBadge,set.completed&&styles.checkBadgeActive]}><Text style={[styles.checkBadgeText,set.completed&&styles.checkBadgeTextActive]}>✓</Text></TouchableOpacity>
                        <TouchableOpacity onPress={()=>setExpandedSets(prev=>({...prev,[setKey]:!prev[setKey]}))} hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:8}}><Text style={{fontSize:20,color:C.textMuted}}>⋮</Text></TouchableOpacity>
                      </View>
                      <View style={[styles.row,{marginTop:4}]}>
                        <Text style={[styles.cardSub,{width:24}]}>{order[1]}</Text>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[1]==='L'?(set.weightL??0):(set.weightR??0))} onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[1],'weight',v)} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(order[1]==='L'?(set.repsL??0):(set.repsR??0))} onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[1],'reps',v)} placeholder="0" placeholderTextColor={C.textMuted}/>
                        <View style={{width:32}}/><View style={{width:28}}/>
                      </View>
                      {setOpen&&(
                        <View>
                          <View style={[styles.row,{marginTop:6,gap:8}]}>
                            <TouchableOpacity onPress={()=>swapSides(eIdx,sIdx)} style={styles.swapBtn}><Text style={styles.swapBtnText}>⇅ Swap L/R</Text></TouchableOpacity>
                            <TouchableOpacity onPress={()=>removeSet(eIdx,sIdx)} style={{width:28,alignItems:'center'}}><Text style={{color:C.textMuted}}>X</Text></TouchableOpacity>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                            <TouchableOpacity onPress={()=>toggleUnilateral(eIdx,sIdx)} style={[styles.wordBadge,styles.unilateralBadgeActive]}><Text style={[styles.wordBadgeText,styles.unilateralBadgeTextActive]}>Unilateral</Text></TouchableOpacity>
                            <TouchableOpacity onPress={()=>togglePartials(eIdx,sIdx)} style={[styles.wordBadge,styles.partialsBadgeIdle,set.hasPartials&&styles.partialsBadgeActive]}><Text style={[styles.wordBadgeText,styles.partialsBadgeTextIdle,set.hasPartials&&styles.partialsBadgeTextActive]}>Partials</Text></TouchableOpacity>
                            <TouchableOpacity onPress={()=>toggleMyoReps(eIdx,sIdx)} style={[styles.wordBadge,styles.myoBadgeIdle,set.hasMyoReps&&styles.myoBadgeActive]}><Text style={[styles.wordBadgeText,styles.myoBadgeTextIdle,set.hasMyoReps&&styles.myoBadgeTextActive]}>Myo-Reps</Text></TouchableOpacity>
                            <TouchableOpacity onPress={()=>toggleDropSets(eIdx,sIdx)} style={[styles.wordBadge,styles.dropBadgeIdle,set.hasDropSets&&styles.dropBadgeActive]}><Text style={[styles.wordBadgeText,styles.dropBadgeTextIdle,set.hasDropSets&&styles.dropBadgeTextActive]}>Drop Sets</Text></TouchableOpacity>
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  );
                }
                return (
                  <View key={sIdx} style={{marginBottom:6}}>
                    <Text style={[styles.setVolumeText,{textAlign:'right',marginBottom:2}]}>{setVolume(set,ex).toLocaleString()} {unit}</Text>
                    <View style={styles.row}>
                      <TouchableOpacity onPress={()=>setExpandedSets(prev=>({...prev,[setKey]:!prev[setKey]}))} hitSlop={{top:14,bottom:14,left:14,right:14}} style={{width:24,paddingVertical:6}}>
                        <Text style={[styles.cardSub,{color:set.warmup?'#EAB308':C.textSecondary}]}>{sIdx+1}</Text>
                      </TouchableOpacity>
                      <TextInput style={[styles.setInput,{flex:1,marginRight:6},set.warmup&&styles.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.weight)} onChangeText={v=>updateSet(eIdx,sIdx,'weight',v)} placeholder={lastSet?String(lastSet.weight):"0"} placeholderTextColor={C.textMuted}/>
                      <TextInput style={[styles.setInput,{flex:1,marginRight:6},set.warmup&&styles.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.reps)} onChangeText={v=>updateSet(eIdx,sIdx,'reps',v)} placeholder={lastSet?String(lastSet.reps):"0"} placeholderTextColor={C.textMuted}/>
                      <TouchableOpacity onPress={()=>toggleCompleted(eIdx,sIdx)} style={[styles.checkBadge,set.completed&&styles.checkBadgeActive]}><Text style={[styles.checkBadgeText,set.completed&&styles.checkBadgeTextActive]}>✓</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>removeSet(eIdx,sIdx)} style={{width:28,alignItems:'center'}}><Text style={{color:C.textMuted}}>X</Text></TouchableOpacity>
                    </View>
                    {setOpen&&(
                      <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                          <TouchableOpacity onPress={()=>toggleWarmup(eIdx,sIdx)} style={[styles.wordBadge,styles.warmupBadgeIdle,set.warmup&&styles.warmupBadgeActive]}><Text style={[styles.wordBadgeText,styles.warmupBadgeTextIdle,set.warmup&&styles.warmupBadgeTextActive]}>Warm-Up</Text></TouchableOpacity>
                          <TouchableOpacity onPress={()=>toggleUnilateral(eIdx,sIdx)} style={[styles.wordBadge,styles.unilateralBadgeBorder]}><Text style={[styles.wordBadgeText,styles.unilateralBadgeText]}>Unilateral</Text></TouchableOpacity>
                          <TouchableOpacity onPress={()=>togglePartials(eIdx,sIdx)} style={[styles.wordBadge,styles.partialsBadgeIdle,set.hasPartials&&styles.partialsBadgeActive]}><Text style={[styles.wordBadgeText,styles.partialsBadgeTextIdle,set.hasPartials&&styles.partialsBadgeTextActive]}>Partials</Text></TouchableOpacity>
                          <TouchableOpacity onPress={()=>toggleMyoReps(eIdx,sIdx)} style={[styles.wordBadge,styles.myoBadgeIdle,set.hasMyoReps&&styles.myoBadgeActive]}><Text style={[styles.wordBadgeText,styles.myoBadgeTextIdle,set.hasMyoReps&&styles.myoBadgeTextActive]}>Myo-Reps</Text></TouchableOpacity>
                          <TouchableOpacity onPress={()=>toggleDropSets(eIdx,sIdx)} style={[styles.wordBadge,styles.dropBadgeIdle,set.hasDropSets&&styles.dropBadgeActive]}><Text style={[styles.wordBadgeText,styles.dropBadgeTextIdle,set.hasDropSets&&styles.dropBadgeTextActive]}>Drop Sets</Text></TouchableOpacity>
                        </ScrollView>
                        {set.hasPartials&&<View style={[styles.row,{marginTop:6}]}><Text style={[styles.cardSub,{marginRight:8}]}>Partial reps:</Text><TextInput style={[styles.setInput,{width:60}]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.partialReps||0)} onChangeText={v=>updatePartialReps(eIdx,sIdx,v)} placeholder="0" placeholderTextColor={C.textMuted}/></View>}
                        {set.hasMyoReps&&<View style={[styles.row,{marginTop:6}]}><Text style={[styles.cardSub,{marginRight:8}]}>Mini-sets:</Text><TextInput style={[styles.setInput,{width:50,marginRight:12}]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.myoSets||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoSets',v)} placeholder="0" placeholderTextColor={C.textMuted}/><Text style={[styles.cardSub,{marginRight:8}]}>Reps each:</Text><TextInput style={[styles.setInput,{width:50}]} keyboardType="decimal-pad" selectTextOnFocus value={String(set.myoReps||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoReps',v)} placeholder="0" placeholderTextColor={C.textMuted}/></View>}
                        {set.hasDropSets&&<View style={{marginTop:6}}>
                          {(set.dropSets||[]).map((d,dIdx)=>(
                            <View key={dIdx} style={[styles.row,{marginBottom:4}]}>
                              <Text style={[styles.cardSub,{width:24,textAlign:'center'}]}>↓{dIdx+1}</Text>
                              <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(d.weight)} onChangeText={v=>updateDrop(eIdx,sIdx,dIdx,'weight',v)} placeholder="kg" placeholderTextColor={C.textMuted}/>
                              <TextInput style={[styles.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus value={String(d.reps)} onChangeText={v=>updateDrop(eIdx,sIdx,dIdx,'reps',v)} placeholder="reps" placeholderTextColor={C.textMuted}/>
                              <TouchableOpacity onPress={()=>removeDrop(eIdx,sIdx,dIdx)} style={{width:28,alignItems:'center'}}><Text style={{color:C.textMuted}}>X</Text></TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity onPress={()=>addDrop(eIdx,sIdx)} style={[styles.addSetBtn,{marginTop:2}]}><Text style={styles.addSetBtnText}>+ Add drop</Text></TouchableOpacity>
                        </View>}
                      </View>
                    )}
                    {lastSet&&<Text style={styles.lastSessionHint}>Last: {lastSet.weight}{unit} × {lastSet.reps}</Text>}
                    {set.completed&&!set.warmup&&(()=>{const pr=getPR(ex.exId);const w=parseDecimal(set.weight);return pr&&w>0&&w>=pr?<Text style={{fontSize:12,color:'#FFD700',marginLeft:28,marginTop:2}}>🏆 New PR!</Text>:null;})()}
                  </View>
                );
              })}
              <View style={[styles.row,{gap:8,marginTop:4}]}>
                <TouchableOpacity style={[styles.addSetBtn,{flex:1}]} onPress={()=>addSet(eIdx)}><Text style={styles.addSetBtnText}>+ Add set</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>startRest(restTarget)} style={{paddingHorizontal:14,paddingVertical:9,borderRadius:9,borderWidth:1,borderColor:C.border,backgroundColor:C.card,alignItems:'center',justifyContent:'center'}}><Text style={{color:C.accent,fontSize:14}}>⏱ Rest</Text></TouchableOpacity>
              </View>
              </>}
            </View>
            </DraggableExCard>
          );
        })}
        <TouchableOpacity style={[styles.addExBtn,{marginTop:8}]} onPress={()=>setShowExPicker(true)}><Text style={styles.addExBtnText}>+ Add exercise</Text></TouchableOpacity>
        <View style={{height:100}}/>
      </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderLibrary = () => {
    if (openMuscle) {
      const muscleExercises=exercises.filter(e=>e.muscle===openMuscle&&e.name.toLowerCase().includes(libSearch.toLowerCase()));
      return (
        <View style={{flex:1}}>
          <View style={[styles.rowBetween,{paddingHorizontal:16,paddingTop:56,paddingBottom:8}]}>
            <TouchableOpacity onPress={()=>{setOpenMuscle(null);setLibSearch('');}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
            <Text style={[styles.pageTitle,{margin:0}]}>{openMuscle}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={()=>{setAddExMuscle(openMuscle);setShowAddExModal(true);}}><Text style={styles.primaryBtnText}>+ Add</Text></TouchableOpacity>
          </View>
          <TextInput style={[styles.searchInput,{marginHorizontal:16}]} value={libSearch} onChangeText={setLibSearch} placeholder="Search..." placeholderTextColor={C.textMuted}/>
          <ScrollView contentContainerStyle={{padding:16}}>
            {muscleExercises.length===0?<View style={styles.emptyState}><Text style={styles.emptyIcon}>🏋️</Text><Text style={styles.emptyText}>No exercises yet.{'\n'}Tap "+ Add" to add one!</Text></View>:
              <View style={styles.exGrid}>
                {muscleExercises.map(e=>(
                  <TouchableOpacity key={e.id} style={styles.exGridCard}
                    onPress={()=>setPreviewExercise(e)}
                    onLongPress={()=>deleteExercise(e.id)}>
                    <View style={styles.exGridImgWrap}>
                      {e.image && EXERCISE_IMAGES[e.image] ? (
                        <Image source={EXERCISE_IMAGES[e.image]} style={{width:90,height:90,borderRadius:10}} resizeMode="cover"/>
                      ) : (
                        <Text style={{fontSize:32}}>{e.isBodyweight?'🏃':'🏋️'}</Text>
                      )}
                    </View>
                    <Text style={styles.exGridName} numberOfLines={2}>{e.name}</Text>
                    <Text style={styles.exGridSub}>{e.equipment}{e.isBodyweight?' · BW':''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
            <View style={{height:20}}/>
          </ScrollView>
        </View>
      );
    }
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.pageTitle}>Exercise Library</Text>
        <TextInput style={styles.searchInput} value={libSearch} onChangeText={setLibSearch} placeholder="Search muscle groups..." placeholderTextColor={C.textMuted}/>
        {MUSCLE_GROUPS.filter(m=>m.toLowerCase().includes(libSearch.toLowerCase())).map(muscle=>{
          const count=exercises.filter(e=>e.muscle===muscle).length;
          return (
            <TouchableOpacity key={muscle} style={styles.muscleGroupHeader} onPress={()=>{setOpenMuscle(muscle);setLibSearch('');}}>
              <View style={styles.muscleIconWrap}><Image source={MUSCLE_IMAGES[muscle]} style={{width:120,height:120}} resizeMode="contain"/></View>
              <View style={{flex:1}}><Text style={styles.muscleGroupName}>{muscle}</Text><Text style={styles.cardSub}>{count} exercise{count!==1?'s':''}</Text></View>
              <Text style={{color:C.textMuted,fontSize:18}}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{height:20}}/>
      </ScrollView>
    );
  };

  const renderProgress = () => (
    <ScrollView style={styles.page}>
      <Text style={styles.pageTitle}>Progress</Text>
      <View style={[styles.row,{marginBottom:14,gap:8}]}>
        {[['exercise','Exercise'],['weekly','Weekly Vol'],['measurements','Body']].map(([id,label])=>(
          <TouchableOpacity key={id} onPress={()=>setProgressTab(id)} style={[styles.filterTag,progressTab===id&&styles.filterTagActive,{flex:1,justifyContent:'center',alignItems:'center'}]}>
            <Text style={[styles.filterTagText,progressTab===id&&styles.filterTagTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {progressTab==='exercise'&&<>
        {exercises.length===0?<View style={styles.emptyState}><Text style={styles.emptyIcon}>📈</Text><Text style={styles.emptyText}>Add exercises to your library first.</Text></View>:<>
          <View style={styles.card}>
            <Text style={[styles.cardSub,{marginBottom:8}]}>Select exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {exercises.filter(e=>workouts.some(w=>w.exercises.some(ex=>ex.exId===e.id))).map(e=>(
                <TouchableOpacity key={e.id} style={[styles.filterTag,progressExId===e.id&&styles.filterTagActive,{marginRight:6}]} onPress={()=>{setProgressExId(e.id);setProgressMachineId(null);}}>
                  <Text style={[styles.filterTagText,progressExId===e.id&&styles.filterTagTextActive]}>{e.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {progressExId&&availableMachinesForEx.length>0&&(
            <View style={styles.card}>
              <Text style={[styles.cardSub,{marginBottom:8}]}>Filter by machine</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.filterTag,!progressMachineId&&styles.filterTagActive,{marginRight:6}]} onPress={()=>setProgressMachineId(null)}><Text style={[styles.filterTagText,!progressMachineId&&styles.filterTagTextActive]}>All</Text></TouchableOpacity>
                {availableMachinesForEx.map(m=>(
                  <TouchableOpacity key={m.id} style={[styles.filterTag,progressMachineId===m.id&&styles.filterTagActive,{marginRight:6}]} onPress={()=>setProgressMachineId(m.id)}><Text style={[styles.filterTagText,progressMachineId===m.id&&styles.filterTagTextActive]}>{m.name}</Text></TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {!progressExId?<Text style={styles.emptyText}>Select an exercise above.</Text>:progressData.length===0?<Text style={styles.emptyText}>Log this exercise to see progress.</Text>:<>
            {(()=>{const pr=getPR(progressExId);return pr?<View style={[styles.card,styles.rowBetween]}><Text style={styles.cardSub}>Personal Record 🏆</Text><Text style={{color:'#FFD700',fontWeight:'700',fontSize:20}}>{pr} {unit}</Text></View>:null;})()}
            {workouts.filter(w=>w.exercises.some(e=>e.exId===progressExId&&(!progressMachineId||e.machineId===progressMachineId))).sort((a,b)=>b.date.localeCompare(a.date)).map((w,i)=>{
              const ex=w.exercises.find(e=>e.exId===progressExId&&(!progressMachineId||e.machineId===progressMachineId));
              const vol=ex.sets.reduce((s,set)=>s+setVolume(set,ex),0);
              return (
                <View key={i} style={styles.card}>
                  <View style={[styles.rowBetween,{marginBottom:10}]}>
                    <Text style={styles.cardTitle}>{fmtDate(w.date)}</Text>
                    <Text style={[styles.cardSub,{color:C.accent}]}>{vol} {unit}</Text>
                  </View>
                  <View style={[styles.row,{marginBottom:6}]}>
                    <Text style={[styles.tableHeader,{width:28}]}>#</Text>
                    <Text style={[styles.tableHeader,{flex:1}]}>Weight</Text>
                    <Text style={[styles.tableHeader,{flex:1}]}>Reps</Text>
                    <Text style={[styles.tableHeader,{width:60,textAlign:'right'}]}>Vol</Text>
                  </View>
                  {ex.sets.map((set,sIdx)=>{
                    const sv=setVolume(set,ex);
                    return (
                      <View key={sIdx} style={[styles.row,{paddingVertical:5,borderBottomWidth:0.5,borderBottomColor:C.border}]}>
                        <Text style={[styles.cardSub,{width:28,color:set.warmup?'#EAB308':C.textSecondary}]}>{sIdx+1}</Text>
                        <Text style={[styles.cardTitle,{flex:1,fontSize:15}]}>{set.unilateral?`${set.weightL??0}/${set.weightR??0}`:set.weight} {unit}</Text>
                        <Text style={[styles.cardTitle,{flex:1,fontSize:15}]}>{set.unilateral?`${set.repsL??0}/${set.repsR??0}`:set.reps}</Text>
                        <Text style={[styles.cardSub,{width:60,textAlign:'right'}]}>{sv>0?sv+' '+unit:set.warmup?'W':'—'}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>}
        </>}
      </>}

      {progressTab==='weekly'&&(
        <View style={styles.card}>
          <Text style={[styles.cardSub,{marginBottom:12}]}>Weekly volume ({unit}) — last 8 weeks</Text>
          {weeklyVolumeData.every(d=>d.vol===0)?<Text style={styles.emptyText}>No workouts logged yet.</Text>:
            weeklyVolumeData.map((d,i)=>(
              <View key={i} style={styles.barRow}>
                <Text style={[styles.barLabel,{fontSize:11}]}>{d.label}</Text>
                <View style={styles.barWrap}><View style={[styles.barFill,{width:d.vol>0?Math.max(Math.round((d.vol/maxWeeklyVol)*100),4)+'%':'0%',backgroundColor:C.accentLight}]}><Text style={styles.barText}>{d.vol>0?d.vol+' '+unit:''}</Text></View></View>
              </View>
            ))
          }
          <View style={[styles.statRow,{marginTop:16,marginBottom:0}]}>
            <View style={styles.statCard}><Text style={styles.statVal}>{weeklyVolumeData.filter(d=>d.vol>0).length}</Text><Text style={styles.statLabel}>Active weeks</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{Math.max(...weeklyVolumeData.map(d=>d.vol))}</Text><Text style={styles.statLabel}>Best week</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{Math.round(weeklyVolumeData.filter(d=>d.vol>0).reduce((s,d)=>s+d.vol,0)/Math.max(weeklyVolumeData.filter(d=>d.vol>0).length,1))}</Text><Text style={styles.statLabel}>Avg week</Text></View>
          </View>
        </View>
      )}

      {progressTab==='measurements'&&(
        <>
          <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginBottom:14}]} onPress={()=>setShowMeasureModal(true)}>
            <Text style={styles.primaryBtnText}>+ Add measurements</Text>
          </TouchableOpacity>
          {measurements.length===0?<View style={styles.emptyState}><Text style={styles.emptyIcon}>📏</Text><Text style={styles.emptyText}>No measurements yet.</Text></View>:
            measurements.map((m,i)=>(
              <View key={i} style={styles.card}>
                <Text style={[styles.cardTitle,{marginBottom:8}]}>{m.date}</Text>
                {[['Weight',m.weight,unit],['Chest',m.chest,'cm'],['Waist',m.waist,'cm'],['Hips',m.hips,'cm'],['Arms',m.arms,'cm'],['Thighs',m.thighs,'cm']].filter(([,v])=>v).map(([label,val,u])=>(
                  <View key={label} style={[styles.rowBetween,{paddingVertical:6,borderBottomWidth:0.5,borderBottomColor:C.border}]}>
                    <Text style={styles.cardSub}>{label}</Text>
                    <Text style={[styles.cardTitle,{fontSize:16}]}>{val} {u}</Text>
                  </View>
                ))}
              </View>
            ))
          }
        </>
      )}
      <View style={{height:20}}/>
    </ScrollView>
  );

  const renderFavorites = () => (
    <ScrollView style={styles.page}>
      <View style={styles.rowBetween}>
        <Text style={styles.pageTitle}>Favorites</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={()=>{setEditingFav(null);setPage('favbuilder');}}><Text style={styles.primaryBtnText}>+ New</Text></TouchableOpacity>
      </View>
      {favorites.length===0?<View style={styles.emptyState}><Text style={styles.emptyIcon}>❤️</Text><Text style={styles.emptyText}>No favorites yet.{'\n'}Build one to start workouts with one tap.</Text></View>:
        favorites.map(fav=>(
          <TouchableOpacity key={fav.id} style={styles.card} activeOpacity={0.8} onLongPress={()=>setFavMenuId(favMenuId===fav.id?null:fav.id)} delayLongPress={600}>
            <View style={styles.rowBetween}>
              <View style={{flex:1}}>
                <Text style={styles.cardTitle}>{fav.name}</Text>
                <Text style={styles.cardSub}>{fav.exerciseIds.length} exercise{fav.exerciseIds.length!==1?'s':''} · Hold to edit/delete</Text>
              </View>
            </View>
            {favMenuId===fav.id&&(
              <View style={[styles.dropdownMenu,{marginTop:8}]}>
                <TouchableOpacity style={styles.dropdownItem} onPress={()=>{setFavMenuId(null);setEditingFav(fav);setPage('favbuilder');}}><Text style={styles.dropdownItemText}>✏️  Edit</Text></TouchableOpacity>
                <View style={styles.dropdownDivider}/>
                <TouchableOpacity style={styles.dropdownItem} onPress={()=>{deleteFavorite(fav.id);setFavMenuId(null);}}><Text style={[styles.dropdownItemText,{color:C.danger}]}>🗑  Delete</Text></TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:10}]} onPress={()=>startFromFavorite(fav)}><Text style={styles.primaryBtnText}>▶ Start workout</Text></TouchableOpacity>
          </TouchableOpacity>
        ))
      }
      <View style={{height:20}}/>
    </ScrollView>
  );

  const renderSummary = () => {
    if (!finishedWorkoutSummary) return null;
    const w=finishedWorkoutSummary;
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.pageTitle}>Workout Complete 🎉</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{w.name}</Text>
          <Text style={styles.cardSub}>{fmtDate(w.date)} · {w.exercises.length} exercises · {totalSets(w)} sets · {w.duration} min</Text>
          <View style={[styles.statRow,{marginTop:12,marginBottom:0}]}>
            <View style={styles.statCard}><Text style={styles.statVal}>{totalSets(w)}</Text><Text style={styles.statLabel}>Sets</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{totalVol(w).toLocaleString()}</Text><Text style={styles.statLabel}>{unit} volume</Text></View>
            <View style={styles.statCard}><Text style={styles.statVal}>{w.duration}</Text><Text style={styles.statLabel}>Minutes</Text></View>
          </View>
        </View>
        <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center'}]} onPress={()=>{setFinishedWorkoutSummary(null);setPage('dashboard');}}><Text style={styles.primaryBtnText}>Done</Text></TouchableOpacity>
        <View style={{height:20}}/>
      </ScrollView>
    );
  };

  const anyModalOpen = showExPicker||showExPickerEdit||showAddExModal||showEditModal||showMachinePicker||showNotesModal||showDiscardConfirm||showResetConfirm||showFinishModal;

  return (
    <View style={styles.container}>
      <StatusBar style={darkMode?'light':'dark'} backgroundColor={C.bg}/>
      {page==='dashboard'&&renderDashboard()}
      {page==='settings'&&renderSettings()}
      {page==='log'&&renderLog()}
      {page==='library'&&renderLibrary()}
      {page==='progress'&&renderProgress()}
      {page==='favorites'&&renderFavorites()}
      {page==='favbuilder'&&<FavBuilderPageV2 exercises={exercises} editingFav={editingFav} C={C} onBack={()=>{setPage('favorites');setEditingFav(null);}} onSave={saveFavorite}/>}
      {page==='summary'&&renderSummary()}
      <ExPickerModal visible={showExPicker} exercises={exercises} onClose={()=>{setShowExPicker(false);setSwapExEIdx(null);}} onPick={pickExercise} C={C} recentExIds={recentExIds}/>
      <ExPickerModal visible={showExPickerEdit} exercises={exercises} C={C}
        onClose={()=>setShowExPickerEdit(false)}
        onPick={(exId)=>{setEditingWorkout(prev=>{if(!prev)return prev;const u=JSON.parse(JSON.stringify(prev));u.exercises.push({exId,sets:[{reps:0,weight:0,warmup:false,unilateral:false,completed:false,hasPartials:false,partialReps:0,hasMyoReps:false,myoSets:0,myoReps:0}]});return u;});setShowExPickerEdit(false);}}/>
      <AddExModal visible={showAddExModal} muscle={addExMuscle} nextExId={nextExId} onClose={()=>setShowAddExModal(false)} onSave={saveNewExercise} C={C}/>
      <EditWorkoutModal visible={showEditModal} workout={editingWorkout} exercises={exercises} C={C}
        onClose={()=>setShowEditModal(false)} onAddExercise={()=>setShowExPickerEdit(true)}
        onSave={(updated)=>{const nw=workouts.map(w=>w.id===updated.id?updated:w);setWorkouts(nw);AsyncStorage.setItem('workouts',JSON.stringify(nw));setShowEditModal(false);}}/>
      <MachinePickerModal visible={showMachinePicker} machines={machines} newMachineName={newMachineName} onChangeNewMachineName={setNewMachineName} onAddMachine={addMachine} onDeleteMachine={deleteMachine} onSelectMachine={(machineId)=>assignMachine(machinePickerEIdx,machineId)} onClose={()=>{setShowMachinePicker(false);setMachinePickerEIdx(null);}} C={C}/>
      <NotesModal visible={showNotesModal} draft={notesDraft} onChangeDraft={setNotesDraft} onSave={saveNotes} onClose={()=>{setShowNotesModal(false);setNotesEIdx(null);}} C={C}/>
      <ConfirmModal visible={showDiscardConfirm} title="Discard workout?" message="This will permanently delete everything logged in this session." confirmLabel="Discard" onConfirm={()=>{setActiveWorkout(null);setTimerRunning(false);setTimerSecs(0);setShowDiscardConfirm(false);}} onCancel={()=>setShowDiscardConfirm(false)} C={C}/>
      <Modal visible={showFinishModal&&!!activeWorkout} transparent animationType="slide" onRequestClose={()=>{setShowFinishModal(false);setTimerRunning(true);}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.6)'}}>
          <View style={[styles.modal,{maxHeight:'90%',marginBottom:60}]}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Finish workout 🎉</Text>
              <TouchableOpacity onPress={()=>{setShowFinishModal(false);setTimerRunning(true);}}>
                <Text style={{fontSize:20,color:C.text}}>X</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardSub,{marginBottom:6,marginTop:12}]}>Workout name</Text>
            <TextInput style={[styles.searchInput,{marginBottom:12}]} value={finishWorkoutName}
              onChangeText={setFinishWorkoutName} placeholder="e.g. Push Day A"
              placeholderTextColor={C.textMuted}/>
            <View style={[styles.statRow,{marginBottom:12}]}>
              <View style={styles.statCard}><Text style={styles.statVal}>{activeWorkout?.exercises.length||0}</Text><Text style={styles.statLabel}>Exercises</Text></View>
              <View style={styles.statCard}><Text style={styles.statVal}>{activeWorkout?.exercises.reduce((s,ex)=>s+(ex.sets||[]).filter(set=>set.completed).length,0)||0}</Text><Text style={styles.statLabel}>Sets</Text></View>
              <View style={styles.statCard}><Text style={styles.statVal}>{Math.round(timerSecs/60)}</Text><Text style={styles.statLabel}>Minutes</Text></View>
            </View>
            <ScrollView style={{maxHeight:160}} showsVerticalScrollIndicator={false}>
              {(activeWorkout?.exercises||[]).map((ex,i)=>{
                const info=getEx(ex.exId);
                const completed=ex.sets.filter(s=>s.completed&&!s.warmup);
                if(completed.length===0) return null;
                const maxWt=Math.max(...completed.map(s=>s.unilateral?Math.max(parseDecimal(s.weightL),parseDecimal(s.weightR)):parseDecimal(s.weight)));
                return(
                  <View key={i} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:7,borderBottomWidth:0.5,borderBottomColor:C.border}}>
                    <Text style={[styles.cardTitle,{fontSize:14,flex:1}]} numberOfLines={1}>{info?.name||'Unknown'}</Text>
                    <Text style={styles.cardSub}>{completed.length} sets · {maxWt} {unit}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={[styles.row,{gap:10,marginTop:14}]}>
              <TouchableOpacity style={[styles.ghostBtn,{flex:1,alignItems:'center'}]} onPress={()=>{setShowFinishModal(false);setTimerRunning(true);}}>
                <Text style={{color:C.text}}>Keep going</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn,{flex:1,alignItems:'center'}]} onPress={()=>confirmFinishWorkout(finishWorkoutName)}>
                <Text style={styles.primaryBtnText}>Save workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {showRestModal&&(
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={()=>setShowRestModal(false)}>
          <TouchableOpacity style={[styles.modal,{alignItems:'center',paddingVertical:32}]} activeOpacity={1} onPress={()=>{}}>
            <Text style={[styles.cardSub,{marginBottom:8}]}>Rest Timer</Text>
            <Text style={[styles.statVal,{fontSize:64,color:restTimer<=10?C.danger:C.accent,marginBottom:16}]}>{fmtRest(restTimer)}</Text>
            <View style={[styles.row,{gap:10,marginBottom:16}]}>
              {[30,60,90,120,180].map(s=>(
                <TouchableOpacity key={s} onPress={()=>{setRestTarget(s);startRest(s);}} style={[styles.filterTag,restTarget===s&&styles.filterTagActive]}>
                  <Text style={[styles.filterTagText,restTarget===s&&styles.filterTagTextActive]}>{s}s</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.row,{gap:10}]}>
              <TouchableOpacity style={[styles.ghostBtn,{paddingHorizontal:20}]} onPress={()=>setRestRunning(r=>!r)}>
                <Text style={styles.ghostBtnText}>{restRunning?'⏸':'▶'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn,{paddingHorizontal:20}]} onPress={()=>{setRestTimer(restTarget);setRestRunning(true);}}>
                <Text style={styles.ghostBtnText}>↺</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn,{paddingHorizontal:20}]} onPress={()=>setShowRestModal(false)}>
                <Text style={styles.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {showMeasureModal&&(
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={()=>setShowMeasureModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{width:'100%'}}>
            <TouchableOpacity style={[styles.modal,{maxHeight:'85%'}]} activeOpacity={1} onPress={()=>{}}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Add measurements</Text>
                <TouchableOpacity onPress={()=>setShowMeasureModal(false)}><Text style={{fontSize:20,color:C.text}}>X</Text></TouchableOpacity>
              </View>
              <ScrollView>
                {[['Date (YYYY-MM-DD)','date'],['Weight ('+unit+')','weight'],['Chest (cm)','chest'],['Waist (cm)','waist'],['Hips (cm)','hips'],['Arms (cm)','arms'],['Thighs (cm)','thighs']].map(([label,key])=>(
                  <View key={key} style={{marginBottom:10}}>
                    <Text style={[styles.cardSub,{marginBottom:4}]}>{label}</Text>
                    <TextInput style={styles.searchInput} value={measureDraft[key]} onChangeText={v=>setMeasureDraft(prev=>({...prev,[key]:v}))} placeholder={key==='date'?new Date().toISOString().slice(0,10):'0'} placeholderTextColor={C.textMuted} keyboardType={key==='date'?'default':'decimal-pad'}/>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={[styles.primaryBtn,{alignItems:'center',marginTop:8}]} onPress={saveMeasurement}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      )}
      <ConfirmModal visible={showResetConfirm} title="Reset profile?" message="This will clear your name, gender, weight, height and unit settings. Your workouts and exercises will not be affected." confirmLabel="Reset" onConfirm={resetAllData} onCancel={()=>setShowResetConfirm(false)} C={C}/>
      <Modal visible={!!previewExercise} transparent animationType="fade" onRequestClose={()=>setPreviewExercise(null)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.92)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setPreviewExercise(null)}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={{width:'92%',borderRadius:16,overflow:'hidden',backgroundColor:C.card}}>
            {previewExercise?.image && EXERCISE_IMAGES[previewExercise.image] ? (
              <Image source={EXERCISE_IMAGES[previewExercise.image]} style={{width:'100%',height:340}} resizeMode="contain"/>
            ) : (
              <View style={{width:'100%',height:340,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:80}}>{previewExercise?.isBodyweight?'🏃':'🏋️'}</Text>
              </View>
            )}
            <View style={{padding:16}}>
              <Text style={[styles.cardTitle,{fontSize:20,marginBottom:4}]}>{previewExercise?.name}</Text>
              <Text style={styles.cardSub}>{previewExercise?.muscle} · {previewExercise?.equipment}{previewExercise?.isBodyweight?' · Bodyweight':''}</Text>
            </View>
            <TouchableOpacity style={{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:36,height:36,alignItems:'center',justifyContent:'center'}} onPress={()=>setPreviewExercise(null)}>
              <Text style={{color:'white',fontSize:18}}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:13}}>Tap anywhere to close · Long press to delete</Text>
        </TouchableOpacity>
      </Modal>
      {!anyModalOpen&&page!=='settings'&&page!=='favbuilder'&&(
        <View style={styles.navbar}>
          {[
            {id:'dashboard', icon:'home', label:'Home'},
            {id:'favorites', icon:'heart', label:'Favorites'},
            {id:'log', icon:'add-circle', label:'Log'},
            {id:'library', icon:'barbell', label:'Exercises'},
            {id:'progress', icon:'trending-up', label:'Progress'},
          ].map(tab=>(
            <TouchableOpacity key={tab.id} style={styles.navTab} onPress={()=>setPage(tab.id)}>
              <Ionicons name={page===tab.id?tab.icon:tab.icon+'-outline'} size={26} color={page===tab.id?C.accent:C.textMuted}/>
              <Text style={[styles.navLabel,page===tab.id&&{color:C.accent}]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
