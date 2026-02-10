/**
 * Shared AI Context / Memory System
 * 
 * All AI modules share a unified context containing:
 * - User profile (age, weight, goals, experience)
 * - Current workout plan summary
 * - Current nutrition plan summary
 * - Recent progress data
 * - Recent chat history
 * - Scanned meal history
 * 
 * This ensures every AI response is aware of the full picture.
 */

export const buildSharedContext = (user, plans, progress, chatHistory, scannedMeals) => {
    const sections = [];

    // User Profile
    if (user) {
        sections.push(`[KULLANICI PROFİLİ]
İsim: ${user.name || '—'}, Yaş: ${user.age || '—'}, Cinsiyet: ${user.gender || '—'}
Boy: ${user.height || '—'}cm, Kilo: ${user.weight || '—'}kg
Hedef: ${user.goal || '—'}, Seviye: ${user.experience || '—'}
Haftalık antrenman günü: ${user.activityLevel || '—'}, Ekipman: ${user.equipment || '—'}`);
    }

    // Current Workout Plan
    if (plans?.workout?.schedule) {
        const schedule = plans.workout.schedule;
        const summary = schedule.map(d => `${d.day}: ${d.focus} (${d.exercises?.length || 0} hareket)`).join(', ');
        sections.push(`[ANTRENMAN PLANI]
Program: ${summary}
Toplam gün: ${schedule.length}`);
    }

    // Current Nutrition Plan
    if (plans?.nutrition?.targets) {
        const t = plans.nutrition.targets;
        sections.push(`[BESLENME PLANI]
Kalori hedefi: ${t.calories}kcal, Protein: ${t.protein}g, Karb: ${t.carbs}g, Yağ: ${t.fats}g
Öğün sayısı: ${plans.nutrition.mealSuggestions?.length || 0}`);
    }

    // Recent Progress
    if (progress && progress.length > 0) {
        const recent = progress.slice(-5);
        const latest = recent[recent.length - 1];
        const first = progress[0];
        sections.push(`[İLERLEME VERİLERİ]
Toplam kayıt: ${progress.length}
Son kilo: ${latest.weight || '—'}kg, İlk kilo: ${first.weight || '—'}kg
Son ölçümler - Bel: ${latest.waist || '—'}cm, Kol: ${latest.arm || '—'}cm`);
    }

    // Scanned Meals Today
    if (scannedMeals && scannedMeals.length > 0) {
        const totalCal = scannedMeals.reduce((a, m) => a + (m.calories || 0), 0);
        const totalProtein = scannedMeals.reduce((a, m) => a + (m.protein || 0), 0);
        sections.push(`[BUGÜN TÜKETİLEN (Taranan)]
${scannedMeals.length} öğün tarandi, toplam: ${totalCal}kcal, ${totalProtein}g protein
Son taranan: ${scannedMeals[scannedMeals.length - 1].name || '—'}`);
    }

    // Recent Chat Summary (last 3 messages for context)
    if (chatHistory && chatHistory.length > 0) {
        const recent = chatHistory.slice(-4);
        const summary = recent.map(m => `${m.role === 'user' ? 'Kullanıcı' : 'Koç'}: ${m.content.slice(0, 80)}`).join('\n');
        sections.push(`[SON SOHBET]
${summary}`);
    }

    return sections.join('\n\n');
};

/**
 * Generate food image search URL using free stock photo APIs
 * Uses multiple sources for reliability
 */
export const getFoodImageUrl = (foodName) => {
    if (!foodName) return null;
    // Clean the food name for URL
    const query = encodeURIComponent(foodName.replace(/[()]/g, '').trim());
    // Use Unsplash Source API (free, no key needed)
    return `https://source.unsplash.com/400x300/?${query},food,meal`;
};

/**
 * Get multiple food image URLs for meal suggestions
 */
export const getMealImages = (meals) => {
    if (!meals || !Array.isArray(meals)) return {};
    const images = {};
    meals.forEach((meal, i) => {
        // Use the meal name for image search
        const searchTerm = meal.name || meal.description?.split(',')[0] || 'healthy food';
        images[i] = getFoodImageUrl(searchTerm);
    });
    return images;
};

/**
 * Predefined reliable food images for common meal types
 * Fallback when API search might not work
 */
export const MEAL_IMAGES = {
    'Kahvaltı': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
    'Ara Öğün': 'https://images.unsplash.com/photo-1622485831930-34623dadd2e3?w=400&h=300&fit=crop',
    'Öğle Yemeği': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    'Akşam Yemeği': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    'Protein shake': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
    'Tavuk': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    'Somon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    'Yulaf': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop',
    'Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'Yoğurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    'Yumurta': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
    'Pilav': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
};

/**
 * Find the best matching image for a meal
 */
export const getMealImage = (mealName) => {
    if (!mealName) return MEAL_IMAGES['Öğle Yemeği'];
    const lower = mealName.toLowerCase();
    for (const [key, url] of Object.entries(MEAL_IMAGES)) {
        if (lower.includes(key.toLowerCase())) return url;
    }
    // Fallback: use Unsplash search
    return getFoodImageUrl(mealName);
};
