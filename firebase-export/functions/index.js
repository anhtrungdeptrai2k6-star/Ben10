const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenAI, Type } = require('@google/genai');

admin.initializeApp();
const db = admin.firestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.processAction = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const { saveId, action } = data;
  const saveRef = db.collection('saves').doc(saveId);
  
  return db.runTransaction(async (transaction) => {
    const saveDoc = await transaction.get(saveRef);
    if (!saveDoc.exists || saveDoc.data().userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid save');
    }

    const saveData = saveDoc.data();
    
    // Fetch recent logs
    const logsSnapshot = await transaction.get(
      db.collection(`storyLogs/${saveId}/entries`).orderBy('timestamp', 'desc').limit(20)
    );
    const logs = [];
    logsSnapshot.forEach(doc => logs.unshift(doc.data()));

    const systemPrompt = `Ngươi là Hệ Thống Omnitrix vận hành trong vũ trụ Ben 10.
Luật:
Chỉ sử dụng nhân vật, công nghệ, chủng tộc, phe phái trong Ben 10.
Không thêm sức mạnh ngoài Omnitrix.
Không phá canon trừ khi người chơi thay đổi trực tiếp.
Tạo rủi ro thật. Không cho thắng dễ.
Mỗi phản hồi phải là một JSON hợp lệ.`;
    
    const prompt = `Trạng thái: ${JSON.stringify(saveData)}\nLịch sử: ${JSON.stringify(logs)}\nHành động: ${action}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            characterUpdates: { type: Type.OBJECT },
            storyStateUpdates: { type: Type.OBJECT },
            unlockAlien: { type: Type.STRING },
            unlockUltimate: { type: Type.STRING },
            reputationChange: {
              type: Type.OBJECT,
              properties: { plumbers: { type: Type.INTEGER }, civilians: { type: Type.INTEGER } }
            },
            relationshipChanges: {
              type: Type.OBJECT,
              properties: { ben: { type: Type.INTEGER }, gwen: { type: Type.INTEGER }, kevin: { type: Type.INTEGER } }
            },
            tensionChange: { type: Type.INTEGER },
            energyChange: { type: Type.INTEGER },
            death: { type: Type.BOOLEAN }
          },
          required: ["story", "death"]
        }
      }
    });

    const result = JSON.parse(response.text);

    // Update save
    if (result.death && saveData.character.hardcoreMode) {
      transaction.delete(saveRef);
      return { story: result.story, dead: true, deleted: true };
    }

    const newEnergy = Math.max(0, Math.min(100, saveData.character.omnitrixEnergy + (result.energyChange || 0)));
    
    transaction.update(saveRef, {
      'character.omnitrixEnergy': newEnergy,
      'character.deaths': saveData.character.deaths + (result.death ? 1 : 0),
      'storyState.tensionLevel': Math.max(0, saveData.storyState.tensionLevel + (result.tensionChange || 0))
    });

    if (result.reputationChange) {
      const userRef = db.collection('users').doc(context.auth.uid);
      transaction.update(userRef, {
        'reputation.plumbers': admin.firestore.FieldValue.increment(result.reputationChange.plumbers || 0),
        'reputation.civilians': admin.firestore.FieldValue.increment(result.reputationChange.civilians || 0)
      });
    }

    const logRef = db.collection(`storyLogs/${saveId}/entries`).doc();
    transaction.set(logRef, {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      speaker: 'System',
      content: result.story
    });

    return { story: result.story, energy: newEnergy, dead: result.death };
  });
});
