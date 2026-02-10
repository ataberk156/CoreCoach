import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ==================== AUTH ====================

export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};

// ==================== PROFILE ====================

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

export const upsertProfile = async (userId, profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            name: profileData.name,
            age: profileData.age ? parseInt(profileData.age) : null,
            gender: profileData.gender,
            height: profileData.height ? parseFloat(profileData.height) : null,
            weight: profileData.weight ? parseFloat(profileData.weight) : null,
            goal: profileData.goal,
            activity_level: profileData.activityLevel ? parseInt(profileData.activityLevel) : 3,
            experience: profileData.experience || 'orta',
            equipment: profileData.equipment || 'gym',
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Convert DB row to app format
const profileToUser = (row) => {
    if (!row) return null;
    return {
        name: row.name,
        age: row.age,
        gender: row.gender,
        height: row.height,
        weight: row.weight,
        goal: row.goal,
        activityLevel: row.activity_level,
        experience: row.experience,
        equipment: row.equipment,
    };
};

export { profileToUser };

// ==================== WORKOUT PLANS ====================

export const getWorkoutPlan = async (userId) => {
    const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return { coachMessage: data.coach_message, schedule: data.schedule };
};

export const saveWorkoutPlan = async (userId, plan) => {
    // Delete old plans first
    await supabase.from('workout_plans').delete().eq('user_id', userId);
    const { data, error } = await supabase
        .from('workout_plans')
        .insert({
            user_id: userId,
            coach_message: plan.coachMessage,
            schedule: plan.schedule,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

// ==================== NUTRITION PLANS ====================

export const getNutritionPlan = async (userId) => {
    const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return {
        coachMessage: data.coach_message,
        targets: data.targets,
        mealSuggestions: data.meal_suggestions,
    };
};

export const saveNutritionPlan = async (userId, plan) => {
    await supabase.from('nutrition_plans').delete().eq('user_id', userId);
    const { data, error } = await supabase
        .from('nutrition_plans')
        .insert({
            user_id: userId,
            coach_message: plan.coachMessage,
            targets: plan.targets,
            meal_suggestions: plan.mealSuggestions,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

// ==================== PROGRESS ====================

export const getProgressEntries = async (userId) => {
    const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
        weight: row.weight,
        chest: row.chest,
        waist: row.waist,
        arm: row.arm,
        neck: row.neck,
        hips: row.hips,
        note: row.note,
        date: row.created_at,
    }));
};

export const addProgressEntryDB = async (userId, entry) => {
    const { data, error } = await supabase
        .from('progress_entries')
        .insert({
            user_id: userId,
            weight: entry.weight ? parseFloat(entry.weight) : null,
            chest: entry.chest ? parseFloat(entry.chest) : null,
            waist: entry.waist ? parseFloat(entry.waist) : null,
            arm: entry.arm ? parseFloat(entry.arm) : null,
            neck: entry.neck ? parseFloat(entry.neck) : null,
            hips: entry.hips ? parseFloat(entry.hips) : null,
            note: entry.note || null,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

// ==================== CHAT ====================

export const getChatMessages = async (userId) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
        role: row.role,
        content: row.content,
        timestamp: row.created_at,
    }));
};

export const addChatMessageDB = async (userId, message) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            user_id: userId,
            role: message.role,
            content: message.content,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

// ==================== SCANNED MEALS ====================

export const getScannedMeals = async (userId) => {
    const { data, error } = await supabase
        .from('scanned_meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const addScannedMealDB = async (userId, meal) => {
    const { data, error } = await supabase
        .from('scanned_meals')
        .insert({
            user_id: userId,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            items: meal.items || [],
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};
