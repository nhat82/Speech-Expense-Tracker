import {useState} from 'react';
import type { FC } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import type {ListeningOptions} from 'react-speech-recognition'
import './App.css'

interface DictaphoneProps {} // Define props interface if your component will receive any props
interface ParsedExpense {
  category: string
  amount: number
}
interface Expense {
  id: string
  amount: number
  category: string
  date: string
}

const Dictaphone: FC<DictaphoneProps> = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const categories = ["groceries", "rent", "entertainment", "gas"]
  const [parsedExpense, setParsedExpense] =  useState<ParsedExpense | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [id, setId] = useState(1)
  const [editAmt,setEditAmt] = useState<number | null>(null)
  const [editCat,setEditCat] = useState<string>('')

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Type assertion for startListening and stopListening options if you were to pass them
  // For the current use case, we are calling them without options directly.
  const handleStartListening = () => {
    console.log("Start button clicked");
    try {
      SpeechRecognition.startListening({ continuous: true });
      console.log("Listening started");
    } catch (error) {
      console.error("Failed to start listening:", error);
    }
  };


  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const parseSpeech = (transcript: string): ParsedExpense | null => {
    const regex = /([\w\s]+?)\s*\$?(\d{1,3}(?:,\d{3})*)/i
    const matchResult = transcript.match(regex)

    if (!matchResult) return null

    const [, categoryFound, amountStringRaw] = matchResult
    const amountFound = amountStringRaw.replace(/,/g, '');
    const amount = parseFloat(amountFound)
    console.log("Amount parsed: " + amount)
    console.log("Found : " + categoryFound)
    const categoryMatch = categories.find(cat => cat === categoryFound);
    console.log("Matched: " + categoryMatch)
    const category = categoryMatch || "Other"
    return {category, amount}
  }

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={handleStartListening}>Start</button>
      <button onClick={handleStopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>Detected speech: {transcript}</p>
      <button onClick={() => {
          const parsed = parseSpeech(transcript)
          if (parsed){
            setParsedExpense(parsed)
            setEditAmt(parsed.amount)
            setEditCat(parsed.category)
          }
      }}
      >Parse</button>

      {parsedExpense && (
        <div style={{ marginTop: '1rem' }}>

          <label>
            Amount: 
            <input
              type="number"
              value={editAmt ?? ''}
              onChange={(e) => setEditAmt(parseFloat(e.target.value))}
              style={{ marginLeft: '4px' }}
            />
          </label>

          <br />

          <label>
            Category: 
            <input
              type="text"
              value={editCat}
              onChange={(e) => setEditCat(e.target.value)}
              style={{ marginLeft: '4px' }}
            />
          </label>
          <br />

          <button onClick={() => {
            if (editAmt !== null && editCat){
              console.log('Accepted expense:', parsedExpense);
              const newExpense: Expense = {
                id: id.toString(),
                amount: editAmt,
                category: editCat,
                date: new Date().toISOString()
              }
              setExpenses(prev => [...prev, newExpense])
              setParsedExpense(null)
              setId(prev => prev + 1)
              resetTranscript()
            }
          }}>
            Accept
          </button>

          <button onClick={() => setParsedExpense(null)}>
            Delete
          </button>

        </div>
      )}

      <div>
        <h3>Predefined Categories</h3>
        <h4>{categories.join(", ")}</h4>
        <h3>Accepted Expenses</h3>
        {expenses.map(exp => (
          <div key={exp.id}>
            {new Date(exp.date).toLocaleDateString('en-US')} - {exp.category} : ${exp.amount.toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dictaphone;