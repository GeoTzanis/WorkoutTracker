import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const MUSCLE_GROUPS = ["Chest","Back","Shoulders","Biceps","Triceps","Quads","Hamstrings","Calves","Forearms","Abs","Glutes"];
 
const MUSCLE_COLORS = {
  'Chest':'#F97316','Back':'#10B981','Shoulders':'#EAB308',
  'Biceps':'#EF4444','Triceps':'#6366F1','Quads':'#3B82F6',
  'Hamstrings':'#8B5CF6','Calves':'#14B8A6','Glutes':'#EC4899',
  'Forearms':'#F59E0B','Abs':'#84CC16',
};
 
const MUSCLE_IMAGES = {
  'Chest':      require('./assets/muscles/chest.png'),
  'Back':       require('./assets/muscles/back.png'),
  'Shoulders':  require('./assets/muscles/shoulders.png'),
  'Biceps':     require('./assets/muscles/biceps.png'),
  'Triceps':    require('./assets/muscles/triceps.png'),
  'Quads':      require('./assets/muscles/quads.png'),
  'Hamstrings': require('./assets/muscles/hamstrings.png'),
  'Calves':     require('./assets/muscles/calves.png'),
  'Forearms':   require('./assets/muscles/forearms.png'),
  'Abs':        require('./assets/muscles/abs.png'),
  'Glutes':     require('./assets/muscles/glutes.png'),
};
 
const BODY_IMAGE_FRONT = require('./assets/muscles/body-front.png');
const BODY_IMAGE_BACK = require('./assets/muscles/body-back.png');
 
const EQUIPMENT_OPTIONS = ["Barbell","Dumbbell","Cable","Machine","Bodyweight","Other"];
 
const COLORS = {
  bg: '#0F0F0F', card: '#1A1A1A', border: '#2A2A2A',
  accent: '#3B82F6', accentLight: '#1E3A5F',
  text: '#F1F1F1', textSecondary: '#A0A0A0', textMuted: '#606060',
  success: '#10B981', danger: '#EF4444', white: '#FFFFFF',
};
 
const parseDecimal = (val) => {
  if (typeof val !== 'string') return parseFloat(val) || 0;
  const normalized = val.replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};
 
function ExPickerModal({ visible, exercises, onClose, onPick }) {
  const [search, setSearch] = useState('');
  const [openMuscle, setOpenMuscle] = useState(null);
 
  useEffect(() => {
    if (!visible) { setSearch(''); setOpenMuscle(null); }
  }, [visible]);
 
  if (!visible) return null;
 
  if (openMuscle) {
    const muscleExercises = exercises.filter(e =>
      e.muscle === openMuscle && e.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <View style={s.modalBackdrop}>
        <View style={[s.modal, {maxHeight:'80%'}]}>
          <View style={s.rowBetween}>
            <TouchableOpacity onPress={() => { setOpenMuscle(null); setSearch(''); }} style={s.backBtn}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.sectionTitle}>{openMuscle}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
          </View>
          <TextInput style={[s.searchInput,{marginTop:10}]} value={search} onChangeText={setSearch}
            placeholder="Search..." placeholderTextColor={COLORS.textMuted}/>
          <ScrollView>
            {muscleExercises.length === 0 ?
              <Text style={[s.emptyText,{marginTop:10}]}>No exercises here yet.</Text> :
              muscleExercises.map(e => (
                <TouchableOpacity key={e.id} style={s.exRow} onPress={() => { onPick(e.id); setOpenMuscle(null); setSearch(''); }}>
                  <View style={{flex:1}}>
                    <Text style={s.cardTitle}>{e.name}</Text>
                    <Text style={s.cardSub}>{e.equipment}</Text>
                  </View>
                  <Text style={{color:COLORS.accent,fontSize:22}}>+</Text>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>
      </View>
    );
  }
 
  return (
    <View style={s.modalBackdrop}>
      <View style={[s.modal, {maxHeight:'80%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Add exercise</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        {exercises.length === 0 ?
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No exercises in your library yet.{'\n'}Go to the Exercises tab to add some!</Text>
          </View> : <>
          <TextInput style={[s.searchInput,{marginTop:10}]} value={search} onChangeText={setSearch}
            placeholder="Search muscle groups..." placeholderTextColor={COLORS.textMuted}/>
          <ScrollView>
            {MUSCLE_GROUPS.filter(m => m.toLowerCase().includes(search.toLowerCase())).map(muscle => {
              const muscleImg = MUSCLE_IMAGES[muscle];
              const count = exercises.filter(e => e.muscle === muscle).length;
              return (
                <TouchableOpacity key={muscle} style={s.muscleGroupHeader} onPress={() => { setOpenMuscle(muscle); setSearch(''); }}>
                  <View style={s.muscleIconWrapSmall}>
                    <Image source={muscleImg} style={{width:60,height:60}} resizeMode="contain"/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={s.muscleGroupName}>{muscle}</Text>
                    <Text style={s.cardSub}>{count} exercise{count!==1?'s':''}</Text>
                  </View>
                  <Text style={{color:COLORS.textMuted,fontSize:18}}>›</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>}
      </View>
    </View>
  );
}
 
function AddExModal({ visible, muscle, nextExId, onClose, onSave }) {
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('Barbell');
 
  useEffect(() => {
    if (!visible) { setName(''); setEquipment('Barbell'); }
  }, [visible]);
 
  const saveCustom = () => {
    if (!name.trim()) return;
    onSave({ id: nextExId, name: name.trim(), muscle, equipment });
    setName(''); setEquipment('Barbell');
  };
 
  if (!visible) return null;
  return (
    <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.modal,{maxHeight:'90%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Add exercise — {muscle}</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <Text style={[s.cardSub,{marginTop:12,marginBottom:4}]}>Exercise name</Text>
        <TextInput style={s.searchInput} value={name} onChangeText={setName}
          placeholder="e.g. Bench Press" placeholderTextColor={COLORS.textMuted}/>
        <Text style={[s.cardSub,{marginBottom:8}]}>Equipment</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
          {EQUIPMENT_OPTIONS.map(eq => (
            <TouchableOpacity key={eq} style={[s.filterTag,equipment===eq&&s.filterTagActive,{marginRight:6}]} onPress={() => setEquipment(eq)}>
              <Text style={[s.filterTagText,equipment===eq&&s.filterTagTextActive]}>{eq}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={[s.primaryBtn,{alignItems:'center'}]} onPress={saveCustom}>
          <Text style={s.primaryBtnText}>Save exercise</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
 
function EditWorkoutModal({ visible, workout, exercises, onClose, onSave }) {
  const [local, setLocal] = useState(null);
 
  useEffect(() => {
    if (visible && workout) setLocal(JSON.parse(JSON.stringify(workout)));
  }, [visible, workout]);
 
  if (!visible || !local) return null;
 
  const getEx = (id) => exercises.find(e => e.id === id);
 
  const updateSetField = (eIdx, sIdx, field, val) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx][field] = parseDecimal(val);
    setLocal(u);
  };
  const addSetToEx = (eIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets.push({reps:0,weight:0,warmup:false,unilateral:false,hasPartials:false,partialReps:0,hasMyoReps:false,myoSets:0,myoReps:0});
    setLocal(u);
  };
  const removeSetFromEx = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets.splice(sIdx,1);
    setLocal(u);
  };
  const removeExFromEdit = (eIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises.splice(eIdx,1);
    setLocal(u);
  };
  const toggleCompletedEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx].completed = !u.exercises[eIdx].sets[sIdx].completed;
    setLocal(u);
  };
  const toggleWarmupEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx].warmup = !u.exercises[eIdx].sets[sIdx].warmup;
    setLocal(u);
  };
  const togglePartialsEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx].hasPartials = !u.exercises[eIdx].sets[sIdx].hasPartials;
    setLocal(u);
  };
  const updatePartialRepsEdit = (eIdx, sIdx, val) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx].partialReps = parseInt(val)||0;
    setLocal(u);
  };
  const toggleMyoRepsEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx].hasMyoReps = !u.exercises[eIdx].sets[sIdx].hasMyoReps;
    setLocal(u);
  };
  const updateMyoRepsEdit = (eIdx, sIdx, field, val) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx][field] = parseInt(val)||0;
    setLocal(u);
  };
  const toggleUnilateralEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    const set = u.exercises[eIdx].sets[sIdx];
    set.unilateral = !set.unilateral;
    if (set.unilateral) {
      set.weightL = parseDecimal(set.weight); set.repsL = parseDecimal(set.reps);
      set.weightR = parseDecimal(set.weight); set.repsR = parseDecimal(set.reps);
    }
    setLocal(u);
  };
  const updateUnilateralSetEdit = (eIdx, sIdx, side, field, val) => {
    const u = JSON.parse(JSON.stringify(local));
    u.exercises[eIdx].sets[sIdx][field+side] = parseDecimal(val);
    setLocal(u);
  };
  const swapSidesEdit = (eIdx, sIdx) => {
    const u = JSON.parse(JSON.stringify(local));
    const set = u.exercises[eIdx].sets[sIdx];
    set.swapped = !set.swapped;
    setLocal(u);
  };
 
  return (
    <View style={s.modalBackdrop}>
      <View style={[s.modal,{maxHeight:'90%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Edit Workout</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[s.cardSub,{marginTop:12,marginBottom:4}]}>Workout name</Text>
          <TextInput style={s.searchInput} value={local.name}
            onChangeText={t => setLocal({...local,name:t})}
            placeholder="Workout name" placeholderTextColor={COLORS.textMuted}/>
          <Text style={[s.cardSub,{marginBottom:4}]}>Date (YYYY-MM-DD)</Text>
          <TextInput style={s.searchInput} value={local.date}
            onChangeText={t => setLocal({...local,date:t})}
            placeholder="2026-06-29" placeholderTextColor={COLORS.textMuted}/>
          <Text style={[s.cardSub,{marginBottom:4}]}>Gym</Text>
          <TextInput style={s.searchInput} value={local.gym || ''}
            onChangeText={t => setLocal({...local,gym:t})}
            placeholder="Gym name" placeholderTextColor={COLORS.textMuted}/>
          <Text style={[s.cardSub,{marginTop:4,marginBottom:8}]}>Exercises</Text>
          {local.exercises.map((ex,eIdx) => {
            const info = getEx(ex.exId);
            return (
              <View key={eIdx} style={[s.logExCard,{marginBottom:10,borderLeftColor:MUSCLE_COLORS[info?.muscle]||COLORS.accent}]}>
                <View style={s.rowBetween}>
                  <Text style={s.cardTitle}>{info?.name||'Unknown'}</Text>
                  <TouchableOpacity onPress={() => removeExFromEdit(eIdx)}>
                    <Text style={{color:COLORS.danger}}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={[s.row,{marginBottom:4,marginTop:8}]}>
                  <Text style={[s.tableHeader,{width:24}]}>#</Text>
                  <Text style={[s.tableHeader,{flex:1}]}>kg</Text>
                  <Text style={[s.tableHeader,{flex:1}]}>Reps</Text>
                  <Text style={{width:32}}/>
                  <Text style={{width:32}}/>
                  <Text style={{width:28}}/>
                </View>
                {ex.sets.map((set,sIdx) => {
                  if (set.unilateral) {
                    const order = set.swapped ? ['R','L'] : ['L','R'];
                    return (
                      <View key={sIdx} style={{marginBottom:6}}>
                        <View style={s.row}>
                          <Text style={[s.cardSub,{width:24}]}>{order[0]}</Text>
                          <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(order[0]==='L'?(set.weightL??0):(set.weightR??0))}
                            onChangeText={v => updateUnilateralSetEdit(eIdx,sIdx,order[0],'weight',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(order[0]==='L'?(set.repsL??0):(set.repsR??0))}
                            onChangeText={v => updateUnilateralSetEdit(eIdx,sIdx,order[0],'reps',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          <TouchableOpacity onPress={() => toggleUnilateralEdit(eIdx,sIdx)} style={[s.warmupBadge, s.unilateralBadgeActive]}>
                            <Text style={[s.warmupBadgeText, s.unilateralBadgeTextActive]}>U</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => toggleCompletedEdit(eIdx,sIdx)} style={[s.checkBadge, set.completed && s.checkBadgeActive]}>
                            <Text style={[s.checkBadgeText, set.completed && s.checkBadgeTextActive]}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeSetFromEx(eIdx,sIdx)} style={{width:28,alignItems:'center'}}>
                            <Text style={{color:COLORS.textMuted}}>X</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={[s.row,{marginTop:4}]}>
                          <Text style={[s.cardSub,{width:24}]}>{order[1]}</Text>
                          <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(order[1]==='L'?(set.weightL??0):(set.weightR??0))}
                            onChangeText={v => updateUnilateralSetEdit(eIdx,sIdx,order[1],'weight',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(order[1]==='L'?(set.repsL??0):(set.repsR??0))}
                            onChangeText={v => updateUnilateralSetEdit(eIdx,sIdx,order[1],'reps',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          <View style={{width:32}}/>
                          <View style={{width:28}}/>
                        </View>
                        <TouchableOpacity onPress={() => swapSidesEdit(eIdx,sIdx)} style={s.swapBtn}>
                          <Text style={s.swapBtnText}>⇅ Swap L/R</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  return (
                    <View key={sIdx} style={{marginBottom:6}}>
                      <View style={s.row}>
                        <Text style={[s.cardSub,{width:24, color: set.warmup ? '#EAB308' : COLORS.textSecondary}]}>{sIdx+1}</Text>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}, set.warmup && s.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(set.weight)} onChangeText={v => updateSetField(eIdx,sIdx,'weight',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}, set.warmup && s.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(set.reps)} onChangeText={v => updateSetField(eIdx,sIdx,'reps',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <TouchableOpacity onPress={() => toggleWarmupEdit(eIdx,sIdx)} style={[s.warmupBadge, s.warmupBadgeIdle, set.warmup && s.warmupBadgeActive]}>
                          <Text style={[s.warmupBadgeText, s.warmupBadgeTextIdle, set.warmup && s.warmupBadgeTextActive]}>W</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleUnilateralEdit(eIdx,sIdx)} style={s.unilateralBadge}>
                          <Text style={s.unilateralBadgeText}>U</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleCompletedEdit(eIdx,sIdx)} style={[s.checkBadge, set.completed && s.checkBadgeActive]}>
                            <Text style={[s.checkBadgeText, set.completed && s.checkBadgeTextActive]}>✓</Text>
                          </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeSetFromEx(eIdx,sIdx)} style={{width:28,alignItems:'center'}}>
                          <Text style={{color:COLORS.textMuted}}>X</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[s.row,{marginTop:6,gap:8}]}>
                        <TouchableOpacity onPress={() => togglePartialsEdit(eIdx,sIdx)} style={[s.wordBadge, s.partialsBadgeIdle, {alignSelf:'flex-start'}, set.hasPartials && s.partialsBadgeActive]}>
                          <Text style={[s.wordBadgeText, s.partialsBadgeTextIdle, set.hasPartials && s.partialsBadgeTextActive]}>Partials</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleMyoRepsEdit(eIdx,sIdx)} style={[s.wordBadge, s.myoBadgeIdle, {alignSelf:'flex-start'}, set.hasMyoReps && s.myoBadgeActive]}>
                          <Text style={[s.wordBadgeText, s.myoBadgeTextIdle, set.hasMyoReps && s.myoBadgeTextActive]}>Myo-Reps</Text>
                        </TouchableOpacity>
                      </View>
                      {set.hasPartials && (
                        <View style={[s.row,{marginTop:6}]}>
                          <Text style={[s.cardSub,{marginRight:8}]}>Partial reps:</Text>
                          <TextInput style={[s.setInput,{width:60}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(set.partialReps||0)} onChangeText={v=>updatePartialRepsEdit(eIdx,sIdx,v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        </View>
                      )}
                      {set.hasMyoReps && (
                        <View style={[s.row,{marginTop:6}]}>
                          <Text style={[s.cardSub,{marginRight:8}]}>Mini-sets:</Text>
                          <TextInput style={[s.setInput,{width:50,marginRight:12}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(set.myoSets||0)} onChangeText={v=>updateMyoRepsEdit(eIdx,sIdx,'myoSets',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          <Text style={[s.cardSub,{marginRight:8}]}>Reps each:</Text>
                          <TextInput style={[s.setInput,{width:50}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                            value={String(set.myoReps||0)} onChangeText={v=>updateMyoRepsEdit(eIdx,sIdx,'myoReps',v)}
                            placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        </View>
                      )}
                    </View>
                  );
                })}
                <TouchableOpacity style={s.addSetBtn} onPress={() => addSetToEx(eIdx)}>
                  <Text style={s.addSetBtnText}>+ Add set</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity style={[s.primaryBtn,{alignItems:'center',marginTop:8,marginBottom:8}]} onPress={() => onSave(local)}>
            <Text style={s.primaryBtnText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
 
function GymPickerModal({ visible, gyms, newGymName, onChangeNewGymName, onAddGym, onDeleteGym, onSelectGym, onClose }) {
  if (!visible) return null;
  return (
    <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.modal,{maxHeight:'80%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Select gym</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <ScrollView>
          {gyms.length === 0 ?
            <Text style={[s.emptyText,{textAlign:'left',marginBottom:12}]}>No gyms added yet.</Text> :
            gyms.map(g => (
              <View key={g.id} style={s.gymRow}>
                <TouchableOpacity style={{flex:1}} onPress={() => onSelectGym(g.name)}>
                  <Text style={s.cardTitle}>{g.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteGym(g.id)} style={{padding:6}}>
                  <Text style={{color:COLORS.danger}}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))
          }
        </ScrollView>
        <Text style={[s.cardSub,{marginTop:14,marginBottom:6}]}>Add a new gym</Text>
        <View style={s.row}>
          <TextInput style={[s.searchInput,{flex:1,marginBottom:0,marginRight:8}]}
            value={newGymName} onChangeText={onChangeNewGymName}
            placeholder="e.g. Gold's Gym" placeholderTextColor={COLORS.textMuted}/>
          <TouchableOpacity style={s.primaryBtn} onPress={onAddGym}>
            <Text style={s.primaryBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
 
function MachinePickerModal({ visible, machines, newMachineName, onChangeNewMachineName, onAddMachine, onDeleteMachine, onSelectMachine, onClose }) {
  if (!visible) return null;
  return (
    <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.modal,{maxHeight:'80%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Select machine</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <ScrollView>
          {machines.length === 0 ?
            <Text style={[s.emptyText,{textAlign:'left',marginBottom:12}]}>No machines added yet.</Text> :
            machines.map(m => (
              <View key={m.id} style={s.gymRow}>
                <TouchableOpacity style={{flex:1}} onPress={() => onSelectMachine(m.id)}>
                  <Text style={s.cardTitle}>{m.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeleteMachine(m.id)} style={{padding:6}}>
                  <Text style={{color:COLORS.danger}}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))
          }
        </ScrollView>
        <Text style={[s.cardSub,{marginTop:14,marginBottom:6}]}>Add a new machine</Text>
        <View style={s.row}>
          <TextInput style={[s.searchInput,{flex:1,marginBottom:0,marginRight:8}]}
            value={newMachineName} onChangeText={onChangeNewMachineName}
            placeholder="e.g. Cable Machine A" placeholderTextColor={COLORS.textMuted}/>
          <TouchableOpacity style={s.primaryBtn} onPress={onAddMachine}>
            <Text style={s.primaryBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
 
function NotesModal({ visible, draft, onChangeDraft, onSave, onClose }) {
  if (!visible) return null;
  return (
    <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.modal,{maxHeight:'60%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Exercise notes</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <Text style={[s.cardSub,{marginBottom:8}]}>Seat position, pad height, etc.</Text>
        <TextInput style={[s.searchInput,{height:90,textAlignVertical:'top'}]} value={draft}
          onChangeText={onChangeDraft} placeholder="e.g. Seat 4, pad high" placeholderTextColor={COLORS.textMuted}
          multiline autoFocus/>
        <TouchableOpacity style={[s.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={onSave}>
          <Text style={s.primaryBtnText}>Save notes</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
 
function ConfirmModal({ visible, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <View style={s.modalBackdrop}>
      <View style={[s.modal,{maxHeight:'40%'}]}>
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={[s.cardSub,{marginTop:8,marginBottom:16}]}>{message}</Text>
        <View style={[s.row,{gap:10}]}>
          <TouchableOpacity style={[s.ghostBtn,{flex:1,alignItems:'center'}]} onPress={onCancel}>
            <Text style={{color:COLORS.text,fontSize:15}}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.primaryBtn,{flex:1,alignItems:'center',backgroundColor:COLORS.danger}]} onPress={onConfirm}>
            <Text style={s.primaryBtnText}>{confirmLabel || 'Yes'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
 
function FavoritesBuilderModal({ visible, exercises, onClose, onSave }) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
 
  useEffect(() => {
    if (!visible) { setName(''); setSelectedIds([]); setShowPicker(false); }
  }, [visible]);
 
  if (!visible) return null;
 
  const toggleEx = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
 
  const grouped = MUSCLE_GROUPS.map(m => ({
    muscle: m,
    exercises: exercises.filter(e => e.muscle === m),
  })).filter(g => g.exercises.length > 0);
 
  const save = () => {
    if (!name.trim() || selectedIds.length === 0) return;
    onSave({ name: name.trim(), exerciseIds: selectedIds });
  };
 
  return (
    <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.modal,{maxHeight:'90%'}]}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>New favorite workout</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:COLORS.text}}>X</Text></TouchableOpacity>
        </View>
        <Text style={[s.cardSub,{marginTop:8,marginBottom:4}]}>Template name</Text>
        <TextInput style={s.searchInput} value={name} onChangeText={setName}
          placeholder="e.g. Push Day A" placeholderTextColor={COLORS.textMuted}/>
        <Text style={[s.cardSub,{marginBottom:8}]}>Exercises ({selectedIds.length} selected)</Text>
        <ScrollView style={{maxHeight:300}}>
          {exercises.length === 0 ?
            <Text style={s.emptyText}>Add exercises to your library first.</Text> :
            grouped.map(group => (
              <View key={group.muscle}>
                <Text style={[s.cardSub,{marginTop:8,marginBottom:4}]}>{group.muscle}</Text>
                {group.exercises.map(e => {
                  const selected = selectedIds.includes(e.id);
                  return (
                    <TouchableOpacity key={e.id} style={s.exRow} onPress={() => toggleEx(e.id)}>
                      <View style={{flex:1}}>
                        <Text style={s.cardTitle}>{e.name}</Text>
                        <Text style={s.cardSub}>{e.equipment}</Text>
                      </View>
                      <Text style={{color: selected ? COLORS.success : COLORS.textMuted, fontSize:18}}>
                        {selected ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          }
        </ScrollView>
        <TouchableOpacity style={[s.primaryBtn,{alignItems:'center',marginTop:12}]} onPress={save}>
          <Text style={s.primaryBtnText}>Save favorite</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
 
// ─── MUSCLE MAP DIAGRAM ─────────────────────────────────────────────────────
// Simplified front/back body outline with per-muscle-group colorable regions.
 

 
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [workouts, setWorkouts] = useState([]);
  const [nextWorkoutId, setNextWorkoutId] = useState(1);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [finishedWorkoutSummary, setFinishedWorkoutSummary] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [nextExId, setNextExId] = useState(1);
  const [showExPicker, setShowExPicker] = useState(false);
  const [progressExId, setProgressExId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(null);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [addExMuscle, setAddExMuscle] = useState(null);
  const [libSearch, setLibSearch] = useState('');
  const [openMuscle, setOpenMuscle] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [nextGymId, setNextGymId] = useState(1);
  const [showGymPicker, setShowGymPicker] = useState(false);
  const [newGymName, setNewGymName] = useState('');
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
 
  useEffect(() => {
    const load = async () => {
      try {
        const savedEx = await AsyncStorage.getItem('exercises');
        const savedExId = await AsyncStorage.getItem('nextExId');
        const savedWorkouts = await AsyncStorage.getItem('workouts');
        const savedWorkoutId = await AsyncStorage.getItem('nextWorkoutId');
        const savedGyms = await AsyncStorage.getItem('gyms');
        const savedGymId = await AsyncStorage.getItem('nextGymId');
        const savedFavs = await AsyncStorage.getItem('favorites');
        const savedFavId = await AsyncStorage.getItem('nextFavId');
        const savedMachines = await AsyncStorage.getItem('machines');
        const savedMachineId = await AsyncStorage.getItem('nextMachineId');
        if (savedEx) setExercises(JSON.parse(savedEx));
        if (savedExId) setNextExId(JSON.parse(savedExId));
        if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
        if (savedWorkoutId) setNextWorkoutId(JSON.parse(savedWorkoutId));
        if (savedGyms) setGyms(JSON.parse(savedGyms));
        if (savedGymId) setNextGymId(JSON.parse(savedGymId));
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        if (savedFavId) setNextFavId(JSON.parse(savedFavId));
        if (savedMachines) setMachines(JSON.parse(savedMachines));
        if (savedMachineId) setNextMachineId(JSON.parse(savedMachineId));
      } catch(e) { console.error(e); }
    };
    load();
  }, []);
 
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSecs(s => s+1), 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);
 
  const fmtTimer = () => {
    const m = Math.floor(timerSecs/60), sec = timerSecs%60;
    return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  };
 
  const getEx = (id) => exercises.find(e => e.id === id);
  const setVolume = (set) => {
    if (!set.completed) return 0;
    if (set.warmup) return 0;
    let v;
    if (set.unilateral) v = parseDecimal(set.repsL)*parseDecimal(set.weightL) + parseDecimal(set.repsR)*parseDecimal(set.weightR);
    else v = parseDecimal(set.reps)*parseDecimal(set.weight);
    if (set.hasMyoReps) {
      const myoWeight = set.unilateral ? Math.max(parseDecimal(set.weightL), parseDecimal(set.weightR)) : parseDecimal(set.weight);
      v += parseDecimal(set.myoSets)*parseDecimal(set.myoReps)*myoWeight;
    }
    return v;
  };
  const exerciseVolume = (ex) => ex.sets.reduce((s,set) => s+setVolume(set), 0);
  const totalVol = (w) => w.exercises.reduce((sum,ex) => sum+exerciseVolume(ex),0);
  const volumeByMuscleForWorkouts = (workoutList) => {
    const result = {};
    workoutList.forEach(w => {
      w.exercises.forEach(ex => {
        const info = getEx(ex.exId);
        if (!info) return;
        const vol = exerciseVolume(ex);
        result[info.muscle] = (result[info.muscle]||0) + vol;
      });
    });
    return result;
  };
  const getLastSession = (exId) => {
    const past = workouts
      .filter(w => w.exercises.some(e => e.exId === exId))
      .sort((a,b) => b.date.localeCompare(a.date));
    if (past.length === 0) return null;
    return past[0].exercises.find(e => e.exId === exId).sets;
  };
  const getLastExerciseInfo = (exId) => {
    const past = workouts
      .filter(w => w.exercises.some(e => e.exId === exId))
      .sort((a,b) => b.date.localeCompare(a.date));
    if (past.length === 0) return null;
    const exEntry = past[0].exercises.find(e => e.exId === exId);
    return { machineId: exEntry.machineId, notes: exEntry.notes };
  };
  const getMachine = (id) => machines.find(m => m.id === id);
  const totalSets = (w) => w.exercises.reduce((sum,ex) => sum+ex.sets.reduce((c,set) => c+(set.unilateral?2:1),0),0);
  const fmtDate = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'});
 
  const startWorkout = () => {
    setActiveWorkout({name:'New Workout',exercises:[]});
    setTimerSecs(0); setTimerRunning(true); setPage('log');
  };
 
  const normalizeWorkout = (workout) => {
    const w = JSON.parse(JSON.stringify(workout));
    w.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        set.weight = parseDecimal(set.weight);
        set.reps = parseDecimal(set.reps);
        if (set.unilateral) {
          set.weightL = parseDecimal(set.weightL);
          set.weightR = parseDecimal(set.weightR);
          set.repsL = parseDecimal(set.repsL);
          set.repsR = parseDecimal(set.repsR);
        }
        if (set.hasPartials) set.partialReps = parseDecimal(set.partialReps);
        if (set.hasMyoReps) {
          set.myoSets = parseDecimal(set.myoSets);
          set.myoReps = parseDecimal(set.myoReps);
        }
      });
    });
    return w;
  };
 
  const finishWorkout = () => {
    const w = normalizeWorkout({...activeWorkout,id:nextWorkoutId,date:new Date().toISOString().slice(0,10),duration:Math.round(timerSecs/60)});
    const updated = [...workouts, w];
    const newId = nextWorkoutId + 1;
    setWorkouts(updated);
    setNextWorkoutId(newId);
    setActiveWorkout(null); setTimerRunning(false); setTimerSecs(0);
    setFinishedWorkoutSummary(w);
    setPage('summary');
    AsyncStorage.setItem('workouts', JSON.stringify(updated));
    AsyncStorage.setItem('nextWorkoutId', JSON.stringify(newId));
  };
 
  const addGym = () => {
    if (!newGymName.trim()) return;
    const gym = { id: nextGymId, name: newGymName.trim() };
    const updated = [...gyms, gym];
    const newId = nextGymId + 1;
    setGyms(updated);
    setNextGymId(newId);
    setNewGymName('');
    AsyncStorage.setItem('gyms', JSON.stringify(updated));
    AsyncStorage.setItem('nextGymId', JSON.stringify(newId));
  };
 
  const deleteGym = (gymId) => {
    const updated = gyms.filter(g => g.id !== gymId);
    setGyms(updated);
    AsyncStorage.setItem('gyms', JSON.stringify(updated));
  };
 
  const addMachine = () => {
    if (!newMachineName.trim()) return;
    const machine = { id: nextMachineId, name: newMachineName.trim() };
    const updated = [...machines, machine];
    const newId = nextMachineId + 1;
    setMachines(updated);
    setNextMachineId(newId);
    setNewMachineName('');
    AsyncStorage.setItem('machines', JSON.stringify(updated));
    AsyncStorage.setItem('nextMachineId', JSON.stringify(newId));
  };
 
  const deleteMachine = (machineId) => {
    const updated = machines.filter(m => m.id !== machineId);
    setMachines(updated);
    AsyncStorage.setItem('machines', JSON.stringify(updated));
  };
 
  const assignMachine = (eIdx, machineId) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].machineId = machineId;
    setActiveWorkout(u);
    setShowMachinePicker(false);
    setMachinePickerEIdx(null);
  };
 
  const openNotesEditor = (eIdx) => {
    setNotesEIdx(eIdx);
    setNotesDraft(activeWorkout.exercises[eIdx].notes || '');
    setShowNotesModal(true);
    setExerciseMenuOpen(null);
  };
 
  const saveNotes = () => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[notesEIdx].notes = notesDraft;
    setActiveWorkout(u);
    setShowNotesModal(false);
    setNotesEIdx(null);
  };
 
  const saveFavorite = (fav) => {
    const newFav = { id: nextFavId, name: fav.name, exerciseIds: fav.exerciseIds };
    const updated = [...favorites, newFav];
    const newId = nextFavId + 1;
    setFavorites(updated);
    setNextFavId(newId);
    setShowFavBuilder(false);
    AsyncStorage.setItem('favorites', JSON.stringify(updated));
    AsyncStorage.setItem('nextFavId', JSON.stringify(newId));
  };
 
  const deleteFavorite = (favId) => {
    const updated = favorites.filter(f => f.id !== favId);
    setFavorites(updated);
    AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };
 
  const startFromFavorite = (fav) => {
    const exs = fav.exerciseIds
      .filter(id => exercises.some(e => e.id === id))
      .map(id => ({ exId: id, sets: [{reps:0,weight:0}] }));
    setActiveWorkout({ name: fav.name, exercises: exs });
    setTimerSecs(0); setTimerRunning(true); setPage('log');
  };
 
  const addSet = (eIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    const sets = u.exercises[eIdx].sets;
    const prev = sets.length > 0 ? sets[sets.length-1] : null;
    const newSet = {reps:0,weight:0,warmup:false,unilateral:false,completed:false,hasPartials:false,partialReps:0,hasMyoReps:false,myoSets:0,myoReps:0};
    if (prev) {
      if (prev.unilateral) {
        newSet.unilateral = true;
        newSet.weightL = prev.weightL; newSet.repsL = prev.repsL;
        newSet.weightR = prev.weightR; newSet.repsR = prev.repsR;
      } else {
        newSet.weight = prev.weight;
        newSet.reps = prev.reps;
      }
    }
    sets.push(newSet); setActiveWorkout(u);
  };
  const toggleWarmup = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx].warmup = !u.exercises[eIdx].sets[sIdx].warmup;
    setActiveWorkout(u);
  };
  const toggleCompleted = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx].completed = !u.exercises[eIdx].sets[sIdx].completed;
    setActiveWorkout(u);
  };
  const togglePartials = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx].hasPartials = !u.exercises[eIdx].sets[sIdx].hasPartials;
    setActiveWorkout(u);
  };
  const updatePartialReps = (eIdx,sIdx,val) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx].partialReps = parseInt(val)||0;
    setActiveWorkout(u);
  };
  const toggleMyoReps = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx].hasMyoReps = !u.exercises[eIdx].sets[sIdx].hasMyoReps;
    setActiveWorkout(u);
  };
  const updateMyoReps = (eIdx,sIdx,field,val) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx][field] = parseInt(val)||0;
    setActiveWorkout(u);
  };
  const toggleUnilateral = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    const set = u.exercises[eIdx].sets[sIdx];
    set.unilateral = !set.unilateral;
    if (set.unilateral) {
      set.weightL = parseDecimal(set.weight); set.repsL = parseDecimal(set.reps);
      set.weightR = parseDecimal(set.weight); set.repsR = parseDecimal(set.reps);
    }
    setActiveWorkout(u);
  };
  const updateUnilateralSet = (eIdx,sIdx,side,field,val) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx][field+side] = val;
    setActiveWorkout(u);
  };
  const swapSides = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    const set = u.exercises[eIdx].sets[sIdx];
    set.swapped = !set.swapped;
    setActiveWorkout(u);
  };
  const removeSet = (eIdx,sIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets.splice(sIdx,1); setActiveWorkout(u);
  };
  const removeExercise = (eIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises.splice(eIdx,1); setActiveWorkout(u);
  };
  const updateSet = (eIdx,sIdx,field,val) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises[eIdx].sets[sIdx][field] = val; setActiveWorkout(u);
  };
  const pickExercise = (exId) => {
    if (swapExEIdx !== null) {
      const u = JSON.parse(JSON.stringify(activeWorkout));
      u.exercises[swapExEIdx].exId = exId;
      setActiveWorkout(u);
      setSwapExEIdx(null);
      setShowExPicker(false);
      return;
    }
    const u = JSON.parse(JSON.stringify(activeWorkout));
    const newIdx = u.exercises.length;
    u.exercises.push({exId,sets:[{reps:0,weight:0,warmup:false,unilateral:false}]});
    setActiveWorkout(u);
    setCollapsedEx(prev => ({...prev, [newIdx]: true}));
    setShowExPicker(false);
  };
  const deleteExerciseFromWorkout = (eIdx) => {
    const u = JSON.parse(JSON.stringify(activeWorkout));
    u.exercises.splice(eIdx,1); setActiveWorkout(u);
    setExerciseMenuOpen(null);
  };
  const startSwapExercise = (eIdx) => {
    setSwapExEIdx(eIdx);
    setExerciseMenuOpen(null);
    setShowExPicker(true);
  };
  const saveNewExercise = (ex) => {
    const updated = [...exercises, ex];
    const newId = nextExId + 1;
    setExercises(updated);
    setNextExId(newId);
    setShowAddExModal(false);
    AsyncStorage.setItem('exercises', JSON.stringify(updated));
    AsyncStorage.setItem('nextExId', JSON.stringify(newId));
  };
  const deleteExercise = (exId) => {
    const updated = exercises.filter(e => e.id!==exId);
    setExercises(updated);
    AsyncStorage.setItem('exercises', JSON.stringify(updated));
  };
 
  const availableMachinesForEx = progressExId ? machines.filter(m =>
    workouts.some(w => w.exercises.some(e => e.exId===progressExId && e.machineId===m.id))
  ) : [];
  const progressData = progressExId ? workouts
    .filter(w => w.exercises.some(e => e.exId===progressExId && (!progressMachineId || e.machineId===progressMachineId)))
    .sort((a,b) => a.date.localeCompare(b.date)).slice(-6)
    .map(w => {
      const ex = w.exercises.find(e => e.exId===progressExId && (!progressMachineId || e.machineId===progressMachineId));
      const vol = ex.sets.reduce((s,set) => s + setVolume(set), 0);
      const maxWt = Math.max(...ex.sets.map(set => set.unilateral ? Math.max(parseDecimal(set.weightL),parseDecimal(set.weightR)) : parseDecimal(set.weight)));
      return {
        date: fmtDate(w.date),
        vol,
        maxWt,
      };
    }) : [];
  const maxVol = Math.max(...progressData.map(d => d.vol),1);
 
  const recent = [...workouts].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    monday.setHours(0,0,0,0);
    return monday;
  };
  const weekStart = getWeekStart();
  const thisWeek = workouts.filter(w => new Date(w.date+'T00:00:00') >= weekStart);
 
  const renderDashboard = () => (
    <ScrollView style={s.page}>
      <View style={s.rowBetween}>
        <Text style={s.pageTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => setPage('settings')} style={{padding:8}}>
          <Text style={{color:COLORS.text,fontSize:22}}>☰</Text>
        </TouchableOpacity>
      </View>
      <Text style={[s.cardSub,{marginBottom:8}]}>Week of {weekStart.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} (resets Mon)</Text>
      <View style={s.statRow}>
        <View style={s.statCard}><Text style={s.statVal}>{thisWeek.length}</Text><Text style={s.statLabel}>Workouts{'\n'}this week</Text></View>
        <View style={s.statCard}><Text style={s.statVal}>{thisWeek.reduce((n,w)=>n+totalSets(w),0)}</Text><Text style={s.statLabel}>Sets{'\n'}this week</Text></View>
        <View style={s.statCard}><Text style={s.statVal}>{(()=>{const v=thisWeek.reduce((n,w)=>n+totalVol(w),0);return v>999?(v/1000).toFixed(1)+'k':v;})()}</Text><Text style={s.statLabel}>kg{'\n'}lifted</Text></View>
      </View>
            <View style={s.rowBetween}>
        <Text style={s.sectionTitle}>Recent workouts</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={startWorkout}>
          <Text style={s.primaryBtnText}>Start workout</Text>
        </TouchableOpacity>
      </View>
      {recent.length===0 ?
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🏋️</Text>
          <Text style={s.emptyText}>No workouts yet.{'\n'}Start your first one!</Text>
        </View> :
        recent.map(w => (
          <TouchableOpacity key={w.id} style={s.card} activeOpacity={0.7}
            onPress={() => { setEditingWorkout(w); setShowEditModal(true); }}>
            <View style={s.rowBetween}>
              <View style={{flex:1}}>
                <Text style={s.cardTitle}>{w.name}</Text>
                <Text style={s.cardSub}>{fmtDate(w.date)} · {w.exercises.length} exercises · {totalSets(w)} sets · {w.duration} min{w.gym ? ' · 📍 '+w.gym : ''}</Text>
              </View>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <View style={s.badge}><Text style={s.badgeText}>{totalVol(w).toLocaleString()} kg</Text></View>
                <TouchableOpacity onPress={(e) => { e.stopPropagation && e.stopPropagation(); setShowWorkoutMenu(showWorkoutMenu===w.id?null:w.id); }}
                  hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:10}}>
                  <Text style={{fontSize:24,color:COLORS.textMuted}}>...</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showWorkoutMenu===w.id && (
              <View style={s.dropdownMenu}>
                <TouchableOpacity style={s.dropdownItem} onPress={() => {
                  setEditingWorkout(w); setShowEditModal(true); setShowWorkoutMenu(null);
                }}>
                  <Text style={s.dropdownItemText}>✏️  Edit workout</Text>
                </TouchableOpacity>
                <View style={s.dropdownDivider}/>
                <TouchableOpacity style={s.dropdownItem} onPress={() => {
                  const updated = workouts.filter(x=>x.id!==w.id);
                  setWorkouts(updated);
                  AsyncStorage.setItem('workouts', JSON.stringify(updated));
                  setShowWorkoutMenu(null);
                }}>
                  <Text style={[s.dropdownItemText,{color:COLORS.danger}]}>🗑  Delete workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))
      }
      <View style={{height:20}}/>
    </ScrollView>
  );
 
  const renderLog = () => {
    if (!activeWorkout) return (
      <View style={[s.page,s.centered]}>
        <Text style={s.emptyIcon}>➕</Text>
        <Text style={s.emptyText}>No active workout.</Text>
        <TouchableOpacity style={[s.primaryBtn,{marginTop:16}]} onPress={startWorkout}>
          <Text style={s.primaryBtnText}>Start new workout</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView style={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.rowBetween}>
          <TextInput style={s.workoutNameInput} value={activeWorkout.name}
            onChangeText={t => setActiveWorkout({...activeWorkout,name:t})}
            placeholder="Workout name" placeholderTextColor={COLORS.textMuted}/>
          <TouchableOpacity style={s.primaryBtn} onPress={finishWorkout}>
            <Text style={s.primaryBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.gymPill} onPress={() => setShowGymPicker(true)}>
          <Text style={s.gymPillText}>
            📍 {activeWorkout.gym ? activeWorkout.gym : 'Select gym'}
          </Text>
          <Text style={{color:COLORS.textMuted,fontSize:12}}>Change</Text>
        </TouchableOpacity>
        <View style={[s.card,s.rowBetween]}>
          <View>
            <Text style={s.statLabel}>Duration</Text>
            <Text style={[s.statVal,{fontSize:32}]}>{fmtTimer()}</Text>
          </View>
          <View style={s.row}>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setTimerRunning(r=>!r)}>
              <Text style={s.ghostBtnText}>{timerRunning?'⏸':'▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.ghostBtn,{marginLeft:8}]} onPress={() => setTimerSecs(0)}>
              <Text style={s.ghostBtnText}>↺</Text>
            </TouchableOpacity>
          </View>
        </View>
        {activeWorkout.exercises.map((ex,eIdx) => {
          const info = getEx(ex.exId);
          const color = MUSCLE_COLORS[info?.muscle]||COLORS.accent;
          const lastSets = getLastSession(ex.exId);
          const lastInfo = getLastExerciseInfo(ex.exId);
          const isCollapsed = !!collapsedEx[eIdx];
          const menuKey = eIdx;
          const machine = ex.machineId ? getMachine(ex.machineId) : null;
          return (
            <View key={eIdx} style={[s.logExCard,{borderLeftColor:color}]}>
              <TouchableOpacity style={s.rowBetween} activeOpacity={0.7}
                onPress={() => setCollapsedEx(prev => ({...prev, [eIdx]: !prev[eIdx]}))}>
                <View style={{flex:1}}>
                  <Text style={s.cardTitle}>{info?.name||'Unknown'}</Text>
                  <Text style={s.cardSub}>{info?.muscle} · {info?.equipment}{isCollapsed ? ` · ${ex.sets.length} set${ex.sets.length!==1?'s':''}` : ''}</Text>
                  {(machine || ex.notes) && (
                    <Text style={[s.cardSub,{color:COLORS.accent,marginTop:1}]}>
                      {machine ? `⚙️ ${machine.name}` : ''}{machine && ex.notes ? ' · ' : ''}{ex.notes ? `📝 ${ex.notes}` : ''}
                    </Text>
                  )}
                </View>
                <View style={{alignItems:'flex-end',marginRight:4}}>
                  <Text style={s.exVolumeText}>{exerciseVolume(ex).toLocaleString()} kg</Text>
                  <Text style={{color:COLORS.textMuted,fontSize:14}}>{isCollapsed ? '▼' : '▲'}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  <TouchableOpacity onPress={(e) => { setExerciseMenuOpen(exerciseMenuOpen===menuKey?null:menuKey); }}
                    hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:10}}>
                    <Text style={{fontSize:24,color:COLORS.textMuted}}>⋮</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              {exerciseMenuOpen===menuKey && (
                <View style={s.dropdownMenu}>
                  <TouchableOpacity style={s.dropdownItem} onPress={() => startSwapExercise(eIdx)}>
                    <Text style={s.dropdownItemText}>🔁  Swap exercise</Text>
                  </TouchableOpacity>
                  <View style={s.dropdownDivider}/>
                  <TouchableOpacity style={s.dropdownItem} onPress={() => {
                    setMachinePickerEIdx(eIdx); setShowMachinePicker(true); setExerciseMenuOpen(null);
                  }}>
                    <Text style={s.dropdownItemText}>⚙️  Machine</Text>
                  </TouchableOpacity>
                  <View style={s.dropdownDivider}/>
                  <TouchableOpacity style={s.dropdownItem} onPress={() => openNotesEditor(eIdx)}>
                    <Text style={s.dropdownItemText}>📝  Notes</Text>
                  </TouchableOpacity>
                  <View style={s.dropdownDivider}/>
                  <TouchableOpacity style={s.dropdownItem} onPress={() => deleteExerciseFromWorkout(eIdx)}>
                    <Text style={[s.dropdownItemText,{color:COLORS.danger}]}>🗑  Delete exercise</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!isCollapsed && <>
              <View style={[s.row,{marginTop:8,marginBottom:4}]}>
                <Text style={[s.tableHeader,{width:24}]}>#</Text>
                <Text style={[s.tableHeader,{flex:1}]}>Weight (kg)</Text>
                <Text style={[s.tableHeader,{flex:1}]}>Reps</Text>
                <Text style={{width:32}}/>
                <Text style={{width:28}}/>
              </View>
              {ex.sets.map((set,sIdx) => {
                const lastSet = lastSets ? lastSets[sIdx] : null;
                const setKey = eIdx+'-'+sIdx;
                const setOpen = !!expandedSets[setKey];
                if (set.unilateral) {
                  const order = set.swapped ? ['R','L'] : ['L','R'];
                  return (
                    <View key={sIdx} style={{marginBottom:6}}>
                      <View style={[s.rowBetween,{marginBottom:2}]}>
                        <Text style={[s.cardSub,{fontSize:12}]}>Set {sIdx+1}</Text>
                        <Text style={s.setVolumeText}>{setVolume(set).toLocaleString()} kg</Text>
                      </View>
                      <View style={s.row}>
                        <Text style={[s.cardSub,{width:24}]}>{order[0]}</Text>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(order[0]==='L'?(set.weightL??0):(set.weightR??0))}
                          onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[0],'weight',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(order[0]==='L'?(set.repsL??0):(set.repsR??0))}
                          onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[0],'reps',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <TouchableOpacity onPress={() => toggleCompleted(eIdx,sIdx)} style={[s.checkBadge, set.completed && s.checkBadgeActive]}>
                          <Text style={[s.checkBadgeText, set.completed && s.checkBadgeTextActive]}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setExpandedSets(prev => ({...prev, [setKey]: !prev[setKey]}))}
                          hitSlop={{top:14,bottom:14,left:14,right:14}} style={{padding:8}}>
                          <Text style={{fontSize:20,color:COLORS.textMuted}}>⋮</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[s.row,{marginTop:4}]}>
                        <Text style={[s.cardSub,{width:24}]}>{order[1]}</Text>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(order[1]==='L'?(set.weightL??0):(set.weightR??0))}
                          onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[1],'weight',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <TextInput style={[s.setInput,{flex:1,marginRight:6}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                          value={String(order[1]==='L'?(set.repsL??0):(set.repsR??0))}
                          onChangeText={v=>updateUnilateralSet(eIdx,sIdx,order[1],'reps',v)}
                          placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                        <View style={{width:32}}/>
                        <View style={{width:28}}/>
                      </View>
                      {setOpen && (
                        <View>
                          <View style={[s.row,{marginTop:6,gap:8}]}>
                            <TouchableOpacity onPress={() => swapSides(eIdx,sIdx)} style={s.swapBtn}>
                              <Text style={s.swapBtnText}>⇅ Swap L/R</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeSet(eIdx,sIdx)} style={{width:28,alignItems:'center'}}>
                              <Text style={{color:COLORS.textMuted}}>X</Text>
                            </TouchableOpacity>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                            <TouchableOpacity onPress={() => toggleUnilateral(eIdx,sIdx)} style={[s.wordBadge, s.unilateralBadgeActive]}>
                              <Text style={[s.wordBadgeText, s.unilateralBadgeTextActive]}>Unilateral</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => togglePartials(eIdx,sIdx)} style={[s.wordBadge, s.partialsBadgeIdle, set.hasPartials && s.partialsBadgeActive]}>
                              <Text style={[s.wordBadgeText, s.partialsBadgeTextIdle, set.hasPartials && s.partialsBadgeTextActive]}>Partials</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => toggleMyoReps(eIdx,sIdx)} style={[s.wordBadge, s.myoBadgeIdle, set.hasMyoReps && s.myoBadgeActive]}>
                              <Text style={[s.wordBadgeText, s.myoBadgeTextIdle, set.hasMyoReps && s.myoBadgeTextActive]}>Myo-Reps</Text>
                            </TouchableOpacity>
                          </ScrollView>
                          {set.hasPartials && (
                            <View style={[s.row,{marginTop:6}]}>
                              <Text style={[s.cardSub,{marginRight:8}]}>Partial reps:</Text>
                              <TextInput style={[s.setInput,{width:60}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                                value={String(set.partialReps||0)} onChangeText={v=>updatePartialReps(eIdx,sIdx,v)}
                                placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                            </View>
                          )}
                          {set.hasMyoReps && (
                            <View style={[s.row,{marginTop:6}]}>
                              <Text style={[s.cardSub,{marginRight:8}]}>Mini-sets:</Text>
                              <TextInput style={[s.setInput,{width:50,marginRight:12}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                                value={String(set.myoSets||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoSets',v)}
                                placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                              <Text style={[s.cardSub,{marginRight:8}]}>Reps each:</Text>
                              <TextInput style={[s.setInput,{width:50}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                                value={String(set.myoReps||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoReps',v)}
                                placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                }
                return (
                  <View key={sIdx} style={{marginBottom:6}}>
                    <Text style={[s.setVolumeText,{textAlign:'right',marginBottom:2}]}>{setVolume(set).toLocaleString()} kg</Text>
                    <View style={s.row}>
                      <TouchableOpacity onPress={() => setExpandedSets(prev => ({...prev, [setKey]: !prev[setKey]}))}
                        hitSlop={{top:14,bottom:14,left:14,right:14}} style={{width:24,paddingVertical:6}}>
                        <Text style={[s.cardSub,{color: set.warmup ? '#EAB308' : COLORS.textSecondary}]}>{sIdx+1}</Text>
                      </TouchableOpacity>
                      <TextInput style={[s.setInput,{flex:1,marginRight:6}, set.warmup && s.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus={true}
                        value={String(set.weight)} onChangeText={v=>updateSet(eIdx,sIdx,'weight',v)}
                        placeholder={lastSet ? String(lastSet.weight) : "0"} placeholderTextColor={COLORS.textMuted}/>
                      <TextInput style={[s.setInput,{flex:1,marginRight:6}, set.warmup && s.setInputWarmup]} keyboardType="decimal-pad" selectTextOnFocus={true}
                        value={String(set.reps)} onChangeText={v=>updateSet(eIdx,sIdx,'reps',v)}
                        placeholder={lastSet ? String(lastSet.reps) : "0"} placeholderTextColor={COLORS.textMuted}/>
                      <TouchableOpacity onPress={() => toggleCompleted(eIdx,sIdx)} style={[s.checkBadge, set.completed && s.checkBadgeActive]}>
                        <Text style={[s.checkBadgeText, set.completed && s.checkBadgeTextActive]}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeSet(eIdx,sIdx)} style={{width:28,alignItems:'center'}}>
                        <Text style={{color:COLORS.textMuted}}>X</Text>
                      </TouchableOpacity>
                    </View>
                    {setOpen && (
                      <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                          <TouchableOpacity onPress={() => toggleWarmup(eIdx,sIdx)} style={[s.wordBadge, s.warmupBadgeIdle, set.warmup && s.warmupBadgeActive]}>
                            <Text style={[s.wordBadgeText, s.warmupBadgeTextIdle, set.warmup && s.warmupBadgeTextActive]}>Warm-Up</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => toggleUnilateral(eIdx,sIdx)} style={[s.wordBadge, s.unilateralBadgeBorder]}>
                            <Text style={[s.wordBadgeText, s.unilateralBadgeText]}>Unilateral</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => togglePartials(eIdx,sIdx)} style={[s.wordBadge, s.partialsBadgeIdle, set.hasPartials && s.partialsBadgeActive]}>
                            <Text style={[s.wordBadgeText, s.partialsBadgeTextIdle, set.hasPartials && s.partialsBadgeTextActive]}>Partials</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => toggleMyoReps(eIdx,sIdx)} style={[s.wordBadge, s.myoBadgeIdle, set.hasMyoReps && s.myoBadgeActive]}>
                            <Text style={[s.wordBadgeText, s.myoBadgeTextIdle, set.hasMyoReps && s.myoBadgeTextActive]}>Myo-Reps</Text>
                          </TouchableOpacity>
                        </ScrollView>
                        {set.hasPartials && (
                          <View style={[s.row,{marginTop:6}]}>
                            <Text style={[s.cardSub,{marginRight:8}]}>Partial reps:</Text>
                            <TextInput style={[s.setInput,{width:60}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                              value={String(set.partialReps||0)} onChangeText={v=>updatePartialReps(eIdx,sIdx,v)}
                              placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          </View>
                        )}
                        {set.hasMyoReps && (
                          <View style={[s.row,{marginTop:6}]}>
                            <Text style={[s.cardSub,{marginRight:8}]}>Mini-sets:</Text>
                            <TextInput style={[s.setInput,{width:50,marginRight:12}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                              value={String(set.myoSets||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoSets',v)}
                              placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                            <Text style={[s.cardSub,{marginRight:8}]}>Reps each:</Text>
                            <TextInput style={[s.setInput,{width:50}]} keyboardType="decimal-pad" selectTextOnFocus={true}
                              value={String(set.myoReps||0)} onChangeText={v=>updateMyoReps(eIdx,sIdx,'myoReps',v)}
                              placeholder="0" placeholderTextColor={COLORS.textMuted}/>
                          </View>
                        )}
                      </View>
                    )}
                    {lastSet && (
                      <Text style={s.lastSessionHint}>Last: {lastSet.weight}kg × {lastSet.reps}</Text>
                    )}
                  </View>
                );
              })}
              <TouchableOpacity style={s.addSetBtn} onPress={() => addSet(eIdx)}>
                <Text style={s.addSetBtnText}>+ Add set</Text>
              </TouchableOpacity>
              </>}
            </View>
          );
        })}
        <TouchableOpacity style={s.addExBtn} onPress={() => setShowExPicker(true)}>
          <Text style={s.addExBtnText}>+ Add exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.ghostBtn,{alignItems:'center',marginTop:8}]}
          onPress={() => setShowDiscardConfirm(true)}>
          <Text style={{color:COLORS.danger}}>Discard workout</Text>
        </TouchableOpacity>
        <View style={{height:20}}/>
      </ScrollView>
      </KeyboardAvoidingView>
    );
  };
 
  const renderLibrary = () => {
    if (openMuscle) {
      const muscleExercises = exercises.filter(e =>
        e.muscle === openMuscle && e.name.toLowerCase().includes(libSearch.toLowerCase())
      );
      return (
        <View style={{flex:1}}>
          <View style={[s.rowBetween, {paddingHorizontal:16, paddingTop:56, paddingBottom:8}]}>
            <TouchableOpacity onPress={() => { setOpenMuscle(null); setLibSearch(''); }} style={s.backBtn}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={[s.pageTitle, {margin:0}]}>{openMuscle}</Text>
            <TouchableOpacity style={s.primaryBtn} onPress={() => {
              setAddExMuscle(openMuscle); setShowAddExModal(true);
            }}>
              <Text style={s.primaryBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={[s.searchInput,{marginHorizontal:16}]} value={libSearch}
            onChangeText={setLibSearch} placeholder="Search..." placeholderTextColor={COLORS.textMuted}/>
          <ScrollView contentContainerStyle={{padding:16}}>
            {muscleExercises.length === 0 ?
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🏋️</Text>
                <Text style={s.emptyText}>No exercises yet.{'\n'}Tap "+ Add" to add one!</Text>
              </View> :
              <View style={s.exGrid}>
                {muscleExercises.map(e => (
                  <TouchableOpacity key={e.id} style={s.exGridCard} onLongPress={() => deleteExercise(e.id)}>
                    <View style={s.exGridImgWrap}>
                      <Text style={{fontSize:32}}>🏋️</Text>
                    </View>
                    <Text style={s.exGridName} numberOfLines={2}>{e.name}</Text>
                    <Text style={s.exGridSub}>{e.equipment}</Text>
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
      <ScrollView style={s.page}>
        <Text style={s.pageTitle}>Exercise Library</Text>
        <TextInput style={s.searchInput} value={libSearch} onChangeText={setLibSearch}
          placeholder="Search muscle groups..." placeholderTextColor={COLORS.textMuted}/>
        {MUSCLE_GROUPS.filter(m => m.toLowerCase().includes(libSearch.toLowerCase())).map(muscle => {
          const muscleImg = MUSCLE_IMAGES[muscle];
          const count = exercises.filter(e => e.muscle === muscle).length;
          return (
            <TouchableOpacity key={muscle} style={s.muscleGroupHeader} onPress={() => {
              setOpenMuscle(muscle); setLibSearch('');
            }}>
              <View style={s.muscleIconWrap}>
                <Image source={muscleImg} style={{width:120,height:120}} resizeMode="contain"/>
              </View>
              <View style={{flex:1}}>
                <Text style={s.muscleGroupName}>{muscle}</Text>
                <Text style={s.cardSub}>{count} exercise{count!==1?'s':''}</Text>
              </View>
              <Text style={{color:COLORS.textMuted,fontSize:18}}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{height:20}}/>
      </ScrollView>
    );
  };
 
  const renderProgress = () => (
    <ScrollView style={s.page}>
      <Text style={s.pageTitle}>Progress</Text>
      {exercises.length===0 ?
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📈</Text>
          <Text style={s.emptyText}>Add exercises to your library first, then log workouts to see progress.</Text>
        </View> : <>
        <View style={s.card}>
          <Text style={[s.cardSub,{marginBottom:8}]}>Select exercise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {exercises.map(e => (
              <TouchableOpacity key={e.id} style={[s.filterTag,progressExId===e.id&&s.filterTagActive,{marginRight:6}]}
                onPress={() => { setProgressExId(e.id); setProgressMachineId(null); }}>
                <Text style={[s.filterTagText,progressExId===e.id&&s.filterTagTextActive]}>{e.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {progressExId && availableMachinesForEx.length > 0 && (
          <View style={s.card}>
            <Text style={[s.cardSub,{marginBottom:8}]}>Filter by machine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={[s.filterTag,!progressMachineId&&s.filterTagActive,{marginRight:6}]}
                onPress={() => setProgressMachineId(null)}>
                <Text style={[s.filterTagText,!progressMachineId&&s.filterTagTextActive]}>All</Text>
              </TouchableOpacity>
              {availableMachinesForEx.map(m => (
                <TouchableOpacity key={m.id} style={[s.filterTag,progressMachineId===m.id&&s.filterTagActive,{marginRight:6}]}
                  onPress={() => setProgressMachineId(m.id)}>
                  <Text style={[s.filterTagText,progressMachineId===m.id&&s.filterTagTextActive]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {!progressExId ?
          <Text style={s.emptyText}>Select an exercise above.</Text> :
          progressData.length===0 ?
          <Text style={s.emptyText}>Log this exercise to see progress.</Text> :
          <View style={s.card}>
            <Text style={[s.cardSub,{marginBottom:8}]}>Volume per session (kg)</Text>
            {progressData.map((d,i) => (
              <View key={i} style={s.barRow}>
                <Text style={s.barLabel}>{d.date}</Text>
                <View style={s.barWrap}>
                  <View style={[s.barFill,{width:Math.round((d.vol/maxVol)*100)+'%',backgroundColor:'#1E3A5F'}]}>
                    <Text style={s.barText}>{d.vol>0?d.vol+' kg':''}</Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={[s.statRow,{marginTop:16,marginBottom:0}]}>
              <View style={s.statCard}><Text style={s.statVal}>{progressData.length}</Text><Text style={s.statLabel}>Sessions</Text></View>
              <View style={s.statCard}><Text style={s.statVal}>{Math.max(...progressData.map(d=>d.maxWt))} kg</Text><Text style={s.statLabel}>Top weight</Text></View>
              <View style={s.statCard}><Text style={s.statVal}>{Math.max(...progressData.map(d=>d.vol))}</Text><Text style={s.statLabel}>Best vol</Text></View>
            </View>
          </View>
        }
      </>}
      <View style={{height:20}}/>
    </ScrollView>
  );
 
  const renderFavorites = () => (
    <ScrollView style={s.page}>
      <View style={s.rowBetween}>
        <Text style={s.pageTitle}>Favorites</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setShowFavBuilder(true)}>
          <Text style={s.primaryBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      {favorites.length === 0 ?
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>❤️</Text>
          <Text style={s.emptyText}>No favorites yet.{'\n'}Build one to start workouts with one tap.</Text>
        </View> :
        favorites.map(fav => (
          <TouchableOpacity key={fav.id} style={s.card} activeOpacity={0.8} onLongPress={() => setFavMenuId(favMenuId===fav.id?null:fav.id)} delayLongPress={600}>
            <View style={s.rowBetween}>
              <View style={{flex:1}}>
                <Text style={s.cardTitle}>{fav.name}</Text>
                <Text style={s.cardSub}>{fav.exerciseIds.length} exercises</Text>
              </View>
            </View>
            {favMenuId===fav.id&&(
              <View style={s.dropdownMenu}>
                <TouchableOpacity style={s.dropdownItem} onPress={() => {setFavMenuId(null);setEditingFav(fav);setShowFavBuilder(true);}}>
                  <Text style={s.dropdownItemText}>✏️  Edit</Text>
                </TouchableOpacity>
                <View style={s.dropdownDivider}/>
                <TouchableOpacity style={s.dropdownItem} onPress={() => {deleteFavorite(fav.id);setFavMenuId(null);}}>
                  <Text style={[s.dropdownItemText,{color:COLORS.danger}]}>🗑  Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[s.primaryBtn,{alignItems:'center',marginTop:10}]} onPress={() => startFromFavorite(fav)}>
              <Text style={s.primaryBtnText}>▶ Start workout</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      }
      <View style={{height:20}}/>
    </ScrollView>
  );
 
  const renderSummary = () => {
    if (!finishedWorkoutSummary) return null;
    const w = finishedWorkoutSummary;
        return (
      <ScrollView style={s.page}>
        <Text style={s.pageTitle}>Workout Complete 🎉</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{w.name}</Text>
          <Text style={s.cardSub}>{fmtDate(w.date)} · {w.exercises.length} exercises · {totalSets(w)} sets · {w.duration} min{w.gym ? ' · 📍 '+w.gym : ''}</Text>
          <View style={[s.statRow,{marginTop:12,marginBottom:0}]}>
            <View style={s.statCard}><Text style={s.statVal}>{totalSets(w)}</Text><Text style={s.statLabel}>Sets</Text></View>
            <View style={s.statCard}><Text style={s.statVal}>{totalVol(w).toLocaleString()}</Text><Text style={s.statLabel}>kg volume</Text></View>
            <View style={s.statCard}><Text style={s.statVal}>{w.duration}</Text><Text style={s.statLabel}>Minutes</Text></View>
          </View>
        </View>
                <TouchableOpacity style={[s.primaryBtn,{alignItems:'center'}]} onPress={() => { setFinishedWorkoutSummary(null); setPage('dashboard'); }}>
          <Text style={s.primaryBtnText}>Done</Text>
        </TouchableOpacity>
        <View style={{height:20}}/>
      </ScrollView>
    );
  };
 
  const anyModalOpen = showExPicker || showAddExModal || showEditModal || showGymPicker || showFavBuilder || showMachinePicker || showNotesModal || showDiscardConfirm;
 
  return (
    <View style={s.container}>
      <StatusBar style="light" backgroundColor={COLORS.bg}/>
      {page==='dashboard' && renderDashboard()}
      {page==='log' && renderLog()}
      {page==='library' && renderLibrary()}
      {page==='progress' && renderProgress()}
      {page==='favorites' && renderFavorites()}
      {page==='summary' && renderSummary()}
      <ExPickerModal visible={showExPicker} exercises={exercises} onClose={() => { setShowExPicker(false); setSwapExEIdx(null); }} onPick={pickExercise}/>
      <AddExModal visible={showAddExModal} muscle={addExMuscle} nextExId={nextExId}
        onClose={() => setShowAddExModal(false)} onSave={saveNewExercise}/>
      <EditWorkoutModal visible={showEditModal} workout={editingWorkout} exercises={exercises}
        onClose={() => setShowEditModal(false)}
        onSave={(updated) => {
          const newWorkouts = workouts.map(w=>w.id===updated.id?updated:w);
          setWorkouts(newWorkouts);
          AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
          setShowEditModal(false);
        }}/>
      <GymPickerModal visible={showGymPicker} gyms={gyms} newGymName={newGymName}
        onChangeNewGymName={setNewGymName} onAddGym={addGym} onDeleteGym={deleteGym}
        onSelectGym={(gymName) => {
          if (activeWorkout) setActiveWorkout({...activeWorkout, gym: gymName});
          setShowGymPicker(false);
        }}
        onClose={() => setShowGymPicker(false)}/>
      <MachinePickerModal visible={showMachinePicker} machines={machines} newMachineName={newMachineName}
        onChangeNewMachineName={setNewMachineName} onAddMachine={addMachine} onDeleteMachine={deleteMachine}
        onSelectMachine={(machineId) => assignMachine(machinePickerEIdx, machineId)}
        onClose={() => { setShowMachinePicker(false); setMachinePickerEIdx(null); }}/>
      <NotesModal visible={showNotesModal} draft={notesDraft} onChangeDraft={setNotesDraft}
        onSave={saveNotes} onClose={() => { setShowNotesModal(false); setNotesEIdx(null); }}/>
      <ConfirmModal visible={showDiscardConfirm} title="Discard workout?"
        message="This will permanently delete everything logged in this session."
        confirmLabel="Discard"
        onConfirm={() => {
          setActiveWorkout(null); setTimerRunning(false); setTimerSecs(0); setShowDiscardConfirm(false);
        }}
        onCancel={() => setShowDiscardConfirm(false)}/>
      <FavoritesBuilderModal visible={showFavBuilder} exercises={exercises}
        onClose={() => setShowFavBuilder(false)} onSave={saveFavorite}/>
      <View style={[s.navbar,{display: anyModalOpen ? 'none' : 'flex'}]}>
        {[
          {id:'dashboard',icon:'🏠',label:'Home'},
          {id:'favorites',icon:'❤️',label:'Favorites'},
          {id:'log',icon:'➕',label:'Log'},
          {id:'library',icon:'📚',label:'Exercises'},
          {id:'progress',icon:'📈',label:'Progress'},
        ].map(tab => (
          <TouchableOpacity key={tab.id} style={s.navTab} onPress={() => setPage(tab.id)}>
            <Text style={[s.navIcon,page===tab.id&&{opacity:1}]}>{tab.icon}</Text>
            <Text style={[s.navLabel,page===tab.id&&{color:COLORS.accent}]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
 
const s = StyleSheet.create({
  container: {flex:1,backgroundColor:COLORS.bg},
  page: {flex:1,paddingHorizontal:19,paddingTop:66},
  centered: {alignItems:'center',justifyContent:'center'},
  pageTitle: {fontSize:28,fontWeight:'600',color:COLORS.text,marginBottom:19},
  sectionTitle: {fontSize:19,fontWeight:'500',color:COLORS.text},
  card: {backgroundColor:COLORS.card,borderRadius:14,padding:19,marginBottom:14,borderWidth:0.5,borderColor:COLORS.border},
  logExCard: {backgroundColor:'#1E1E1E',borderRadius:14,padding:16,marginBottom:12,borderWidth:0.5,borderColor:COLORS.border,borderLeftWidth:5},
  cardTitle: {fontSize:18,fontWeight:'500',color:COLORS.text},
  cardSub: {fontSize:15,color:COLORS.textSecondary,marginTop:2},
  exVolumeText: {fontSize:13,color:COLORS.accent,fontWeight:'600',marginBottom:2},
  setVolumeText: {fontSize:11,color:COLORS.textMuted,fontWeight:'500'},
  statRow: {flexDirection:'row',gap:12,marginBottom:19},
  statCard: {flex:1,backgroundColor:COLORS.card,borderRadius:12,padding:14,borderWidth:0.5,borderColor:COLORS.border},
  statVal: {fontSize:26,fontWeight:'500',color:COLORS.text},
  statLabel: {fontSize:13,color:COLORS.textMuted,marginTop:2},
  rowBetween: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
  row: {flexDirection:'row',alignItems:'center'},
  primaryBtn: {backgroundColor:COLORS.accent,paddingHorizontal:19,paddingVertical:9,borderRadius:9},
  primaryBtnText: {color:COLORS.white,fontWeight:'500',fontSize:16},
  ghostBtn: {borderWidth:0.5,borderColor:COLORS.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9},
  ghostBtnText: {color:COLORS.textSecondary,fontSize:19},
  badge: {backgroundColor:COLORS.accentLight,paddingHorizontal:12,paddingVertical:5,borderRadius:9},
  badgeText: {color:COLORS.accent,fontSize:14,fontWeight:'500'},
  emptyState: {alignItems:'center',paddingVertical:47},
  emptyIcon: {fontSize:47,marginBottom:14},
  emptyText: {color:COLORS.textMuted,fontSize:16,textAlign:'center',lineHeight:26},
  workoutNameInput: {flex:1,fontSize:19,fontWeight:'500',color:COLORS.text,borderWidth:0.5,borderColor:COLORS.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9,marginRight:9,backgroundColor:COLORS.card},
  setInput: {borderWidth:0.5,borderColor:COLORS.border,borderRadius:7,paddingHorizontal:6,paddingVertical:4,backgroundColor:COLORS.card,color:COLORS.text,textAlign:'center',fontSize:15},
  tableHeader: {fontSize:14,color:COLORS.textMuted,marginBottom:2},
  addSetBtn: {borderWidth:1,borderStyle:'dashed',borderColor:COLORS.border,borderRadius:9,padding:9,alignItems:'center',marginTop:7},
  addSetBtnText: {color:COLORS.textMuted,fontSize:15},
  addExBtn: {borderWidth:1,borderStyle:'dashed',borderColor:COLORS.border,borderRadius:9,padding:14,alignItems:'center',marginTop:5},
  addExBtnText: {color:COLORS.textMuted,fontSize:16},
  searchInput: {borderWidth:0.5,borderColor:COLORS.border,borderRadius:9,paddingHorizontal:14,paddingVertical:9,backgroundColor:COLORS.card,color:COLORS.text,fontSize:16,marginBottom:12},
  filterTag: {paddingHorizontal:14,paddingVertical:6,borderRadius:116,borderWidth:0.5,borderColor:COLORS.border,backgroundColor:COLORS.card,marginRight:7},
  filterTagActive: {backgroundColor:COLORS.accentLight,borderColor:COLORS.accent},
  filterTagText: {fontSize:14,color:COLORS.textSecondary},
  filterTagTextActive: {color:COLORS.accent},
  exRow: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12},
  exRowBorder: {borderBottomWidth:0.5,borderBottomColor:COLORS.border},
  exGrid: {flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:5},
  exGridCard: {width:'47%',backgroundColor:COLORS.bg,borderRadius:14,padding:14,alignItems:'center',borderWidth:0.5,borderColor:COLORS.border},
  exGridImgWrap: {width:94,height:94,borderRadius:14,backgroundColor:'#1E1E1E',alignItems:'center',justifyContent:'center',marginBottom:9},
  exGridName: {fontSize:15,fontWeight:'500',color:COLORS.text,textAlign:'center',marginBottom:2},
  exGridSub: {fontSize:13,color:COLORS.textMuted,textAlign:'center'},
  barRow: {flexDirection:'row',alignItems:'center',marginBottom:7},
  barLabel: {fontSize:13,color:COLORS.textSecondary,width:70},
  barWrap: {flex:1,backgroundColor:'#1E1E1E',borderRadius:5,height:26,overflow:'hidden'},
  barFill: {height:'100%',borderRadius:5,justifyContent:'center',paddingLeft:7},
  barText: {fontSize:13,color:COLORS.accent,fontWeight:'500'},
  navbar: {flexDirection:'row',borderTopWidth:0.5,borderTopColor:COLORS.border,backgroundColor:COLORS.card,paddingBottom:20,paddingTop:9},
  navTab: {flex:1,alignItems:'center'},
  navIcon: {fontSize:26,opacity:0.5},
  navLabel: {fontSize:13,color:COLORS.textMuted,marginTop:2},
  modalBackdrop: {position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'},
  modal: {backgroundColor:COLORS.card,borderTopLeftRadius:16,borderTopRightRadius:16,padding:23,maxHeight:'75%'},
  dropdownMenu: {marginTop:9,backgroundColor:'#222',borderRadius:12,borderWidth:0.5,borderColor:COLORS.border,overflow:'hidden'},
  dropdownItem: {paddingVertical:14,paddingHorizontal:16},
  dropdownItemText: {fontSize:16,color:COLORS.text},
  dropdownDivider: {height:0.5,backgroundColor:COLORS.border},
  muscleGroupHeader: {flexDirection:'row',alignItems:'center',backgroundColor:COLORS.card,borderRadius:14,padding:16,marginBottom:0,borderWidth:0.5,borderColor:COLORS.border,borderLeftWidth:0,gap:14},
  muscleGroupName: {fontSize:23,fontWeight:'600',color:COLORS.text},
  muscleIconWrap: {width:152,height:152,borderRadius:47,alignItems:'center',justifyContent:'center',backgroundColor:'transparent'},
  muscleIconWrapSmall: {width:82,height:82,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'transparent'},
  backBtn: {paddingVertical:7,paddingHorizontal:14,borderRadius:9,backgroundColor:COLORS.card,borderWidth:0.5,borderColor:COLORS.border},
  backBtnText: {color:COLORS.accent,fontSize:16,fontWeight:'500'},
  gymPill: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:COLORS.card,borderRadius:9,paddingVertical:12,paddingHorizontal:14,marginBottom:14,borderWidth:0.5,borderColor:COLORS.border},
  gymPillText: {color:COLORS.text,fontSize:16},
  gymRow: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:14,borderBottomWidth:0.5,borderBottomColor:COLORS.border},
  favCard: {width:187,backgroundColor:COLORS.card,borderRadius:14,padding:16,marginRight:12,borderWidth:0.5,borderColor:COLORS.border},
  favCardName: {fontSize:18,fontWeight:'600',color:COLORS.text},
  lastSessionHint: {fontSize:13,color:COLORS.textMuted,marginLeft:28,marginTop:-2},
  warmupBadge: {width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:COLORS.border,alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:COLORS.card},
  warmupBadgeActive: {backgroundColor:'#3A2E0A',borderColor:'#EAB308'},
  warmupBadgeText: {fontSize:13,fontWeight:'600',color:COLORS.textMuted},
  warmupBadgeTextActive: {color:'#EAB308'},
  setInputWarmup: {borderColor:'#EAB308',backgroundColor:'#1A1608'},
  warmupBadgeIdle: {borderColor:'#5A4A1A'},
  warmupBadgeTextIdle: {color:'#EAB308'},
  unilateralBadge: {width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:'#3A2E5A',alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:COLORS.card},
  unilateralBadgeText: {fontSize:13,fontWeight:'600',color:'#8B5CF6'},
  unilateralBadgeActive: {backgroundColor:'#1E1A3A',borderColor:'#8B5CF6'},
  unilateralBadgeTextActive: {color:'#8B5CF6'},
  unilateralBadgeBorder: {borderColor:'#3A2E5A'},
  wordBadge: {paddingHorizontal:14,paddingVertical:8,borderRadius:8,borderWidth:0.5,borderColor:COLORS.border,alignItems:'center',justifyContent:'center',marginRight:8,backgroundColor:COLORS.card},
  wordBadgeText: {fontSize:13,fontWeight:'600',color:COLORS.textMuted},
  partialsBadgeIdle: {borderColor:'#1E4A5A'},
  partialsBadgeTextIdle: {color:'#22D3EE'},
  partialsBadgeActive: {backgroundColor:'#0A2E38',borderColor:'#22D3EE'},
  partialsBadgeTextActive: {color:'#22D3EE'},
  myoBadgeIdle: {borderColor:'#5A1A3A'},
  myoBadgeTextIdle: {color:'#F472B6'},
  myoBadgeActive: {backgroundColor:'#3A0A22',borderColor:'#F472B6'},
  myoBadgeTextActive: {color:'#F472B6'},
  swapBtn: {alignSelf:'flex-start',marginTop:7,paddingVertical:5,paddingHorizontal:12,borderRadius:7,backgroundColor:COLORS.card,borderWidth:0.5,borderColor:COLORS.border,marginLeft:28},
  swapBtnText: {color:COLORS.accent,fontSize:14,fontWeight:'500'},
  checkBadge: {width:33,height:33,borderRadius:7,borderWidth:0.5,borderColor:COLORS.border,alignItems:'center',justifyContent:'center',marginRight:5,backgroundColor:COLORS.card},
  checkBadgeActive: {backgroundColor:'#0E3A26',borderColor:COLORS.success},
  checkBadgeText: {fontSize:15,fontWeight:'700',color:COLORS.textMuted},
  checkBadgeTextActive: {color:COLORS.success},
});