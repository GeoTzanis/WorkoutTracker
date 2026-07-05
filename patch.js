const fs = require('fs');
let c = fs.readFileSync('App.js', 'utf8');

// Add saveProfile, toggleDarkMode, resetAllData
c = c.replace(
  'const startWorkout = () => {',
  `const saveProfile = (p) => { setProfile(p); AsyncStorage.setItem('profile', JSON.stringify(p)); };
  const toggleDarkMode = (val) => { setDarkMode(val); AsyncStorage.setItem('darkMode', JSON.stringify(val)); };
  const resetAllData = () => {
    setWorkouts([]); setExercises([]); setGyms([]); setFavorites([]); setMachines([]);
    setNextWorkoutId(1); setNextExId(1); setNextGymId(1); setNextFavId(1); setNextMachineId(1);
    setShowResetConfirm(false);
    AsyncStorage.multiRemove(['workouts','exercises','gyms','favorites','machines','nextWorkoutId','nextExId','nextGymId','nextFavId','nextMachineId']);
  };
  const startWorkout = () => {`
);

// Load darkMode and profile from storage
c = c.replace(
  "if (savedMachines) setMachines(JSON.parse(savedMachines));",
  `if (savedMachines) setMachines(JSON.parse(savedMachines));
        const savedProfile = await AsyncStorage.getItem('profile');
        const savedDarkMode = await AsyncStorage.getItem('darkMode');
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));`
);

// Add renderSettings before renderLog
const settingsPage = `
  const renderSettings = () => (
    <ScrollView style={[s.page, {backgroundColor: C.bg}]}>
      <View style={s.rowBetween}>
        <TouchableOpacity onPress={() => setPage('dashboard')} style={s.backBtn}>
          <Text style={s.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[s.pageTitle, {color: C.text}]}>Settings</Text>
        <View style={{width:60}}/>
      </View>

      <View style={[s.card, {backgroundColor: C.card}]}>
        <Text style={[s.sectionTitle, {color: C.text, marginBottom:12}]}>Profile</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:0.5,borderBottomColor:C.border}}>
          <Text style={{fontSize:16,color:C.text}}>Name</Text>
          <TextInput style={{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:12,paddingVertical:8,color:C.text,fontSize:16,minWidth:140,textAlign:'right',backgroundColor:C.bg}} value={profile.name} onChangeText={t=>saveProfile({...profile,name:t})} placeholder="Your name" placeholderTextColor={C.textMuted}/>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:0.5,borderBottomColor:C.border}}>
          <Text style={{fontSize:16,color:C.text}}>Gender</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {['Male','Female','Other'].map(g=>(
              <TouchableOpacity key={g} onPress={()=>saveProfile({...profile,gender:g})} style={[s.filterTag,profile.gender===g&&s.filterTagActive,{borderColor:profile.gender===g?C.accent:C.border}]}>
                <Text style={[s.filterTagText,profile.gender===g&&s.filterTagTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:0.5,borderBottomColor:C.border}}>
          <Text style={{fontSize:16,color:C.text}}>Bodyweight ({profile.unit||'kg'})</Text>
          <TextInput style={{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:12,paddingVertical:8,color:C.text,fontSize:16,minWidth:100,textAlign:'right',backgroundColor:C.bg}} value={String(profile.weight)} onChangeText={t=>saveProfile({...profile,weight:t})} placeholder="0" placeholderTextColor={C.textMuted} keyboardType="decimal-pad"/>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12}}>
          <Text style={{fontSize:16,color:C.text}}>Height (cm)</Text>
          <TextInput style={{borderWidth:0.5,borderColor:C.border,borderRadius:9,paddingHorizontal:12,paddingVertical:8,color:C.text,fontSize:16,minWidth:100,textAlign:'right',backgroundColor:C.bg}} value={String(profile.height)} onChangeText={t=>saveProfile({...profile,height:t})} placeholder="0" placeholderTextColor={C.textMuted} keyboardType="decimal-pad"/>
        </View>
      </View>

      <View style={[s.card, {backgroundColor: C.card}]}>
        <Text style={[s.sectionTitle, {color: C.text, marginBottom:12}]}>Preferences</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:0.5,borderBottomColor:C.border}}>
          <Text style={{fontSize:16,color:C.text}}>Units</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {['kg','lbs'].map(u=>(
              <TouchableOpacity key={u} onPress={()=>saveProfile({...profile,unit:u})} style={[s.filterTag,profile.unit===u&&s.filterTagActive,{borderColor:profile.unit===u?C.accent:C.border}]}>
                <Text style={[s.filterTagText,profile.unit===u&&s.filterTagTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12}}>
          <Text style={{fontSize:16,color:C.text}}>Dark mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{true:C.accent}} thumbColor={C.white}/>
        </View>
      </View>

      <View style={[s.card, {backgroundColor: C.card}]}>
        <Text style={[s.sectionTitle, {color: C.text, marginBottom:12}]}>Data</Text>
        <TouchableOpacity style={[s.primaryBtn,{alignItems:'center',backgroundColor:C.danger}]} onPress={()=>setShowResetConfirm(true)}>
          <Text style={s.primaryBtnText}>Reset all data</Text>
        </TouchableOpacity>
      </View>
      <View style={{height:20}}/>
    </ScrollView>
  );

`;

c = c.replace('  const renderLog = () => {', settingsPage + '  const renderLog = () => {');

// Add C variable after darkMode state
c = c.replace(
  "const [darkMode, setDarkMode] = useState(true);",
  "const [darkMode, setDarkMode] = useState(true);\n  const C = darkMode ? DARK : LIGHT;"
);

// Add Switch to imports
c = c.replace(
  "import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Switch } from 'react-native';",
  "import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Switch } from 'react-native';"
);

// Add settings button to dashboard and settings page render
c = c.replace(
  "<Text style={s.pageTitle}>Dashboard</Text>",
  `<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:19}}>
        <Text style={[s.pageTitle,{marginBottom:0}]}>Dashboard</Text>
        <TouchableOpacity onPress={()=>setPage('settings')} style={{padding:8}}>
          <Text style={{color:C.text,fontSize:22}}>☰</Text>
        </TouchableOpacity>
      </View>`
);

// Add settings render and reset confirm modal
c = c.replace(
  "{page==='dashboard'&&renderDashboard()}",
  "{page==='dashboard'&&renderDashboard()}\n      {page==='settings'&&renderSettings()}"
);

// Add reset confirm modal
c = c.replace(
  "<FavoritesBuilderModal",
  `<ConfirmModal visible={showResetConfirm} title="Reset all data?" message="This will permanently delete all your workouts, exercises, gyms and favorites." confirmLabel="Reset" onConfirm={resetAllData} onCancel={()=>setShowResetConfirm(false)}/>
      <FavoritesBuilderModal`
);

// Hide navbar on settings page
c = c.replace(
  "<View style={[s.navbar,{display: anyModalOpen ? 'none' : 'flex'}]}>",
  "<View style={[s.navbar,{display: anyModalOpen||page==='settings' ? 'none' : 'flex'}]}>"
);

fs.writeFileSync('App.js', c);
console.log('All done! Lines:', c.split('\n').length);