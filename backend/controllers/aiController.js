import { GoogleGenerativeAI } from '@google/generative-ai'
import DiagnosisLog from '../models/DiagnosisLog.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const symptomChecker = async (req, res) => {
  const { symptoms, age, gender, history, patientId } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a medical AI assistant. Based on the following patient info, provide a structured analysis:
        
    Patient Info:
    - Age: ${age}
    - Gender: ${gender}
    - Symptoms: ${symptoms}
    - Medical History: ${history || 'None'}

    Please respond in this exact JSON format:
    {
    "possibleConditions": ["condition1", "condition2", "condition3"],
    "riskLevel": "low/medium/high",
    "suggestedTests": ["test1", "test2"],
    "advice": "brief advice for the doctor"
    }

    Important: Only respond with the JSON, no extra text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    let aiData
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      aiData = JSON.parse(cleaned)
    } catch {
      aiData = {
        possibleConditions: ['Unable to parse'],
        riskLevel: 'medium',
        suggestedTests: [],
        advice: text
      }
    }

    // Save to DiagnosisLog
    await DiagnosisLog.create({
      patientId,
      doctorId: req.user._id,
      symptoms,
      age,
      gender,
      history,
      aiResponse: text,
      riskLevel: aiData.riskLevel,
      possibleConditions: aiData.possibleConditions,
      suggestedTests: aiData.suggestedTests
    })

    res.json({ success: true, data: aiData })

  } catch (error) {
    // Graceful fallback — AI fails but system keeps working
    console.error('AI Error:', error.message)
    res.json({
      success: false,
      message: 'AI service unavailable, please diagnose manually',
      data: null
    })
  }
}

export const prescriptionExplanation = async (req, res) => {
  const { medicines, diagnosis, instructions } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const medicineList = medicines.map(m =>
      `${m.name} - ${m.dosage} - ${m.frequency} for ${m.duration}`
    ).join('\n')

    const prompt = `Explain this prescription to a patient in simple, friendly language:

Diagnosis: ${diagnosis}
Medicines:
${medicineList}
Instructions: ${instructions}

Provide:
1. Simple explanation of what each medicine does
2. Lifestyle recommendations
3. Preventive advice
4. When to visit doctor again

Keep it simple and reassuring for the patient.`

    const result = await model.generateContent(prompt)
    res.json({ success: true, explanation: result.response.text() })

  } catch (error) {
    console.error('AI Error:', error.message)
    res.json({ success: false, explanation: null, message: 'AI explanation unavailable' })
  }
}