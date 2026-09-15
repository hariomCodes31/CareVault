// Guided intake only: free text is recorded verbatim, never interpreted as a diagnosis.
export const STEPS = ['danger', 'symptoms', 'category', 'duration', 'severity', 'age', 'medicines', 'history', 'risk', 'worsening'];
export const QUESTIONS = {
 danger: 'Before we start: are any of the emergency signs listed above present?',
 symptoms: 'What is troubling you? Describe where it hurts, other symptoms, and what makes it better or worse.',
 category: 'Which group best describes your main symptom? Choose Other if none fits.',
 duration: 'When did it begin? Include days/weeks, whether it was sudden, and whether it has happened before.',
 severity: 'How much is it affecting your daily activities?',
 age: 'Which age group are you in?',
 medicines: 'What medicines have you taken recently or in the past for this problem? Mention allergies or reactions. Write None if none.',
 history: 'Any long-term conditions, recent injury, pregnancy/recent delivery, surgery, or other relevant history? Write None if none.',
 risk: 'Are you pregnant/recently gave birth, recently injured, immunocompromised, or living with a long-term medical condition?',
 worsening: 'Before the summary: is the problem getting worse, or have any emergency signs appeared?',
};
export const OPTIONS = {
 danger: [['yes','Yes / हाँ'],['no','No / नहीं'],['unsure','Not sure / पता नहीं']],
 category: [['cough','Cough / खाँसी'],['headache','Headache / सिरदर्द'],['stomach','Vomiting or diarrhoea / उल्टी या दस्त'],['other','Other / अन्य']],
 severity: [['mild','Mild: daily activities possible / हल्की'],['moderate','Moderate: activities affected / मध्यम'],['severe','Severe: normal activities difficult / गंभीर'],['unsure','Not sure / पता नहीं']],
 age: [['child','Under 18 / 18 से कम'],['adult','18–64'],['older','65 or older / 65 या अधिक'],['unsure','Prefer not to say / बताना नहीं चाहते']],
 risk: [['yes','Yes / हाँ'],['no','No / नहीं'],['unsure','Not sure / पता नहीं']],
 worsening: [['emergency','Emergency signs present / आपात लक्षण'],['yes','Getting worse / बढ़ रही है'],['no','Not getting worse / नहीं बढ़ रही'],['unsure','Not sure / पता नहीं']],
};
export const EMERGENCY_SIGNS = 'Severe trouble breathing; chest pressure/pain with sweating or breathlessness; sudden face droop, one-sided weakness or speech difficulty; fainting/confusion; heavy bleeding; a sudden extremely painful headache; severe allergic swelling; immediate risk of self-harm. This list is not exhaustive.';
export const EMERGENCY_HINDI = 'साँस लेने में बहुत परेशानी; सीने में दर्द या दबाव के साथ पसीना या साँस फूलना; अचानक चेहरा टेढ़ा होना, एक तरफ कमजोरी या बोलने में दिक्कत; बेहोशी या भ्रम; बहुत खून बहना; अचानक बहुत तेज सिरदर्द; एलर्जी से गंभीर सूजन; खुद को नुकसान पहुँचाने का तत्काल खतरा। यह पूरी सूची नहीं है।';
const possibleCauses = {
 cough: 'Cough can occur with respiratory infections, allergies or reflux. These are examples, not a diagnosis or a complete list.',
 headache: 'Headache can occur with dehydration, stress, viral illness or migraine. These are examples, not a diagnosis or a complete list.',
 stomach: 'Vomiting or diarrhoea can occur with a stomach infection, food-related illness or intolerance. These are examples, not a diagnosis or a complete list.',
 other: 'There is not enough information to suggest a cause safely. A clinician needs to review your symptoms.',
};
const causesHindi = {
 cough: 'खाँसी के कारणों में श्वसन संक्रमण, एलर्जी या रिफ्लक्स हो सकते हैं। ये केवल उदाहरण हैं, निदान या पूरी सूची नहीं।',
 headache: 'सिरदर्द में पानी की कमी, तनाव, वायरल बीमारी या माइग्रेन जैसे कारण हो सकते हैं। ये केवल उदाहरण हैं, निदान या पूरी सूची नहीं।',
 stomach: 'उल्टी या दस्त में पेट का संक्रमण, भोजन से बीमारी या भोजन असहिष्णुता जैसे कारण हो सकते हैं। ये केवल उदाहरण हैं, निदान या पूरी सूची नहीं।',
 other: 'सुरक्षित रूप से कारण बताने के लिए पर्याप्त जानकारी नहीं है। डॉक्टर से लक्षणों की जाँच कराएँ।',
};
export const SOURCES = [
 ['Emergency help in India', 'https://112.gov.in/'],
 ['NHS: cough', 'https://www.nhs.uk/symptoms/cough/'],
 ['NHS: headache', 'https://www.nhs.uk/symptoms/headaches/'],
 ['NHS: vomiting and diarrhoea', 'https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/'],
];
export function getChatOutcome(answers) {
 if (answers.danger === 'yes' || answers.worsening === 'emergency') return { kind: 'emergency', text: 'Get emergency help now. Call 112 in India or go to the nearest emergency department. Do not wait for this chat.', hindi: 'अभी प्रत्यक्ष चिकित्सा सहायता लें। आपातकालीन स्थिति में भारत में 112 पर कॉल करें या नज़दीकी इमरजेंसी में जाएँ। इस चैट का इंतज़ार न करें।' };
 if (answers.danger === 'unsure') return { kind: 'urgent', text: 'If an emergency sign may be present, seek urgent in-person help now. Call 112 if you may be in immediate danger.', hindi: 'अभी प्रत्यक्ष चिकित्सा सहायता लें। आपातकालीन स्थिति में भारत में 112 पर कॉल करें या नज़दीकी इमरजेंसी में जाएँ। इस चैट का इंतज़ार न करें।' };
 if (!STEPS.every(step => typeof answers[step] === 'string' && answers[step].trim())) return { kind: 'incomplete' };
 if (Object.entries(OPTIONS).some(([step, values]) => !values.some(([value]) => value === answers[step]))) return { kind: 'incomplete' };
 const urgent = answers.severity !== 'mild' || answers.worsening !== 'no' || answers.age !== 'adult' || answers.risk !== 'no';
 return {
   kind: urgent ? 'urgent' : 'review',
   text: urgent ? 'Arrange a clinical assessment today. Seek emergency help immediately if any emergency sign appears.' : 'Arrange a clinician review if symptoms persist, recur or concern you. Seek help sooner if they worsen. This chat cannot rule out a serious cause.',
   hindi: urgent ? 'आज ही डॉक्टर से जाँच कराएँ। आपात लक्षण होने पर तुरंत इमरजेंसी सहायता लें।' : 'लक्षण बने रहें, बार-बार हों या चिंता हो तो डॉक्टर से जाँच कराएँ। बढ़ने पर जल्दी सहायता लें। यह चैट गंभीर कारण को खारिज नहीं कर सकती।',
   // Only show general possibilities after completed, mild adult intake.
   possibilities: urgent ? null : possibleCauses[answers.category],
   possibilitiesHindi: urgent ? null : causesHindi[answers.category],
 };
}
