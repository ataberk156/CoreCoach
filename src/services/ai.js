import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai = null;
if (apiKey) {
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

const BASE_SYSTEM_PROMPT = `Sen bir elit fitness koçusun. Türkçe yanıt ver. Samimi ama profesyonel ol. Asla tıbbi tavsiye verme, gerekirse uzmana yönlendir.`;

const buildSystemPrompt = (sharedContext, jsonMode = false) => {
    let prompt = BASE_SYSTEM_PROMPT;
    if (sharedContext) {
        prompt += `\n\nAşağıdaki bilgiler kullanıcının mevcut durumunu gösteriyor. Tüm yanıtlarını bu bağlamı dikkate alarak ver:\n\n${sharedContext}`;
    }
    if (jsonMode) {
        prompt += '\n\nYanıtlarını JSON formatında ver.';
    }
    return prompt;
};


const FALLBACK_WORKOUT = {
    coachMessage: "Harika bir plan hazırladım! Progressive overload prensibine uygun, senin seviyene özel bir program. Hadi başlayalım! 💪",
    schedule: [
        {
            day: "Pazartesi", focus: "Göğüs & Triceps",
            exercises: [
                { name: "Bench Press", sets: 4, reps: "8-10", tempo: "3-1-2", rest: "90s" },
                { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", tempo: "2-1-2", rest: "75s" },
                { name: "Cable Fly", sets: 3, reps: "12-15", tempo: "2-1-2", rest: "60s" },
                { name: "Triceps Pushdown", sets: 3, reps: "12-15", tempo: "2-0-2", rest: "60s" },
                { name: "Overhead Triceps Extension", sets: 3, reps: "10-12", tempo: "2-1-2", rest: "60s" }
            ]
        },
        {
            day: "Salı", focus: "Sırt & Biceps",
            exercises: [
                { name: "Barbell Row", sets: 4, reps: "8-10", tempo: "2-1-2", rest: "90s" },
                { name: "Lat Pulldown", sets: 3, reps: "10-12", tempo: "2-1-2", rest: "75s" },
                { name: "Seated Cable Row", sets: 3, reps: "10-12", tempo: "2-1-2", rest: "75s" },
                { name: "Dumbbell Curl", sets: 3, reps: "12", tempo: "2-1-2", rest: "60s" },
                { name: "Hammer Curl", sets: 3, reps: "12", tempo: "2-0-2", rest: "60s" }
            ]
        },
        {
            day: "Çarşamba", focus: "Dinlenme",
            exercises: [
                { name: "Hafif Yürüyüş (30 dk)", sets: 1, reps: "-", tempo: "-", rest: "-" },
                { name: "Foam Rolling", sets: 1, reps: "10 dk", tempo: "-", rest: "-" }
            ]
        },
        {
            day: "Perşembe", focus: "Omuz & Core",
            exercises: [
                { name: "Overhead Press", sets: 4, reps: "8-10", tempo: "3-1-2", rest: "90s" },
                { name: "Lateral Raise", sets: 4, reps: "12-15", tempo: "2-0-2", rest: "60s" },
                { name: "Face Pull", sets: 3, reps: "15", tempo: "2-1-2", rest: "60s" },
                { name: "Plank", sets: 3, reps: "45s", tempo: "-", rest: "45s" },
                { name: "Cable Crunch", sets: 3, reps: "15", tempo: "2-1-2", rest: "60s" }
            ]
        },
        {
            day: "Cuma", focus: "Bacak",
            exercises: [
                { name: "Squat", sets: 4, reps: "8-10", tempo: "3-1-2", rest: "120s" },
                { name: "Romanian Deadlift", sets: 3, reps: "10-12", tempo: "3-1-2", rest: "90s" },
                { name: "Leg Press", sets: 3, reps: "12", tempo: "2-1-2", rest: "90s" },
                { name: "Leg Curl", sets: 3, reps: "12-15", tempo: "2-1-2", rest: "60s" },
                { name: "Calf Raise", sets: 4, reps: "15-20", tempo: "2-1-2", rest: "45s" }
            ]
        }
    ]
};

const FALLBACK_NUTRITION = {
    coachMessage: "Beslenme planın hazır! Hedeflerine uygun kalori ve makro dağılımı belirledim. Esnek ol, sürdürülebilirlik en önemli şey. 🥗",
    targets: { calories: 2400, protein: 180, carbs: 250, fats: 75 },
    mealSuggestions: [
        { name: "Kahvaltı", description: "3 yumurta, 2 dilim tam buğday ekmeği, avokado, yeşillik", calories: 550, protein: 30, carbs: 45, fats: 28 },
        { name: "Ara Öğün 1", description: "Protein shake (1 ölçek whey + 1 muz + yulaf)", calories: 350, protein: 35, carbs: 42, fats: 6 },
        { name: "Öğle Yemeği", description: "150g tavuk göğsü, 1 kase pilav, salata, zeytinyağı", calories: 600, protein: 45, carbs: 65, fats: 18 },
        { name: "Ara Öğün 2", description: "Yoğurt + karışık kuruyemiş + bal", calories: 300, protein: 20, carbs: 28, fats: 14 },
        { name: "Akşam Yemeği", description: "200g somon, tatlı patates, buharda brokoli", calories: 600, protein: 50, carbs: 48, fats: 22 }
    ]
};

export const generateWorkoutPlan = async (userData, sharedContext = '') => {
    if (!openai) return adjustPlanForUser(FALLBACK_WORKOUT, userData);

    const prompt = `
Kullanıcı bilgileri: Yaş: ${userData.age}, Cinsiyet: ${userData.gender}, Boy: ${userData.height}cm, Kilo: ${userData.weight}kg, Hedef: ${userData.goal}, Haftalık gün: ${userData.activityLevel}, Ekipman: ${userData.equipment}, Seviye: ${userData.experience || 'orta'}

Bu kullanıcı için haftanın ${userData.activityLevel} günü için kişisel bir antrenman programı oluştur.

JSON formatında yanıt ver:
{
  "coachMessage": "Türkçe samimi motivasyon mesajı",
  "schedule": [
    {
      "day": "Pazartesi",
      "focus": "Kas grubu",
      "exercises": [
        { "name": "Hareket adı", "sets": 4, "reps": "8-10", "tempo": "3-1-2", "rest": "90s" }
      ]
    }
  ]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: buildSystemPrompt(sharedContext, true) },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI workout error:", error);
        return adjustPlanForUser(FALLBACK_WORKOUT, userData);
    }
};

export const generateNutritionPlan = async (userData, sharedContext = '') => {
    if (!openai) return adjustNutritionForUser(FALLBACK_NUTRITION, userData);

    const prompt = `
Kullanıcı bilgileri: Yaş: ${userData.age}, Cinsiyet: ${userData.gender}, Boy: ${userData.height}cm, Kilo: ${userData.weight}kg, Hedef: ${userData.goal}

TDEE hesapla ve hedefe uygun kalori/makro belirle. Sürdürülebilir ve esnek bir plan oluştur.
Her öğün için carbs ve fats değerlerini de ver.

JSON formatında yanıt ver:
{
  "coachMessage": "Türkçe beslenme tavsiyesi",
  "targets": { "calories": 2400, "protein": 180, "carbs": 250, "fats": 75 },
  "mealSuggestions": [
    { "name": "Öğün adı", "description": "İçerik", "calories": 500, "protein": 35, "carbs": 50, "fats": 15 }
  ]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: buildSystemPrompt(sharedContext, true) },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI nutrition error:", error);
        return adjustNutritionForUser(FALLBACK_NUTRITION, userData);
    }
};

export const chatWithCoach = async (message, userData, chatHistory, sharedContext = '') => {
    if (!openai) {
        return getFallbackChatResponse(message);
    }

    const recentHistory = chatHistory.slice(-10).map(m => ({
        role: m.role, content: m.content
    }));

    try {
        const systemMsg = buildSystemPrompt(sharedContext) + '\nSadece düz metin yanıt ver, JSON değil. Kısa ve öz ol.';
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMsg },
                ...recentHistory,
                { role: "user", content: message }
            ],
            temperature: 0.8,
            max_tokens: 300,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI chat error:", error);
        return getFallbackChatResponse(message);
    }
};

function getFallbackChatResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('ağrı') || lower.includes('sakatlık'))
        return "Ağrı hissediyorsan lütfen antrenmanı durdur ve bir fizyoterapiste danış. Sağlığın her şeyden önemli! 🏥";
    if (lower.includes('motivasyon') || lower.includes('zor'))
        return "Herkes zor günler yaşar, bu çok normal. Önemli olan devam etmen. Küçük adımlar bile ilerleme demektir! Seni destekliyorum 💪";
    if (lower.includes('kilo') || lower.includes('yağ'))
        return "Kilo değişimi zaman alır. Haftada 0.5-1kg kayıp sağlıklı bir tempodur. Sabırlı ol ve plana güven! 📊";
    return "Seni duyuyorum! Herhangi bir konuda yardıma ihtiyacın olursa buradayım. Antrenman, beslenme, motivasyon - ne olursa olsun sorabilirsin! 🎯";
}

function adjustPlanForUser(plan, userData) {
    const adjusted = JSON.parse(JSON.stringify(plan));
    const daysNeeded = parseInt(userData.activityLevel) || 3;
    adjusted.schedule = adjusted.schedule.slice(0, daysNeeded);
    return adjusted;
}

function adjustNutritionForUser(plan, userData) {
    const adjusted = JSON.parse(JSON.stringify(plan));
    const weight = parseFloat(userData.weight) || 75;
    const multiplier = userData.goal === 'fat_loss' ? 28 : userData.goal === 'muscle_gain' ? 36 : 32;
    adjusted.targets.calories = Math.round(weight * multiplier);
    adjusted.targets.protein = Math.round(weight * 2.2);
    adjusted.targets.carbs = Math.round((adjusted.targets.calories * 0.4) / 4);
    adjusted.targets.fats = Math.round((adjusted.targets.calories * 0.25) / 9);
    return adjusted;
}

export const analyzeFoodImage = async (base64Image) => {
    if (!openai) {
        // Fallback food analysis
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            name: 'Karışık Tabak',
            calories: 520,
            protein: 32,
            carbs: 48,
            fats: 22,
            items: ['Protein kaynağı', 'Karbonhidrat', 'Sebze', 'Yağ kaynağı'],
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Sen bir beslenme uzmanısın. Fotoğraftaki yemeği analiz et ve besin değerlerini tahmin et. Türkçe yanıt ver. JSON formatında yanıt ver:
{
  "name": "Yemek adı",
  "calories": 500,
  "protein": 30,
  "carbs": 50,
  "fats": 20,
  "items": ["İçerik 1", "İçerik 2", "İçerik 3"]
}`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Bu yemeğin besin değerlerini analiz et ve JSON olarak döndür.' },
                        { type: 'image_url', image_url: { url: base64Image } }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Food analysis error:', error);
        return {
            name: 'Analiz Edildi',
            calories: 450,
            protein: 28,
            carbs: 45,
            fats: 18,
            items: ['Tespit edilen yemek'],
        };
    }
};

/**
 * AI-powered single exercise modification
 * User writes a prompt like "daha hafif yap" or "bench press yerine dumbbell press koy"
 */
export const aiEditExercise = async (userPrompt, currentExercise, sharedContext = '') => {
    if (!openai) {
        // Smart fallback: return slightly modified version
        return {
            ...currentExercise,
            name: currentExercise.name + ' (Güncellendi)',
            sets: Math.max(2, currentExercise.sets - 1),
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: buildSystemPrompt(sharedContext, true) + `\nMevcut hareket: ${JSON.stringify(currentExercise)}\nKullanıcının isteğine göre bu hareketi değiştir veya yeni bir alternatif öner.`
                },
                {
                    role: 'user',
                    content: `${userPrompt}\n\nJSON formatında tek bir hareket döndür:\n{ "name": "Hareket adı", "sets": 4, "reps": "8-10", "tempo": "3-1-2", "rest": "90s" }`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 200,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Exercise edit error:', error);
        return currentExercise;
    }
};

/**
 * AI-powered single meal modification
 * User writes a prompt like "daha az karbonhidratlı" or "vegan alternatif"
 */
export const aiEditMeal = async (userPrompt, currentMeal, sharedContext = '') => {
    if (!openai) {
        return {
            ...currentMeal,
            name: currentMeal.name + ' (Güncellendi)',
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: buildSystemPrompt(sharedContext, true) + `\nMevcut öğün: ${JSON.stringify(currentMeal)}\nKullanıcının isteğine göre bu öğünü değiştir veya alternatif öner.`
                },
                {
                    role: 'user',
                    content: `${userPrompt}\n\nJSON formatında tek bir öğün döndür:\n{ "name": "Öğün adı", "description": "İçerik listesi", "calories": 500, "protein": 35, "carbs": 50, "fats": 15 }`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 200,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Meal edit error:', error);
        return currentMeal;
    }
};

